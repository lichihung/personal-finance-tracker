#!/usr/bin/env node
/**
 * scripts/device.js
 *
 * Run from the project root:
 *   make run-android-device   — build + deploy app to a connected physical device
 *
 * Requires: USB debugging enabled on the device, adb authorized.
 */

import { execSync } from "child_process"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { existsSync } from "fs"
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

// ─── Device helpers ───────────────────────────────────────────────────────────

function connectedDevices(adb) {
  const lines = capture(`"${adb}" devices`).split("\n").slice(1)
  const unauthorized = lines.filter(l => l.includes("\tunauthorized")).map(l => l.split("\t")[0])
  if (unauthorized.length > 0) {
    throw new Error(
      `Device ${unauthorized[0]} is connected but not authorized.\n` +
      "  Check your phone for an 'Allow USB debugging?' prompt and tap Allow."
    )
  }
  return lines
    .filter(l => l.includes("\tdevice") && !l.startsWith("emulator-"))
    .map(l => l.split("\t")[0])
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main() {
  console.log("=== Android build (physical device) ===")
  console.log(`API : ${PROD_API_URL}\n`)

  // 1. Find connected device
  const sdkPath = getSdkPath()
  const adb     = sdkBin(sdkPath, "platform-tools", "adb")

  const devices = connectedDevices(adb)
  if (devices.length === 0) {
    throw new Error(
      "No physical device found.\n" +
      "  1. Enable USB debugging on your phone (Settings → Developer options)\n" +
      "  2. Connect via USB and tap 'Allow' on the phone\n" +
      "  3. Run: adb devices   — your device serial should show as 'device'"
    )
  }

  const deviceId = devices[0]
  if (devices.length > 1) {
    console.log(`  Multiple devices found — using: ${deviceId}`)
    console.log(`  Others: ${devices.slice(1).join(", ")}`)
  } else {
    console.log(`✓ Device found: ${deviceId}`)
  }

  // 2. Build frontend
  run("npm run build", {
    cwd: frontendDir,
    env: { ...process.env, VITE_API_BASE_URL: PROD_API_URL },
  })

  // 3. Sync Capacitor
  run("npx cap sync android", { cwd: frontendDir })

  // 4. Build release APK — matches what production users have installed
  const gradlew = process.platform === "win32"
    ? join(androidDir, "gradlew.bat")
    : join(androidDir, "gradlew")
  const apkPath = join(androidDir, "app", "build", "outputs", "apk", "release", "app-release.apk")

  console.log("\n→ Building release APK...")
  run(`"${gradlew}" assembleRelease`, { cwd: androidDir, shell: true })

  // 5. Install + launch (re-verify device is still connected after the build)
  const stillConnected = connectedDevices(adb)
  if (!stillConnected.includes(deviceId)) {
    throw new Error(
      `Device ${deviceId} disconnected during the build.\n` +
      "  Keep the phone unlocked and the USB cable plugged in, then re-run."
    )
  }

  // Uninstall first — required if the phone has a release-signed version installed,
  // since Android won't allow a signature change on update.
  console.log(`\n→ Uninstalling existing app (if any)...`)
  capture(`"${adb}" -s ${deviceId} uninstall ${APP_ID}`)

  console.log(`\n→ Installing on ${deviceId}...`)
  run(`"${adb}" -s ${deviceId} install "${apkPath}"`)

  console.log("\n→ Launching app...")
  run(`"${adb}" -s ${deviceId} shell am start -n ${APP_ID}/.MainActivity`)

  console.log("\n✓ App is running on your device!\n")
}

main().catch(e => {
  console.error(`\n✗ ${e.message}\n`)
  process.exit(1)
})
