const BASE_URL = "http://127.0.0.1:8000/api"
const ACCESS_KEY = "access"
const REFRESH_KEY = "refresh"

const getAccessToken = () => localStorage.getItem(ACCESS_KEY)
const getRefreshToken = () => localStorage.getItem(REFRESH_KEY)
const setAccessToken = (token) => localStorage.setItem(ACCESS_KEY, token)

export const clearTokens = () => {
  localStorage.removeItem(ACCESS_KEY)
  localStorage.removeItem(REFRESH_KEY)
}

let refreshInProgress = false
let refreshQueue = [] // array of { resolve, reject }

const resolveRefreshQueue = function (newAccess) {
  for (let i = 0; i < refreshQueue.length; i++) {
    const item = refreshQueue[i]
    const resolve = item.resolve
    resolve(newAccess)
  }
  refreshQueue = []
}

const rejectRefreshQueue = function (err) {
  for (let i = 0; i < refreshQueue.length; i++) {
    const item = refreshQueue[i]
    const reject = item.reject
    reject(err)
  }
  refreshQueue = []
}

const safeJson = async (res) => {
  try {
    const data = await res.json()
    return data
  } catch {
    return null
  }
}

const refreshAccessToken = async () => {
  const refresh = getRefreshToken()
  if (!refresh) {
    throw new Error("No refresh token")
  }

  const res = await fetch(BASE_URL + "/auth/token/refresh/", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh: refresh }),
  })

  // Case 1: Refresh request FAILED
  if (!res.ok) {
    const data = await safeJson(res)

    let msg
    // Case 1a: Backend returned JSON with a "detail" error message
    if (data && data.detail) {
      msg = data.detail
    } else {
      // Case 1b: No JSON body or no "detail" field
      msg = "Refresh token invalid"
    }

    throw new Error(msg)
  }

  // Case 2: Refresh request SUCCEEDED
  // Expecting a JSON response like: { access: "new_access_token" }
  const data = await res.json()

  // Case 2a: Backend returned 2xx but response format is invalid
  // (missing "access" field)
  if (!data || !data.access) {
    throw new Error("Refresh response missing access token")
  }

  // Case 2b: Refresh succeeded and response format is valid
  // Save the new access token for future API requests
  setAccessToken(data.access)

  // Return the new access token
  return data.access
}

const handleResponse = async (res) => {
  const data = await safeJson(res)

  if (res.ok) {
    return data
  }

  // Normalize errors for frontend usage
  let message = "Request failed"
  if (data && data.detail) {
    message = data.detail
  }

  const err = new Error(message)
  err.status = res.status
  err.data = data
  throw err
}

/* apiFetch
- Works like fetch, but:
1) automatically attaches Authorization header
2) on 401, refreshes access token and retries once
*/
export const apiFetch = async (path, options = {}) => {
  let url
  if (path.startsWith("/")) {
    url = BASE_URL + path
  } else {
    url = BASE_URL + "/" + path
  }

  const access = getAccessToken()

  // Normalize headers
  let headers
  if (options.headers) {
    headers = new Headers(options.headers)
  } else {
    headers = new Headers()
  }

  // Build requestOptions
  let requestOptions = {}

  if (options.method) {
    requestOptions.method = options.method
  }
  if (options.body) {
    requestOptions.body = options.body
  }
  if (options.credentials) {
    requestOptions.credentials = options.credentials
  }
  if (options.mode) {
    requestOptions.mode = options.mode
  }

  // If body exists and user did not set Content-Type, set JSON (except FormData)
  if (requestOptions.body) {
    if (!headers.has("Content-Type")) {
      if (!(requestOptions.body instanceof FormData)) {
        headers.set("Content-Type", "application/json")
      }
    }
  }

  // Attach Authorization if access exists
  if (access) {
    headers.set("Authorization", "Bearer " + access)
  }

  requestOptions.headers = headers

  // If body is a plain object, stringify it (except FormData)
  if (
    requestOptions.body &&
    typeof requestOptions.body === "object" &&
    !(requestOptions.body instanceof FormData)
  ) {
    requestOptions.body = JSON.stringify(requestOptions.body)
  }

  // Prevent infinite retry (only retry once per apiFetch call)
  let hasRetried = false

  // 1st attempt
  let res = await fetch(url, requestOptions)

  // If not 401, return normally
  if (res.status !== 401) {
    return handleResponse(res)
  }

  // If already retried once, stop
  if (hasRetried) {
    return handleResponse(res)
  }
  hasRetried = true

  // If a refresh is already happening, wait for it
  if (refreshInProgress) {
    try {
      const newAccess = await new Promise((resolve, reject) => {
        refreshQueue.push({ resolve, reject })
      })

      headers.set("Authorization", "Bearer " + newAccess)
      res = await fetch(url, requestOptions)
      return handleResponse(res)
    } catch (err) {
      clearTokens()
      throw err
    }
  }

  // Start refresh flow
  refreshInProgress = true
  try {
    const newAccess = await refreshAccessToken()
    resolveRefreshQueue(newAccess)

    headers.set("Authorization", "Bearer " + newAccess)
    res = await fetch(url, requestOptions)
    return handleResponse(res)
  } catch (err) {
    clearTokens()
    rejectRefreshQueue(err)
    throw err
  } finally {
    refreshInProgress = false
  }
}

export const isAuthed = () => {
    const access = localStorage.getItem("access")
    return !!access
}