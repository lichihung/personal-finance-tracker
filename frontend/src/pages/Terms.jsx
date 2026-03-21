import { Box, Container, Text, VStack } from "@chakra-ui/react"
import { useNavigate } from "react-router-dom"

export default function Terms() {
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
    <Box minH="100vh" bg="cream.50" py={8}>
      <Container maxW="container.md">
        <VStack align="stretch" spacing={6}>

          <Text
            fontSize={{ base: "36px", md: "72px" }}
            fontWeight="400"
            letterSpacing="2px"
            textTransform="uppercase"
            textAlign="center"
            color="brand.900"
            fontFamily="Imbue, serif"
          >
            Terms of Use
          </Text>

          <Text color="gray.600">Last updated: March 2026</Text>

          <Text>
            This app is provided for personal finance tracking use. You are responsible
            for the accuracy of the data you enter.
          </Text>

          <Text>
            You agree not to misuse the service, attempt unauthorized access, disrupt
            normal operation, or use the app for unlawful purposes.
          </Text>

          <Text>
            The app owner may update, improve, limit, or remove features at any time
            to maintain stability, security, or usability.
          </Text>

          <Text>
            While reasonable efforts are made to keep the app available and accurate,
            the service is provided on an “as is” basis without guarantees of
            uninterrupted availability or error-free operation.
          </Text>

          <Text>
            You are responsible for keeping your login credentials secure and for
            logging out from shared devices.
          </Text>

          <Text cursor="pointer" onClick={handleBack} color="brand.800" _hover={{color: "brand.700", textDecoration: "underline"}}>
            ← Back
          </Text>
        </VStack>
      </Container>
    </Box>
  )
}