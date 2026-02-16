import { apiFetch } from "./clientFetch"

export const getCategories = async () => {
    const data = await apiFetch("categories/")
    if (Array.isArray(data)) return data
    if (data?.results && Array.isArray(data.results)) return data.results
    return []
}