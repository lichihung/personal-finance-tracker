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
    <Box minH="100vh" bg="cream.50">
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
            display={{ base: "none", md: "block" }}
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
            If you have questions about this policy, please contact the app
            owner through the project repository or portfolio contact page.
          </Text>

          <Text
            cursor="pointer" color="teal.600" onClick={handleBack} _hover={{textDecoration: "underline"}}>
            ←  Back
          </Text>
        </VStack>
      </Container>
    </Box>
  )
}