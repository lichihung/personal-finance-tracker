import { apiFetch } from "./clientFetch"

export const getTransactions = async (params = {}) => {
    const qs = new URLSearchParams()

    if (params.month) qs.set("month", params.month)
    if (params.type) qs.set("type", params.type)
    if (params.category) qs.set("category", params.category)
    if (params.q) qs.set("q", params.q)
    if (params.sort) qs.set("sort", params.sort)
    if (params.page) qs.set("page", String(params.page))

    const url = qs.toString() ? `/transactions/?${qs.toString()}` : "/transactions/"
    const data = await apiFetch(url)

    if (data && Array.isArray(data.results)) {
        return {
            count: data.count ?? data.results.length,
            next: data.next,
            previous: data.previous,
            results: data.results,
        }
    }
    if (Array.isArray(data)) {
        return {count: data.length, next: null, previous: null, results: data}
    }
    return {count: 0, next: null, previous: null, results: []}
}

export const createTransaction = (payload) => apiFetch("/transactions/", { method: "POST", body: payload })

export const updateTransaction = (id, payload) => apiFetch(`/transactions/${id}/`, { method: "PATCH", body: payload })

export const deleteTransaction = (id) => apiFetch(`/transactions/${id}/`, { method: "DELETE" })

export const getTransactionMonths = async (params = {}) => {
    const qs = new URLSearchParams()
    if (params.type) qs.set("type", params.type)
    if (params.category) qs.set("category", params.category)
    if (params.q) qs.set("q", params.q)

    const url = qs.toString() ? `/transactions/months/?${qs.toString()}` : "/transactions/months/"
    const data = await apiFetch(url)
    return Array.isArray(data?.results) ? data.results : []
}