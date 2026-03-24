import { useState } from "react"
import { Box, Button, Container, Input, Text, VStack } from "@chakra-ui/react"
import { useNavigate, useSearchParams } from "react-router-dom"

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"

export default function ResetPassword() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  const uid = searchParams.get("uid") || ""
  const token = searchParams.get("token") || ""

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!uid || !token) {
      setError("Invalid reset link.")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.")
      return
    }

    try {
      setLoading(true)

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

      setSuccess("Password reset successfully. Redirecting to login...")

      setTimeout(() => {
        navigate("/login", { replace: true })
      }, 1500)
    } catch (err) {
      setError(err.message || "Unable to reset password.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box minH="100vh" bg="cream.50" py={8}>
      <Container maxW="container.sm">
        <VStack
          as="form"
          onSubmit={handleSubmit}
          align="stretch"
          spacing={5}
          bg="white"
          p={8}
          borderRadius="lg"
          boxShadow="md"
        >
          <Text
            fontSize={{ base: "32px", md: "56px" }}
            fontWeight="400"
            letterSpacing="2px"
            textTransform="uppercase"
            textAlign="center"
            color="brand.900"
            fontFamily="Imbue, serif"
          >
            Reset Password
          </Text>

          <Text color="gray.600" textAlign="center">
            Enter your new password below.
          </Text>

          <Box>
            <Text mb={2}>New Password</Text>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Minimum 8 characters"
            />
          </Box>

          <Box>
            <Text mb={2}>Confirm New Password</Text>
            <Input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter your password"
            />
          </Box>

          {error ? (
            <Text color="red.500" fontSize="sm">
              {error}
            </Text>
          ) : null}

          {success ? (
            <Text color="green.600" fontSize="sm">
              {success}
            </Text>
          ) : null}

          <Button
            type="submit"
            bg="brand.900"
            color="white"
            _hover={{ opacity: 0.9 }}
            isLoading={loading}
          >
            Reset Password
          </Button>

          <Button variant="ghost" onClick={() => navigate("/login")}>
            Back to Login
          </Button>
        </VStack>
      </Container>
    </Box>
  )
}