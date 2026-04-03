export const trackEvent = (eventName, params = {}) => {
  if (typeof window === "undefined") return
  if (typeof window.gtag !== "function") return

  window.gtag("event", eventName, params)
}

export const trackPageView = (pagePath) => {
  if (typeof window === "undefined") return
  if (typeof window.gtag !== "function") return

  window.gtag("event", "page_view", {
    page_path: pagePath,
    page_location: window.location.href,
    page_title: document.title,
  })
}