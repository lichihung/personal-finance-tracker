#!/usr/bin/env node
/**
 * scripts/emulator.js
 *
 * Run from the project root:
 *   npm run emulator          — build + launch emulator + deploy app
 *   npm run build:android     — build + sync only (no emulator)
 *
 * Works on macOS and Windows. Android Studio does NOT need to be open.
 * Requires: Android SDK installed (via Android Studio or standalone).
 */

import { execSync, spawn } from "child_process"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { existsSync, writeFileSync } from "fs"
import { homedir } from "os"

const rootDir     = dirname(dirname(fileURLToPath(import.meta.url)))
const frontendDir = join(rootDir, "frontend")
const androidDir  = join(frontendDir, "android")
const PROD_API_URL = "https://personal-finance-tracker-edzo.onrender.com/api"
const APP_ID       = "com.verdia.financetracker"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function run(cmd, opts = {}) {
  console.log(`\n→ ${cmd}`)
  execSync(cmd, { stdio: "inherit", ...opts })
}

function capture(cmd, opts = {}) {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: "pipe", ...opts }).trim()
  } catch {
    return ""
  }
}

function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
}

// ─── Android SDK ──────────────────────────────────────────────────────────────

function getSdkPath() {
  for (const key of ["ANDROID_HOME", "ANDROID_SDK_ROOT"]) {
    if (process.env[key] && existsSync(process.env[key])) return process.env[key]
  }
  const candidates =
    process.platform === "win32"
      ? [join(process.env.LOCALAPPDATA || "", "Android", "Sdk")]
      : process.platform === "darwin"
      ? [join(homedir(), "Library", "Android", "sdk")]
      : [join(homedir(), "Android", "Sdk")]

  for (const p of candidates) {
    if (existsSync(p)) return p
  }
  throw new Error("Android SDK not found. Set ANDROID_HOME or install via Android Studio.")
}

function sdkBin(sdkPath, ...parts) {
  const ext = process.platform === "win32" ? ".exe" : ""
  return join(sdkPath, ...parts) + ext
}

// ─── Emulator helpers ─────────────────────────────────────────────────────────

function runningEmulators(adb) {
  return capture(`"${adb}" devices`)
    .split("\n").slice(1)
    .filter(l => l.startsWith("emulator-") && l.includes("\tdevice"))
    .map(l => l.split("\t")[0])
}

function listAvds(emulatorBin) {
  return capture(`"${emulatorBin}" -list-avds`).split("\n").filter(Boolean)
}

function waitForBoot(adb, deviceId) {
  process.stdout.write("  Booting")
  capture(`"${adb}" -s ${deviceId} wait-for-device`)
  while (true) {
    const val = capture(`"${adb}" -s ${deviceId} shell getprop sys.boot_completed`)
    if (val === "1") break
    process.stdout.write(".")
    sleep(2000)
  }
  console.log(" done!")
}

// Reset saved window position so emulator opens on-screen
function resetAvdWindowPos(avd) {
  const iniPath = join(homedir(), ".android", "avd", `${avd}.avd`, "emulator-user.ini")
  try {
    writeFileSync(iniPath, "window.x = 50\nwindow.y = 50\nwindow.scale = 0.7\n")
  } catch { /* non-fatal */ }
}

// Mirror the emulator screen via scrcpy — works even when the Qt emulator
// window hides itself to the system tray (a Windows-only issue).
function findScrcpy() {
  // Check PATH first
  const inPath = capture(process.platform === "win32" ? "where scrcpy" : "which scrcpy")
  if (inPath) return inPath.split("\n")[0].trim()
  // Fallback: known local install location
  const local = join(homedir(), "scrcpy", "scrcpy-win64-v3.1", "scrcpy.exe")
  if (existsSync(local)) return local
  return null
}

function spawnScrcpy(deviceId) {
  const scrcpyBin = findScrcpy()
  if (!scrcpyBin) {
    console.log("  scrcpy not found — emulator screen may be hidden in tray.")
    console.log("  Install: winget install Genymobile.scrcpy")
    return
  }
  spawn(scrcpyBin, ["--serial", deviceId, "--window-title", "Verdia Emulator"], {
    detached: true,
    stdio: "ignore",
    shell: false,
  }).unref()
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  const buildOnly = process.argv.includes("--build-only")

  console.log("=== Android build ===")
  console.log(`API     : ${PROD_API_URL}`)
  console.log(`Mode    : ${buildOnly ? "build + sync only" : "build + sync + emulator"}\n`)

  // 1. Build frontend
  run("npm run build", {
    cwd: frontendDir,
    env: { ...process.env, VITE_API_BASE_URL: PROD_API_URL },
  })

  // 2. Sync Capacitor
  run("npx cap sync android", { cwd: frontendDir })

  if (buildOnly) {
    console.log("\n✓ Done. Run `npm run emulator` to deploy to an emulator.\n")
    return
  }

  // 3. Find or launch emulator
  const sdkPath     = getSdkPath()
  const adb         = sdkBin(sdkPath, "platform-tools", "adb")
  const emulatorBin = sdkBin(sdkPath, "emulator", "emulator")

  let deviceId
  const running = runningEmulators(adb)

  if (running.length > 0) {
    deviceId = running[0]
    console.log(`\n✓ Emulator already running: ${deviceId}`)
    if (process.platform === "win32") {
      console.log("  Opening screen mirror (scrcpy)...")
      spawnScrcpy(deviceId)
    }
  } else {
    const avds = listAvds(emulatorBin)
    if (avds.length === 0) {
      throw new Error("No AVDs found. Create one in Android Studio → Device Manager.")
    }

    const avd = avds[0]
    console.log(`\n→ Launching emulator: ${avd}`)

    resetAvdWindowPos(avd)

    const emulatorArgs = ["-avd", avd, "-no-snapshot-load"]
    // On Windows, use -no-window to prevent Qt from hiding to the system tray.
    // scrcpy mirrors the screen instead.
    if (process.platform === "win32") emulatorArgs.push("-no-window")

    spawn(emulatorBin, emulatorArgs, {
      detached: true,
      stdio: "ignore",
    }).unref()

    // Wait for emulator to appear in adb
    process.stdout.write("  Waiting for emulator")
    while (true) {
      sleep(2000)
      process.stdout.write(".")
      const now = runningEmulators(adb)
      if (now.length > 0) { deviceId = now[0]; break }
    }
    console.log(` ${deviceId}`)

    // Wait for full Android boot
    waitForBoot(adb, deviceId)

    if (process.platform === "win32") {
      console.log("  Opening screen mirror (scrcpy)...")
      spawnScrcpy(deviceId)
      sleep(2000)
    }
  }

  // 4. Build debug APK using full path to gradlew so it works from any directory
  const gradlew = process.platform === "win32"
    ? join(androidDir, "gradlew.bat")
    : join(androidDir, "gradlew")
  const apkPath = join(androidDir, "app", "build", "outputs", "apk", "debug", "app-debug.apk")

  console.log("\n→ Building debug APK...")
  run(`"${gradlew}" assembleDebug`, { cwd: androidDir, shell: true })

  // 5. Install + launch
  console.log(`\n→ Installing on ${deviceId}...`)
  run(`"${adb}" -s ${deviceId} install -r "${apkPath}"`)

  console.log("\n→ Launching app...")
  run(`"${adb}" -s ${deviceId} shell am start -n ${APP_ID}/.MainActivity`)

  console.log("\n✓ App is running on the emulator!\n")
}

main().catch(e => {
  console.error(`\n✗ ${e.message}\n`)
  process.exit(1)
})
