import { useState } from "react"
import { Box, Button, Container, Input, Link, Text, VStack } from "@chakra-ui/react"
import { Link as RouterLink } from "react-router-dom"

import AuthCard from "../components/auth/AuthCard"
import FormField from "../components/ui/FormField"
import { getErrorMessage, SUCCESS_MESSAGES } from "../utils/messages"

const BASE_URL =
  import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api"

export default function ForgotPassword() {
  const [email, setEmail] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setSuccess("")

    if (!email) {
      setError("Email is required.")
      return
    }

    try {
      setLoading(true)

      const res = await fetch(`${BASE_URL}/auth/forgot-password/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data?.detail || "Something went wrong.")
      }

      setSuccess(SUCCESS_MESSAGES.resetLinkSent)

    } catch (err) {
      setError(getErrorMessage(err, "Unable to send reset email."))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box minH="100vh" bg="cream.50">
      <Container maxW="container.sm" py={16}>
        <Box display="flex" justifyContent="center">
          <AuthCard
            title="Forgot password"
            subtitle="Enter your email to receive a reset link"
          >
            <Box as="form" onSubmit={handleSubmit}>
              <VStack spacing={4} align="stretch">
                <FormField label="Email">
                  <Input
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </FormField>

                {error && (
                  <Text color="red.500" fontSize="sm">
                    {error}
                  </Text>
                )}

                {success && (
                  <Text color="brand.700" fontSize="sm">
                    {success}
                  </Text>
                )}

                <Button
                  type="submit"
                  colorScheme="teal"
                  isLoading={loading}
                  w="full"
                  mt={4}
                >
                  Send reset link
                </Button>

                <Text fontSize="sm" color="gray.600" textAlign="center">
                  Back to{" "}
                  <Link as={RouterLink} to="/login" color="brand.700" textDecoration="underline" _hover={{color: "brand.800", textDecoration: "underline"}}>
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