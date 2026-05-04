import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom"
import { useEffect } from "react"

import Login from "./pages/Login.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import Transactions from "./pages/Transactions.jsx"
import Categories from "./pages/Categories.jsx"
import AppLayout from "./components/AppLayout.jsx"
import ProtectedRoute from "./auth/ProtectedRoute.jsx"
import PrivacyPolicy from "./pages/PrivacyPolicy.jsx"
import Terms from "./pages/Terms.jsx"
import ResetPassword from "./pages/ResetPassword.jsx"
import ForgotPassword from "./pages/ForgotPassword.jsx"
import LandingPage from "./pages/LandingPage.jsx"
import VerifyEmail from "./pages/VerifyEmail"
import AnalyticsTracker from "./components/AnalyticsTracker"

function AndroidBackButton() {
  const navigate = useNavigate()

  useEffect(() => {
    let listener

    const setup = async () => {
      const { Capacitor } = await import("@capacitor/core")
      if (!Capacitor.isNativePlatform()) return

      const { App } = await import("@capacitor/app")
      listener = await App.addListener("backButton", ({ canGoBack }) => {
        if (canGoBack) {
          navigate(-1)
        } else {
          App.minimizeApp()
        }
      })
    }

    setup()
    return () => { listener?.remove() }
  }, [navigate])

  return null
}

export default function App() {
  return (
    <BrowserRouter>
      <AnalyticsTracker />
      <AndroidBackButton />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/verify-email" element={<VerifyEmail />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/categories" element={<Categories />} />
          </Route>
        </Route>
            
            <Route path="/" element={<LandingPage />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}