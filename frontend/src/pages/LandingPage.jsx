import { Box, Button, Flex, HStack, Link, SimpleGrid, Text, VStack, Grid, GridItem, Accordion, AccordionItem, AccordionButton, AccordionPanel, AccordionIcon } from "@chakra-ui/react"
import { NavLink, useNavigate } from "react-router-dom"
import { loginDemo } from "../api/authFetch"
import { useEffect, useRef, useState } from "react"
import { signOut } from "../auth/auth"
import { trackEvent } from "../utils/analytics"

export default function LandingPage() {
  const navigate = useNavigate()
  const sectionRef = useRef(null)
  const [isVisible, setIsVisible] = useState(false)
  const gridRef = useRef(null)
  const [gridVisible, setGridVisible] = useState(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true)
        }
      },
      { threshold: 0.3 }
    )

    if (sectionRef.current) {
      observer.observe(sectionRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setGridVisible(true)
        }
      },
      { threshold: 0.2 }
    )

    if (gridRef.current) {
      observer.observe(gridRef.current)
    }

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    trackEvent("landing_page_view")
  }, [])

  const getCardAnimation = (delay) => ({
    opacity: gridVisible ? 1 : 0,
    transform: gridVisible ? "translateY(0)" : "translateY(30px)",
    transition: `opacity 1.8s cubic-bezier(0.32, 1, 0.44, 1) ${delay}s, transform 1.8s cubic-bezier(0.32, 1, 0.44, 1) ${delay}s`,
  })

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

            <HStack spacing={{ base: 4, md: 8 }} fontSize={{ base: "12px", md: "14px" }}>
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
                _hover={{ textDecoration: "none", color: "white" }}
                onClick={() => {
                  signOut()
                  localStorage.removeItem("isDemo")
                  navigate("/login")
                }}
              >
                Login
              </Text>
            </HStack>
          </Flex>
        </Box>
      </Box>

      <Box flex="1" w="full">
        <Box maxW="1200px" mx="auto" px={{ base: 6, md: 16 }} pt={{ base: 20, md: 28 }} pb={{ base: 8, md: 10 }}>
          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 10, md: 16 }} alignItems="center">

            <VStack align={{ base: "center", md: "start"}} spacing={14}>
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
                YOUR DAILY
                <br />
                SPENDING,
                <br />
                SIMPLIFIED
              </Text>

              <Text
                color="gray.700"
                fontSize={{ base: "16px", md: "16px" }}
                lineHeight="1.5"
                maxW="720px"
                textAlign={{ base: "center", md: "left" }}
                letterSpacing="1px"
              >
                A clean and minimal finance tracker that helps you log transactions and understand your habits.
                <br />
                Like writing a daily journal.
              </Text>

              <HStack spacing={6} pt={1.5} justify={{ base: "center", md: "flex-start" }}>
                <Button
                  size="md"
                  px={{ base: 6, md: 10 }}
                  borderRadius="full"
                  fontSize="14px"
                  _hover={{ bg: "transparent", color:"brand.900", borderColor:"brand.900" }}
                  onClick={() => {
                    trackEvent("click_signup", {
                      page: "landing",
                    })
                    signOut()
                    localStorage.removeItem("isDemo")
                    navigate("/login")
                  }}
                >
                  Get Started
                </Button>

                <Button
                  size="md"
                  px={{ base: 6, md: 10 }}
                  borderRadius="full"
                  backgroundColor="transparent"
                  borderColor="brand.900"
                  color="brand.900"
                  fontSize="14px"
                  _hover={{ bg: "brand.900", color:"white", borderColor:"brand.900" }}
                  onClick={async () => {
                    trackEvent("click_demo", {
                      page: "landing",
                    })
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
            </VStack>

            <Grid
                ref={gridRef}
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
                    style={getCardAnimation(0)}
                    _hover={{
                      transform: "translateY(-6px) scale(1.02)",
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
                    style={getCardAnimation(1)}
                    _hover={{
                      transform: "translateY(-6px) scale(1.02)",
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
                    style={getCardAnimation(1.5)}
                    _hover={{
                      transform: "translateY(-6px) scale(1.02)",
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
                    style={getCardAnimation(0.5)}
                    _hover={{
                      transform: "translateY(-6px) scale(1.02)",
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

      <Box ref={sectionRef} px={{ base: 6, md: 16 }} mb={{ base: 36, md: 40 }} mt={{ base: 44, md: 60 }}>
        <VStack
          maxW="820px"
          mx="auto"
          spacing={4}
          textAlign="center"
          transform={isVisible ? "translateY(0)" : "translateY(20px)"}
          opacity={isVisible ? 1 : 0}
          transition="all 1.8s ease"
        >
          <Text
            fontFamily="Imbue, serif"
            fontWeight="500"
            letterSpacing="2px"
            textTransform="uppercase"
            color="brand.900"
            fontSize={{ base: "40px", md: "50px" }}
            lineHeight="1.4"
          >
            More thoughtful, less overwhelming
          </Text>

          <Text
            color="brand.800"
            fontSize={{ base: "15px", md: "16px" }}
            lineHeight="1.8"
            maxW="760px"
            letterSpacing="2px"
          >
            Finance Tracker is like keeping a quiet record of everyday life.
          </Text>
        </VStack>
      </Box>

      <Box maxW="800px" mx="auto" py={20} mb={20}>
        <Text fontWeight={500} fontSize={{ base: "24px", md: "34px"}} mb={10} textAlign="center" px={4} letterSpacing="2px" fontFamily="Imbue, serif" textTransform="uppercase">
          Frequently Asked Questions
        </Text>

        <Accordion allowToggle w={{ base: "340px", md: "800px"}} mx="auto">
          <AccordionItem border="none" borderBottom="1px solid" borderColor="line.400">
            <h2>
              <AccordionButton px={0} py={5} _hover={{ bg: "transparent", borderColor: "cream.50" }} _focus={{ boxShadow: "none", outline: "none" }} _expanded={{ bg: "transparent" }}>
                <Box flex="1" textAlign="left">
                  <Text fontWeight={600} color="gray.700" fontSize={{ base: "16px", md:"16px"}} letterSpacing="1px">
                    Is my data secure?
                  </Text>
                </Box>
                  <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel px={0} pb={8}>
              <Text color="brand.800" fontWeight={500} fontSize="14px" letterSpacing="1px">
                Yes. Each account can only access its own data. Authentication is handled securely using JWT.
              </Text>
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem border="none" borderBottom="1px solid" borderColor="line.400">
            <h2>
              <AccordionButton px={0} py={5} _hover={{ bg: "transparent", borderColor: "cream.50" }} _focus={{ boxShadow: "none", outline: "none" }} _expanded={{ bg: "transparent" }}>
                <Box flex="1" textAlign="left">
                  <Text fontWeight={600} color="gray.700" fontSize={{ base: "16px", md:"16px"}} letterSpacing="1px">
                    Can I try the app without signing up?
                  </Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel px={0} pb={8}>
              <Text color="brand.800" fontWeight={500} fontSize="14px" letterSpacing="1px">
                Yes. You can use the demo account to explore the app. Demo mode is read-only.
              </Text>
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem border="none" borderBottom="1px solid" borderColor="line.400">
            <h2>
              <AccordionButton px={0} py={5} _hover={{ bg: "transparent", borderColor: "cream.50" }} _focus={{ boxShadow: "none", outline: "none" }} _expanded={{ bg: "transparent" }}>
                <Box flex="1" textAlign="left">
                  <Text fontWeight={600} color="gray.700" fontSize={{ base: "16px", md:"16px"}} letterSpacing="1px">
                    Can I edit or delete data in demo mode?
                  </Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel px={0} pb={8}>
              <Text color="brand.800" fontWeight={500} fontSize="14px" letterSpacing="1px">
                No. Demo mode is read-only to prevent changes to shared data.
              </Text>
            </AccordionPanel>
          </AccordionItem>

          <AccordionItem border="none" borderBottom="1px solid" borderColor="line.400">
            <h2>
              <AccordionButton px={0} py={5} _hover={{ bg: "transparent", borderColor: "cream.50" }} _focus={{ boxShadow: "none", outline: "none" }} _expanded={{ bg: "transparent" }}>
                <Box flex="1" textAlign="left">
                  <Text fontWeight={600} color="gray.700" fontSize={{ base: "16px", md:"16px"}} letterSpacing="1px">
                    What happens if I forget my password?
                  </Text>
                </Box>
                <AccordionIcon />
              </AccordionButton>
            </h2>
            <AccordionPanel px={0} pb={8}>
              <Text color="brand.800" fontWeight={500} fontSize="14px" letterSpacing="1px">
                You can reset your password using the “Forgot password” link on the login page.
              </Text>
            </AccordionPanel>
          </AccordionItem>
        </Accordion>
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

            <Text
                position={{ base: "static", md: "absolute" }}
                left="50%"
                transform={{ base: "none", md: "translateX(-50%)" }}
                fontSize="12px"
                opacity={0.85}
            >
                Copyright © Verdia
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