import { apiFetch } from "./clientFetch"

export const getTransactions = async (params = {}) => {
    const qs = new URLSearchParams()

    if (params.month) qs.set("month", params.month)
    if (params.type) qs.set("type", params.type)
    if (params.category) qs.set("category", params.category)
    if (params.q) qs.set("q", params.q)
    if (params.sort) qs.set("sort", params.sort)

    const url = qs.toString() ? `/transactions/?${qs.toString()}` : "/transactions/"
    const data = await apiFetch(url)

    if (Array.isArray(data)) return data
    if (data && Array.isArray(data.results)) return data.results
    return []
}

export const createTransaction = (payload) => apiFetch("/transactions/", { method: "POST", body: payload })

export const updateTransaction = (id, payload) => apiFetch(`/transactions/${id}/`, { method: "PATCH", body: payload })

export const deleteTransaction = (id) => apiFetch(`/transactions/${id}/`, { method: "DELETE" })