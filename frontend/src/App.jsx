import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"

import Login from "./pages/Login.jsx"
import Dashboard from "./pages/Dashboard.jsx"
import Transactions from "./pages/Transactions.jsx"
import Categories from "./pages/Categories.jsx"
import AppLayout from "./components/AppLayout.jsx"
import ProtectedRoute from "./auth/ProtectedRoute.jsx"

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/categories" element={<Categories />} />
          </Route>
        </Route>
        
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  )
}