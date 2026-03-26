export const getErrorMessage = (error, fallback = "Something went wrong. Please try again.") => {
  const raw =
    error?.data?.detail ||
    error?.message ||
    error?.detail ||
    (typeof error === "string" ? error : "") ||
    ""

  if (raw.includes("Demo account is read-only")) {
    return "Demo mode: Changes are disabled."
  }

  if (raw.includes("Invalid username or password")) {
    return "Invalid username or password."
  }

  if (raw.includes("Too many login attempts")) {
    return "Too many login attempts. Please try again in a minute."
  }

  if (raw.includes("Invalid or expired reset link")) {
    return "This reset link is invalid or has expired."
  }

  if (raw.includes("Invalid reset link")) {
    return "This reset link is invalid."
  }

  if (raw.includes("Category already exists")) {
    return "That category already exists."
  }

  if (raw.includes("Category is used by transactions")) {
    return "This category can't be deleted because it is used by transactions."
  }

  if (raw.includes("Unable to create account")) {
    return "Unable to create account. Please try again."
  }

  if (raw.includes("NetworkError") || raw.includes("Failed to fetch")) {
    return "Unable to connect. Please check your internet connection."
  }

  if (String(raw).includes("Invalid page")) {
    return "That page is no longer available."
  }

  if (String(raw).includes("Failed to fetch") || String(raw).includes("NetworkError")) {
    return "Unable to connect. Please check your internet connection."
  }
  return raw || fallback
}

export const SUCCESS_MESSAGES = {
  transactionCreated: "Transaction added successfully.",
  transactionUpdated: "Transaction updated successfully.",
  transactionDeleted: "Transaction deleted successfully.",
  categoryCreated: "Category added successfully.",
  categoryUpdated: "Category updated successfully.",
  categoryDeleted: "Category deleted successfully.",
  passwordReset: "Password reset successfully.",
  resetLinkSent: "If an account with that email exists, a reset link has been sent.",
  loginSuccess: "Signed in successfully.",
  registerSuccess: "Account created successfully.",
}