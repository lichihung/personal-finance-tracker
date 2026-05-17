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

import { execSync } from "child_process"
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

  let deviceId
  const already = runningEmulators(adb)

  if (already.length > 0) {
    deviceId = already[0]
    console.log(`\n✓ Using running emulator: ${deviceId}`)
  } else {
    console.error("\n✗ No emulator is running.")
    console.error("  Start one from Android Studio → Device Manager → ▶ next to your AVD.")
    console.error("  Then re-run: npm run emulator\n")
    process.exit(1)
  }

  // 4. Build debug APK via Gradle, then install with adb directly
  // (avoids `cap run` which fails to locate gradlew on Windows)
  const androidDir = join(frontendDir, "android")
  const gradlew = process.platform === "win32" ? "gradlew.bat" : "./gradlew"
  const apkPath = join(androidDir, "app", "build", "outputs", "apk", "debug", "app-debug.apk")
  const appId = "com.verdia.financetracker"

  console.log(`\n→ Building debug APK...`)
  run(`${gradlew} assembleDebug`, { cwd: androidDir, shell: true })

  console.log(`\n→ Installing APK on ${deviceId}...`)
  run(`${adb} -s ${deviceId} install -r "${apkPath}"`)

  console.log(`\n→ Launching app...`)
  run(`${adb} -s ${deviceId} shell am start -n ${appId}/.MainActivity`)

  console.log("\n✓ App is running on the emulator!\n")
}

main().catch((e) => {
  console.error(`\n✗ ${e.message}\n`)
  process.exit(1)
})
