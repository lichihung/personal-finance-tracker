import { Box, Button, Flex, HStack, Link, SimpleGrid, Text, VStack, Grid, GridItem, } from "@chakra-ui/react"
import { NavLink, useNavigate } from "react-router-dom"
import { loginDemo } from "../api/authFetch"

export default function LandingPage() {
  const navigate = useNavigate()

  return (
    <Flex minH="100vh" direction="column" bg="cream.50">
      <Box bg="brand.900" color="white" w="full">
        <Box px={{ base: 6, md: 16 }} py={{ base: 4, md: 5 }}>
          <Flex align="center" justify="space-between">
            <Link
              as={NavLink}
              to="/"
              _hover={{ textDecoration: "none", color: "white" }}
            >
              <Text
                fontFamily="Imbue, serif"
                fontWeight="400"
                letterSpacing="2px"
                fontSize={{ base: "24px", md: "24px" }}
              >
                FINANCE TRACKER
              </Text>
            </Link>

            <HStack spacing={{ base: 4, md: 8 }} fontSize={{ base: "14px", md: "14px" }}>
              <Link
                as={NavLink}
                to="/privacy"
                _hover={{ textDecoration: "none", color: "white" }}
              >
                Privacy
              </Link>
              <Link
                as={NavLink}
                to="/terms"
                _hover={{ textDecoration: "none", color: "white" }}
              >
                Terms
              </Link>
              <Text
                cursor="pointer"
                fontWeight="600"
                onClick={() => navigate("/login")}
                _hover={{ textDecoration: "none", color: "white" }}
              >
                Login
              </Text>
            </HStack>
          </Flex>
        </Box>
      </Box>

      <Box flex="1" w="full">
        <Box maxW="1200px" mx="auto" px={{ base: 6, md: 16 }} py={{ base: 16, md: 24 }}>
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 10, md: 16 }} alignItems="center">
            {/* Left */}
            <VStack align={{ base: "center", md: "start"}} spacing={8}>
              <Text
                fontFamily="Imbue, serif"
                fontWeight="400"
                letterSpacing="2px"
                textTransform="uppercase"
                lineHeight={{ base: "1", md: "1" }}
                fontSize={{ base: "56px", md: "90px" }}
                color="brand.900"
                textAlign={{ base: "center", md: "left" }}
              >
                Keep track of
                <br />
                your money,
                <br />
                simply
              </Text>

              <Text
                color="gray.700"
                fontSize={{ base: "18px", md: "18px" }}
                lineHeight="1.5"
                maxW="720px"
                textAlign={{ base: "center", md: "left" }}
              >
                A simple way to record income and expenses, organize
                categories, and stay on top of your monthly spending.
              </Text>

              <HStack spacing={6} pt={1.5} flexWrap="wrap">
                <Button
                  size="md"
                  px={10}
                  borderRadius="full"
                  fontSize="14px"
                  _hover={{ bg: "transparent", color:"brand.900", borderColor:"brand.900" }}
                  onClick={() => navigate("/login")}
                >
                  Get Started
                </Button>

                <Button
                  size="md"
                  px={10}
                  borderRadius="full"
                  backgroundColor="transparent"
                  borderColor="brand.900"
                  color="brand.900"
                  fontSize="14px"
                  _hover={{ bg: "brand.900", color:"white", borderColor:"brand.900" }}
                  onClick={async () => {
                    try {
                    await loginDemo()
                    navigate("/dashboard")
                    } catch (err) {
                    console.error(err)
                    }
                }}
                >
                  Try Demo
                </Button>
              </HStack>

              <Text color="brand.700" fontSize={{ base: "16px", md: "16px" }} pt={2} textAlign={{ base: "center", md: "left" }}>
                No clutter. Just the essentials you need to manage your finances.
              </Text>
            </VStack>

            <Grid
                templateColumns="repeat(2, 1fr)"
                gap={3}
                alignItems="start"
                mt={4}
                >
                <GridItem mt={{ base: 0, md: 0 }}>
                    <Flex
                    minH={{ base: "180px", md: "240px" }}
                    bg="brand.900"
                    color="white"
                    borderRadius="xl"
                    align="center"
                    justify="center"
                    textAlign="center"
                    px={6}
                    fontFamily="Imbue, serif"
                    letterSpacing="2px"
                    transition="all 0.5s ease"
                    _hover={{
                        transform: "translateY(-4px) scale(1.01)",
                        boxShadow: "xl",
                    }}
                    >
                    <Text fontWeight="400" fontSize={{ base: "20px", md: "20px" }} lineHeight="1.5">
                        REVIEW YOUR MONTHLY
                        <br />
                        ACTIVITY
                    </Text>
                    </Flex>
                </GridItem>

                <GridItem mt={{ base: 0, md: 0 }}>
                    <Flex
                    minH={{ base: "160px", md: "200px" }}
                    bg="brand.700"
                    color="white"
                    borderRadius="xl"
                    align="center"
                    justify="center"
                    textAlign="center"
                    px={6}
                    fontFamily="Imbue, serif"
                    letterSpacing="2px"
                    transition="all 0.5s ease"
                    _hover={{
                        transform: "translateY(-4px) scale(1.01)",
                        boxShadow: "xl",
                    }}
                    >
                    <Text fontWeight="400" fontSize={{ base: "20px", md: "20px" }} lineHeight="1.5">
                        ADD TRANSACTION
                        <br />
                        EASILY
                    </Text>
                    </Flex>
                </GridItem>

                <GridItem mt={{ base: 0, md: 0 }}>
                    <Flex
                    minH={{ base: "160px", md: "200px" }}
                    bg="brand.700"
                    color="white"
                    borderRadius="xl"
                    align="center"
                    justify="center"
                    textAlign="center"
                    px={6}
                    fontFamily="Imbue, serif"
                    letterSpacing="2px"
                    transition="all 0.5s ease"
                    _hover={{
                        transform: "translateY(-4px) scale(1.01)",
                        boxShadow: "xl",
                    }}
                    >
                    <Text fontWeight="400" fontSize={{ base: "20px", md: "20px" }} lineHeight="1.5">
                        ORGANIZE WITH CATEGORIES
                    </Text>
                    </Flex>
                </GridItem>

                <GridItem mt={{ base: "-20px", md: "-40px" }}>
                    <Flex
                    minH={{ base: "180px", md: "240px" }}
                    bg="brand.900"
                    color="white"
                    borderRadius="xl"
                    align="center"
                    justify="center"
                    textAlign="center"
                    px={6}
                    fontFamily="Imbue, serif"
                    letterSpacing="2px"
                    transition="all 0.5s ease"
                    _hover={{
                        transform: "translateY(-4px) scale(1.01)",
                        boxShadow: "xl",
                    }}
                    >
                    <Text fontWeight="400" fontSize={{ base: "20px", md: "20px" }} lineHeight="1.5">
                        USE IT ON DESKTOP
                        <br />
                        OR MOBILE
                    </Text>
                    </Flex>
                </GridItem>
            </Grid>
          </SimpleGrid>
        </Box>
      </Box>

      <Box
        bg="brand.900"
        color="white"
        w="full"
        borderTop="1px solid"
        borderColor="rgba(255,255,255,0.12)"
        >
        <Box px={{ base: 4, md: 16 }} py={6}>
            <Flex
            align="center"
            justify="space-between"
            direction={{ base: "column", md: "row" }}
            position="relative"
            gap={{ base: 4, md: 0 }}
            >
            {/* Left: Brand */}
            <Link
                as={NavLink}
                to="/"
                _hover={{ textDecoration: "none", color: "white" }}
            >
                <Text
                fontFamily="Imbue, serif"
                fontWeight="400"
                letterSpacing="2px"
                fontSize="24px"
                >
                FINANCE TRACKER
                </Text>
            </Link>

            {/* Center: Copyright */}
            <Text
                position={{ base: "static", md: "absolute" }}
                left="50%"
                transform={{ base: "none", md: "translateX(-50%)" }}
                fontSize="12px"
                opacity={0.85}
            >
                Copyright © Li-Chi Hung
            </Text>

            <Flex gap={6}>
                <Link
                as={NavLink}
                to="/privacy"
                fontSize="12px"
                opacity={0.85}
                _hover={{ textDecoration: "underline", color: "white" }}
                >
                Privacy Policy
                </Link>

                <Link
                as={NavLink}
                to="/terms"
                fontSize="12px"
                opacity={0.85}
                _hover={{ textDecoration: "underline", color: "white" }}
                >
                Terms of Use
                </Link>
            </Flex>
            </Flex>
        </Box>
        </Box>
    </Flex>
  )
}