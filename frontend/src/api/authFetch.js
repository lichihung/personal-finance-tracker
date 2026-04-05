const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"

export const login = async (identifier, password) => {
  const normalizedIdentifier = String(identifier || "").trim().toLowerCase()

  const res = await fetch(`${BASE_URL}/auth/token/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ identifier, password }),
  })

  const data = await res.json()

  if (!res.ok) {
    localStorage.removeItem("isDemo")

    if (res.status === 429 || res.status === 403) {
      throw new Error("Too many login attempts. Please try again in a minute.")
    }
    throw new Error(data?.detail || "Unable to log in.")
  }

  localStorage.setItem("access", data.access)
  localStorage.setItem("refresh", data.refresh)

  if (normalizedIdentifier === "demo") {
    localStorage.setItem("isDemo", "true")
  } else {
    localStorage.removeItem("isDemo")
  }

  return data
}

export const register = async(username, email, password) => {
    const res = await fetch(`${BASE_URL}/auth/register/`,{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, email, password })
    })

    const data = await res.json()

    if (!res.ok) {
        let msg =
          data?.detail ||
          data?.message ||
          data?.email?.[0] ||
          data?.username?.[0] ||
          data?.password?.[0] ||
          data?.errors?.email?.[0] ||
          data?.errors?.username?.[0] ||
          data?.errors?.password?.[0] ||
          data?.errors?.non_field_errors?.[0]

        if (!msg && data?.errors && typeof data.errors === "object") {
          const firstValue = Object.values(data.errors)[0]

          if (Array.isArray(firstValue) && firstValue.length > 0) {
            msg = firstValue[0]
          } else if (typeof firstValue === "string") {
            msg = firstValue
          }
        }

      if (!msg && data && typeof data === "object") {
        const firstValue = Object.values(data)[0]

        if (Array.isArray(firstValue) && firstValue.length > 0) {
          msg = firstValue[0]
        } else if (typeof firstValue === "string") {
          msg = firstValue
        }
      }

      throw new Error(msg || "Unable to create account. Please try again.")
    }

    return data
}

export const loginDemo = async () => {
  const data = await login("demo", "demo1234")
  localStorage.setItem("isDemo", "true")
  return data
}

export const verifyEmail = async (uid, token) => {
  const res = await fetch(`${BASE_URL}/auth/verify-email/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ uid, token }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.detail || "Unable to verify email.")
  }

  return data
}

export const resendVerificationEmail = async (email) => {
  const res = await fetch(`${BASE_URL}/auth/resend-verification/`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })

  const data = await res.json()

  if (!res.ok) {
    throw new Error(data?.detail || data?.email?.[0] || "Unable to resend verification email.")
  }

  return data
}