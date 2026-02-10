import { clearTokens } from "../api/clientFetch"

export function isAuthed() {
  return !!localStorage.getItem("access")
}

export function signIn() {
}

export function signOut() {
  clearTokens()
}
