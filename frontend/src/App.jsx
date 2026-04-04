import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

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

export default function App() {
  return (
    <BrowserRouter>
      <AnalyticsTracker />
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