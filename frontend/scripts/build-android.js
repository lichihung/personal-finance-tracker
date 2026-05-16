#!/usr/bin/env node
/**
 * build-android.js
 *
 * Builds the frontend with the production API URL, syncs to Android,
 * and deploys to an emulator — auto-launching one if none is running.
 * Android Studio does NOT need to be open.
 *
 * Usage:
 *   npm run build:android   — build + sync only (no emulator)
 *   npm run emulator        — build + sync + auto-launch emulator + deploy
 *
 * Works on macOS and Windows (requires Android SDK, not Android Studio).
 */

import { execSync, spawn } from "child_process"
import { join, dirname } from "path"
import { fileURLToPath } from "url"
import { existsSync } from "fs"

const __dirname = dirname(fileURLToPath(import.meta.url))
const frontendDir = join(__dirname, "..")
const PROD_API_URL = "https://personal-finance-tracker-edzo.onrender.com/api"

// ─── Helpers ─────────────────────────────────────────────────────────────────

function run(cmd, opts = {}) {
  console.log(`\n→ ${cmd}`)
  execSync(cmd, { stdio: "inherit", cwd: frontendDir, ...opts })
}

function capture(cmd, opts = {}) {
  try {
    return execSync(cmd, { encoding: "utf8", stdio: "pipe", ...opts }).trim()
  } catch {
    return ""
  }
}

// Cross-platform synchronous sleep (pure Node.js, no shell needed)
function sleep(ms) {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
}

// ─── Android SDK ─────────────────────────────────────────────────────────────

function getSdkPath() {
  for (const key of ["ANDROID_HOME", "ANDROID_SDK_ROOT"]) {
    if (process.env[key] && existsSync(process.env[key])) return process.env[key]
  }
  const defaults =
    process.platform === "win32"
      ? [join(process.env.LOCALAPPDATA || "", "Android", "Sdk")]
      : process.platform === "darwin"
      ? [join(process.env.HOME || "", "Library", "Android", "sdk")]
      : [join(process.env.HOME || "", "Android", "Sdk")]

  for (const p of defaults) {
    if (existsSync(p)) return p
  }
  throw new Error(
    "Android SDK not found. Install it via Android Studio or set ANDROID_HOME."
  )
}

function sdkBin(sdkPath, ...parts) {
  const ext = process.platform === "win32" ? ".exe" : ""
  return `"${join(sdkPath, ...parts)}${ext}"`
}

// ─── Emulator helpers ─────────────────────────────────────────────────────────

function runningEmulators(adb) {
  return capture(`${adb} devices`)
    .split("\n")
    .slice(1)
    .filter((l) => l.startsWith("emulator-") && l.includes("device"))
    .map((l) => l.split(/\s+/)[0])
}

function listAvds(emulator) {
  return capture(`${emulator} -list-avds`)
    .split("\n")
    .filter(Boolean)
}

function waitForBoot(adb, deviceId) {
  process.stdout.write("  Waiting for boot")
  // First wait until adb sees the device at all
  capture(`${adb} -s ${deviceId} wait-for-device`)

  let booted = false
  while (!booted) {
    const val = capture(`${adb} -s ${deviceId} shell getprop sys.boot_completed`)
    if (val === "1") {
      booted = true
    } else {
      process.stdout.write(".")
      sleep(2000)
    }
  }
  console.log(" ready!")
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const deployMode = process.argv.includes("--run")

  console.log("=== Android build ===")
  console.log(`API URL : ${PROD_API_URL}`)
  console.log(`Mode    : ${deployMode ? "build + sync + emulator" : "build + sync only"}\n`)

  // 1. Build
  run("npm run build", {
    env: { ...process.env, VITE_API_BASE_URL: PROD_API_URL },
  })

  // 2. Sync
  run("npx cap sync android")

  if (!deployMode) {
    console.log(
      "\n✓ Done. Open Android Studio and hit Run,\n  or use `npm run emulator` to deploy automatically.\n"
    )
    return
  }

  // 3. Find / launch emulator
  const sdkPath = getSdkPath()
  const adb = sdkBin(sdkPath, "platform-tools", "adb")
  const emulatorBin = sdkBin(sdkPath, "emulator", "emulator")

  let deviceId
  const already = runningEmulators(adb)

  if (already.length > 0) {
    deviceId = already[0]
    console.log(`\n✓ Using running emulator: ${deviceId}`)
  } else {
    const avds = listAvds(emulatorBin)
    if (avds.length === 0) {
      console.error("\n✗ No AVDs found. Create one in Android Studio (Tools → Device Manager).")
      process.exit(1)
    }

    const avd = avds[0]
    console.log(`\n→ Starting emulator: ${avd}`)

    // Launch emulator detached (it stays open after the script exits)
    spawn(emulatorBin.replace(/"/g, ""), ["-avd", avd, "-no-snapshot-save"], {
      detached: true,
      shell: false,
      stdio: "ignore",
    }).unref()

    // Wait until the emulator appears in `adb devices`
    process.stdout.write("  Waiting for emulator to appear in adb")
    while (true) {
      sleep(2000)
      process.stdout.write(".")
      const now = runningEmulators(adb)
      if (now.length > 0) {
        deviceId = now[0]
        break
      }
    }
    console.log(` ${deviceId}`)

    waitForBoot(adb, deviceId)
  }

  // 4. Deploy
  console.log(`\n→ Deploying to ${deviceId}...`)
  run(`npx cap run android --target ${deviceId}`)

  console.log("\n✓ App is running on the emulator!\n")
}

main().catch((e) => {
  console.error(`\n✗ ${e.message}\n`)
  process.exit(1)
})
