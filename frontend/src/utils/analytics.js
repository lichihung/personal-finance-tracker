import { Capacitor } from "@capacitor/core"

const getPlatformParams = () => {
  const isApp = Capacitor.isNativePlatform()

  return {
    platform: isApp ? "app" : "web",
  }
}

export const trackEvent = (eventName, params = {}) => {
  if (typeof window === "undefined") return
  if (typeof window.gtag !== "function") return

  window.gtag("event", eventName, {
    ...getPlatformParams(),
    ...params,
  })
}

export const trackPageView = (pagePath) => {
  if (typeof window === "undefined") return
  if (typeof window.gtag !== "function") return

  window.gtag("event", "page_view", {
    ...getPlatformParams(),
    page_path: pagePath,
    page_location: window.location.href,
    page_title: document.title,
  })
}