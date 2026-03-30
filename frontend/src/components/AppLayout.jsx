import { Box, Flex, HStack, VStack, Link, Text, Button, IconButton, Drawer, DrawerOverlay, DrawerContent, DrawerBody, DrawerCloseButton, useDisclosure } from "@chakra-ui/react"
import { NavLink, Outlet, useNavigate, useLocation } from "react-router-dom"
import { signOut } from "../auth/auth"
import { HamburgerIcon } from "@chakra-ui/icons"
import { FiHome } from "react-icons/fi"

const navLinkStyle = ({ isActive }) => ({
  textDecoration: "none",
  padding: "10px 10px",
  fontWeight: 400,
  color: "white",
  borderBottom: isActive ? "1px solid white" : "1px solid transparent",
})

export default function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const {isOpen, onOpen, onClose} = useDisclosure()
  const isDemo = localStorage.getItem("isDemo") === "true"

  const handleLogout = () => {
    signOut()
    localStorage.removeItem("isDemo")
    navigate("/login", { replace: true })
  }
  const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth",
    })
    }

  const getMobileTitle = () => {
    if (location.pathname === "/dashboard") return "DASHBOARD"
    if (location.pathname === "/transactions") return "TRANSACTIONS"
    if (location.pathname === "/categories") return "CATEGORIES"
    return "FINANCE TRACKER"
  }

  return (
    <Flex minH="100vh" direction="column" bg="cream.50">
      {isDemo && (
        <Box
          bg="orange.200"
          color="black"
          textAlign="center"
          py={2}
          fontSize="sm"
          fontWeight="500"
        >
            <Text>You are viewing a demo account.</Text>
            <Text>Changes are disabled.</Text>
        </Box>
      )}
      {/* Topbar */}
      <Box bg="brand.900" color="white" w="full">
        <Box px={{ base: 6, md: 16 }} py={{ base: 4, md: 5 }}>
          <Flex align="center" justify="space-between">
            {/* Mobile: left icon / Desktop: brand */}
            <Box>
                <Link as={NavLink} to="/dashboard" _hover={{ textDecoration: "none", color: "white" }}>
                <Text display={{ base: "none", md: "block" }} fontFamily="Imbue, serif" fontWeight="400" letterSpacing="2px" fontSize="24px">FINANCE TRACKER</Text>
                <Box display={{ base: "block", md: "none" }}><FiHome size={28} /></Box>
                </Link>
            </Box>

            {/* Mobile center title */}
            <Text
             display={{ base: "block", md: "none"}}
             fontFamily="Imbue, serif"
             fontWeight="400"
             letterSpacing="2px"
             fontSize="38px"
            >
             {getMobileTitle()}
            </Text>

            <HStack spacing={4} fontSize="14px" display={{ base: "none", md: "flex" }}>
              <Link as={NavLink} to="/dashboard" style={navLinkStyle}>Dashboard</Link>
              <Link as={NavLink} to="/transactions" style={navLinkStyle}>Transactions</Link>
              <Link as={NavLink} to="/categories" style={navLinkStyle}>Categories</Link>
              <Link as={NavLink} to="/privacy" style={navLinkStyle}>Privacy</Link>
              <Link as={NavLink} to="/terms" style={navLinkStyle}>Terms</Link>

              <Button
                size="sm" 
                borderColor="white" 
                color="white" 
                _hover={{ bg: "white", color: "brand.900", borderColor: "white", }}
                onClick={handleLogout}
              >
                Logout
              </Button>
            </HStack>

            {/* Mobile menu button */}
            <IconButton
             display={{ base: "inline-flex", md: "none" }}
             icon={<HamburgerIcon boxSize={8}/>}
             variant="ghost"
             color="white"
             aria-label="Open menu"
             onClick={onOpen}
             _hover={{ bg: "transparent" }}
             _active={{ bg: "transparent", borderColor: "brand.900" }}
            />
          </Flex>
        </Box>
      </Box>

      {/* Mobile drawer */}
      <Drawer placement="right" onClose={onClose} isOpen={isOpen}>
        <DrawerOverlay />
        <DrawerContent bg="brand.900" color="white">
            <DrawerCloseButton mt={2}/>
            <DrawerBody pt={16}>
             <VStack align="stretch" spacing={6}>
                <Link as={NavLink} to="/dashboard" onClick={onClose} _hover={{ color: "white", textDecoration: "none" }} _focus={{ color: "white", textDecoration: "none" }}>
                    <Text fontSize="lg">Dashboard</Text>
                </Link>
                <Link as={NavLink} to="/transactions" onClick={onClose} _hover={{ color: "white", textDecoration: "none" }} _focus={{ color: "white", textDecoration: "none" }}>
                    <Text fontSize="lg">Transactions</Text>
                </Link>
                <Link as={NavLink} to="/categories" onClick={onClose} _hover={{ color: "white", textDecoration: "none" }} _focus={{ color: "white", textDecoration: "none" }}>
                    <Text fontSize="lg">Categories</Text>
                </Link>
                <Link as={NavLink} to="/privacy" onClick={onClose} _hover={{ color: "white", textDecoration: "none" }} _focus={{ color: "white", textDecoration: "none" }}>
                    <Text fontSize="lg">Privacy Policy</Text>
                </Link>
                <Link as={NavLink} to="/terms" onClick={onClose} _hover={{ color: "white", textDecoration: "none" }} _focus={{ color: "white", textDecoration: "none" }}>
                    <Text fontSize="lg">Terms of Use</Text>
                </Link>
                <Button mt={4} variant="outline" borderColor="white" color="white" bg="transparent" _hover={{ bg: "white", color: "brand.900" }} 
                onClick={() => {
                  onClose()
                  handleLogout()  
                }}
                >Logout</Button>
             </VStack>
            </DrawerBody>
        </DrawerContent>
      </Drawer>

      {/* Main content */}
      <Box flex="1" w="full">
        <Box px={{ base: 4, md: 16 }} pt={{ base: 6, md: 8 }} pb={{ base: 6, md: 20 }}>
          <Outlet />
        </Box>
      </Box>

      {/* Footer */}
      <Box bg="brand.900" color="white" w="full" borderTop="1px solid" borderColor="rgba(255,255,255,0.12)">
        <Box px={{ base: 4, md: 16 }} py={6}>
          <Flex align="center" justify="space-between" direction={{ base: "column", md: "row" }} gap={{ base: 5, md: 0 }}>
            <Link as={NavLink} to="/dashboard" _hover={{ textDecoration: "none", color: "white" }}>
               <Text fontFamily="Imbue, serif" fontWeight="400" letterSpacing="2px" fontSize={{ base: "24px", md: "24px" }}>FINANCE TRACKER</Text>
            </Link>
            <Text opacity={0.85} fontSize="16px" cursor="pointer" _hover={{ opacity: 1 }} onClick={scrollToTop}>Back to Top</Text>
            <Text opacity={0.85} fontSize="12px">Copyright © Li-Chi Hung</Text>
          </Flex>
        </Box>
      </Box>
    </Flex>
  )
}
