const BASE_URL = "http://127.0.0.1:8000/api"

export const login = async(username, password) => {
    const res = await fetch(`${BASE_URL}/auth/token/`, {
        method: "POST",
        headers: { "Content-Type": "application/json"},
        body: JSON.stringify({ username, password}),
    })

    const data = await res.json()

    if(!res.ok) {
        throw new Error(data?.detail || "Invalid credentials")
    }

    localStorage.setItem("access", data.access)
    localStorage.setItem("refresh", data.refresh)
}