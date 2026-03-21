import { Box, Container, Text, VStack } from "@chakra-ui/react"

export default function PrivacyPolicy() {
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
        </VStack>
      </Container>
    </Box>
  )
}