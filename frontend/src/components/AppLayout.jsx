import { Box, Flex, HStack, Link, Text, Button } from "@chakra-ui/react"
import { NavLink, Outlet, useNavigate } from "react-router-dom"
import { signOut } from "../auth/auth"

const navLinkStyle = ({ isActive }) => ({
  textDecoration: "none",
  padding: "10px 10px",
  fontWeight: 400,
  color: "white",
  borderBottom: isActive ? "1px solid white" : "1px solid transparent",
})

export default function AppLayout() {
  const navigate = useNavigate()
  const handleLogout = () => {
    signOut()
    navigate("/login", { replace: true })
  }
  const scrollToTop = () => {
    window.scrollTo({
        top: 0,
        behavior: "smooth",
    })
    }

  return (
    <Flex minH="100vh" direction="column" bg="cream.50">
      {/* Topbar */}
      <Box bg="brand.900" color="white" w="full">
        <Box px={{ base: 6, md: 16 }} py={{ base: 4, md: 5 }}>
          <Flex align="center" justify="space-between">
            <Link as={NavLink} to="/dashboard" _hover={{ textDecoration: "none", color: "white" }}>
               <Text fontFamily="Imbue, serif" fontWeight="400" letterSpacing="2px" fontSize="24px">FINANCE TRACKER</Text>
            </Link>


            <HStack spacing={4} fontSize="14px">
              <Link as={NavLink} to="/dashboard" style={navLinkStyle}>Dashboard</Link>
              <Link as={NavLink} to="/transactions" style={navLinkStyle}>Transactions</Link>
              <Link as={NavLink} to="/categories" style={navLinkStyle}>Categories</Link>

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
          </Flex>
        </Box>
      </Box>

      {/* Main content */}
      <Box flex="1" w="full">
        <Box px={{ base: 6, md: 16 }} py={8}>
          <Outlet />
        </Box>
      </Box>

      {/* Footer */}
      <Box bg="brand.900" color="white" w="full" borderTop="1px solid" borderColor="rgba(255,255,255,0.12)">
        <Box px={{ base: 6, md: 16 }} py={6}>
          <Flex align="center" justify="space-between">
            <Link as={NavLink} to="/dashboard" _hover={{ textDecoration: "none", color: "white" }}>
               <Text fontFamily="Imbue, serif" fontWeight="400" letterSpacing="2px" fontSize="24px">FINANCE TRACKER</Text>
            </Link>
            <Text opacity={0.85} fontSize="16px" cursor="pointer" _hover={{ opacity: 1 }} onClick={scrollToTop}>Back to Top</Text>
            <Text opacity={0.85} fontSize="12px">Copyright © Li-Chi Hung</Text>
          </Flex>
        </Box>
      </Box>
    </Flex>
  )
}
