let _isNative = false

// Call once on app startup — syncs Capacitor Preferences → localStorage on Android.
// This ensures tokens survive app kills on Android (SharedPreferences vs WebView storage).
export const initTokenStorage = async () => {
  try {
    const { Capacitor } = await import("@capacitor/core")
    _isNative = Capacitor.isNativePlatform()

    if (!_isNative) return

    const { Preferences } = await import("@capacitor/preferences")
    for (const key of ["access", "refresh", "isDemo"]) {
      const { value } = await Preferences.get({ key })
      if (value !== null) {
        localStorage.setItem(key, value)
      } else {
        localStorage.removeItem(key)
      }
    }
  } catch {
    // fall back to localStorage-only if Preferences unavailable
  }
}

const syncToPreferences = (key, value) => {
  if (!_isNative) return
  import("@capacitor/preferences")
    .then(({ Preferences }) => {
      if (value === null) {
        Preferences.remove({ key })
      } else {
        Preferences.set({ key, value })
      }
    })
    .catch(() => {})
}

export const setStoredToken = (key, value) => {
  localStorage.setItem(key, value)
  syncToPreferences(key, value)
}

export const removeStoredToken = (key) => {
  localStorage.removeItem(key)
  syncToPreferences(key, null)
}
