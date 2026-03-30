import { useEffect, useState } from "react"
import { Box, Button, Container, Text, VStack } from "@chakra-ui/react"
import { Link as RouterLink, useSearchParams } from "react-router-dom"

import AuthCard from "../components/auth/AuthCard"
import { verifyEmail } from "../api/authFetch"

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState("loading")
  const [message, setMessage] = useState("Verifying your email...")

  useEffect(() => {
    const uid = searchParams.get("uid")
    const token = searchParams.get("token")

    if (!uid || !token) {
      setStatus("error")
      setMessage("Invalid verification link.")
      return
    }

    const runVerify = async () => {
      try {
        const data = await verifyEmail(uid, token)
        setStatus("success")
        setMessage(data?.detail || "Email verified successfully.")
      } catch (err) {
        setStatus("error")
        setMessage(err.message || "Unable to verify email.")
      }
    }

    runVerify()
  }, [searchParams])

  return (
    <Box minH="100vh" bg="cream.50">
      <Container maxW="container.sm" py={16}>
        <Box display="flex" justifyContent="center">
          <AuthCard
            title={
              status === "loading"
                ? "Verifying email"
                : status === "success"
                ? "Email verified"
                : "Verification failed"
            }
            subtitle=""
          >
            <VStack spacing={4} align="stretch">
              <Text
                fontSize="sm"
                color={
                  status === "success"
                    ? "green.500"
                    : status === "error"
                    ? "red.500"
                    : "gray.600"
                }
                textAlign="left"
              >
                {message}
              </Text>

              {status !== "loading" ? (
                <Button
                  as={RouterLink}
                  to="/login"
                  colorScheme="teal"
                  w="full"
                >
                  Go to login
                </Button>
              ) : null}
            </VStack>
          </AuthCard>
        </Box>
      </Container>
    </Box>
  )
}