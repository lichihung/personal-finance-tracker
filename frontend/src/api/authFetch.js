const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"

export const login = async(username, password) => {
    const res = await fetch(`${BASE_URL}/auth/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    })

    const data = await res.json()

    if(!res.ok) {
        throw new Error("Invalid username or password.")
    }

    localStorage.setItem("access", data.access)
    localStorage.setItem("refresh", data.refresh)
    return data
}

export const register = async(username, password) => {
    const res = await fetch(`${BASE_URL}/auth/register/`,{
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password })
    })

    const data = await res.json()

    if(!res.ok) {
        const msg = data?.detail || data?.username?.[0] || data?.password?.[0] || "Unable to create account. Please try again"
        throw new Error(msg)
    }

    return data
}