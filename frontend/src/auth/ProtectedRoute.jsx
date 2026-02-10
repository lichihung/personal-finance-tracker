import { Navigate, Outlet } from "react-router-dom"
import { isAuthed } from "../api/clientFetch"

export default function ProtectedRoute() {
  if (!isAuthed()) {
    return <Navigate to="/login" replace />
  }
  return <Outlet />
}
