const KEY = "pft_is_authed"

export function isAuthed(){
    return localStorage.getItem(KEY) === "true"
}

export function signIn(){
    localStorage.setItem(KEY, "true")
}

export function signOut(){
    localStorage.removeItem(KEY)
}