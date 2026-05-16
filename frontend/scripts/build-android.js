#!/usr/bin/env node
/**
 * build-android.js
 *
 * Builds the frontend with the production API URL, syncs to Android,
 * and optionally deploys to a running emulator or connected device.
 *
 * Usage:
 *   npm run build:android        — build + sync only
 *   npm run emulator             — build + sync + deploy to emulator/device
 *
 * Works on macOS and Windows (no bash or PowerShell required).
 */

import { execSync } from "child_process"
import { join, dirname } from "path"
import { fileURLToPath } from "url"

const __dirname = dirname(fileURLToPath(import.meta.url))
const frontendDir = join(__dirname, "..")

const PROD_API_URL = "https://personal-finance-tracker-edzo.onrender.com/api"
const shouldDeploy = process.argv.includes("--run")

function run(cmd, opts = {}) {
  console.log(`\n→ ${cmd}`)
  execSync(cmd, { stdio: "inherit", cwd: frontendDir, ...opts })
}

console.log("=== Android build ===")
console.log(`API URL: ${PROD_API_URL}`)

// 1. Build web assets with production API URL
run("npm run build", {
  env: { ...process.env, VITE_API_BASE_URL: PROD_API_URL },
})

// 2. Sync web assets + plugins into the Android project
run("npx cap sync android")

// 3. Deploy to running emulator / connected device (optional)
if (shouldDeploy) {
  console.log("\n→ Deploying to emulator / device...")
  run("npx cap run android")
} else {
  console.log(
    "\n✓ Done. Open Android Studio and hit Run, or use `npm run emulator` to deploy directly.\n"
  )
}
