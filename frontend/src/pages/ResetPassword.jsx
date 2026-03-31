import { useState } from "react"
import {
  Box,
  Button,
  Container,
  Input,
  InputGroup,
  InputRightElement,
  Link,
  Text,
  VStack,
} from "@chakra-ui/react"
import { useNavigate, useSearchParams, Link as RouterLink } from "react-router-dom"

import AuthCard from "../components/auth/AuthCard"
import FormField from "../components/ui/FormField"
import { getErrorMessage, SUCCESS_MESSAGES } from "../utils/messages"

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const uid = searchParams.get("uid") || ""
  const token = searchParams.get("token") || ""

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPw, setShowPw] = useState(true)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [successMessage, setSuccessMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError("")
    setSuccessMessage("")

    if (!uid || !token) {
      setSubmitError("Invalid reset link.")
      return
    }

    if (password.length < 8) {
      setSubmitError("Password must be at least 8 characters.")
      return
    }

    if (password !== confirmPassword) {
      setSubmitError("Passwords do not match.")
      return
    }

    try {
      setIsSubmitting(true)

      const res = await fetch(`${BASE_URL}/auth/reset-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          uid,
          token,
          password,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(
          data?.detail ||
            data?.password?.[0] ||
            "Unable to reset password."
        )
      }

      setSuccessMessage(`${SUCCESS_MESSAGES.passwordReset} Redirecting to login...`)

      setTimeout(() => {
        navigate("/login", { replace: true })
      }, 1500)
    } catch (err) {
      console.error(err)
      setSubmitError(getErrorMessage(err, "Unable to reset password."))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <Box minH="100vh" bg="cream.50">
      <Container maxW="container.sm" py={16}>
        <Box display="flex" justifyContent="center">
          <AuthCard
            title="Reset password"
            subtitle="Enter your new password below"
          >
            <Box as="form" onSubmit={handleSubmit}>
              <VStack spacing={4} align="stretch">
                <FormField label="New Password">
                  <InputGroup>
                    <Input
                      placeholder="Minimum 8 characters"
                      type={showPw ? "password" : "text"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                    <InputRightElement
                      width="4.5em"
                      top="50%"
                      transform="translateY(-50%)"
                    >
                      <Button
                        size="sm"
                        variant="simple"
                        onClick={() => setShowPw((v) => !v)}
                      >
                        {showPw ? "Show" : "Hide"}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                </FormField>

                <FormField label="Confirm Password">
                  <InputGroup>
                    <Input
                      placeholder="Re-enter password"
                      type={showConfirmPw ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                    />
                    <InputRightElement
                      width="4.5em"
                      top="50%"
                      transform="translateY(-50%)"
                    >
                      <Button
                        size="sm"
                        variant="simple"
                        onClick={() => setShowConfirmPw((v) => !v)}
                      >
                        {showConfirmPw ? "Hide" : "Show"}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                </FormField>

                {submitError ? (
                  <Text color="red.500" fontSize="sm" textAlign="left">
                    {submitError}
                  </Text>
                ) : null}

                {successMessage ? (
                  <Text color="brand.700" fontSize="sm" textAlign="left">
                    {successMessage}
                  </Text>
                ) : null}

                <Button
                  mt={4}
                  _hover={{ color: "white" }}
                  type="submit"
                  isLoading={isSubmitting}
                  w="full"
                >
                  Reset Password
                </Button>

                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Back to{" "}
                  <Link as={RouterLink} to="/login" color="brand.700" textDecoration="underline" _hover={{ color: "brand.800", textDecoration: "underline" }}>
                    Login
                  </Link>
                </Text>
              </VStack>
            </Box>
          </AuthCard>
        </Box>
      </Container>
    </Box>
  )
}