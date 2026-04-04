import { useEffect } from "react"
import { useLocation } from "react-router-dom"
import { trackPageView } from "../utils/analytics"

export default function AnalyticsTracker() {
  const location = useLocation()

  useEffect(() => {
    const path = `${location.pathname}${location.search}${location.hash}`
    trackPageView(path)
  }, [location])

  return null
}