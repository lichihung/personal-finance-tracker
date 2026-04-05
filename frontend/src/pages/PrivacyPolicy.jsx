import { Box, Container, Text, VStack, Link, textDecoration } from "@chakra-ui/react"
import { Link as RouterLink, useNavigate } from "react-router-dom"

export default function PrivacyPolicy() {

  const navigate = useNavigate()

  const handleBack = () => {
    const token = localStorage.getItem("access")

    if (token) {
      navigate("/dashboard")
    } else {
      navigate("/login")
    }
  }
  return (
    <Box minH="100vh" bg="cream.50" px={{ base: 2, md: 16 }}>
      <Container maxW="container.md">
        <VStack align="stretch" spacing={6}>
          <Text
            fontSize={{ base: "42px", md: "80px" }}
            fontWeight="400"
            letterSpacing="2px"
            textTransform="uppercase"
            mb={10}
            mt={8}
            textAlign="center"
            color="brand.900"
            fontFamily="Imbue, serif"
          >
            Privacy Policy
          </Text>

          <Text color="gray.600">
            Last updated: March 2026
          </Text>

          <Text>
            This app collects account and finance-related data that you enter,
            including your username, categories, and transactions.
          </Text>

          <Text>
            Your data is used only to provide core app features such as login,
            dashboard summaries, category management, and transaction tracking.
          </Text>

          <Text>
            Your data is stored in the application database and is not sold to
            third parties.
          </Text>

          <Text>
            Authentication is used to protect access to your account. Only you
            can access your own data through your authenticated session.
          </Text>

          <Text>
            If you have questions about this policy, please contact us at verdia.financetracker@gmail.com.
          </Text>

          <Text fontWeight="600" mt={6} color="brand.800">
            Delete your account
          </Text>

          <Text>
            To request account deletion:
          </Text>

          <Text>
            1. Email us at verdia.financetracker@gmail.com
          </Text>

          <Text>
            2. Include your username
          </Text>

          <Text>
            3. We will delete your data within 7 days
          </Text>

          <Text>
            All account information and transaction data will be permanently deleted within 7 days and not retained.
          </Text>

          <Text>
            All user data will be permanently deleted and not retained after deletion.
          </Text>

          <Text cursor="pointer" mt={4} mb={12} onClick={handleBack} color="brand.800" _hover={{color: "brand.700", textDecoration: "underline"}}>
            ←  Back
          </Text>
        </VStack>
      </Container>
    </Box>
  )
}