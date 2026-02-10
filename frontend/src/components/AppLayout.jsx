import {Box, Flex, VStack, Link, Text, Button} from '@chakra-ui/react'
import {NavLink, Outlet, useNavigate} from "react-router-dom"
import {signOut} from "../auth/auth"

const navStyle = ({isActive})=>({
    textDecoration: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    background: isActive ? "#2D3748" : "transparent",
    color: "white",
})

export default function AppLayout(){

    const navigate = useNavigate()
    const handleLogout = () =>{
        signOut()
        navigate("/login", { replace: true })
    }

    return (
        <Flex minH="100vh">
            {/* Sidebar */}
            <Box w="240px" bg='gray.800' color='white' p={4}>
                <Text fontSize="lg" fontWeight="bold" mb={6}>
                    Finance Tracker
                </Text>
                <VStack align='stretch' spacing={3}>
                    <Link as={NavLink} to="/dashboard" style={navStyle}>Dashboard</Link>
                    <Link as={NavLink} to="/transactions" style={navStyle}>Transactions</Link>
                    <Link as={NavLink} to="/categories" style={navStyle}>Categories</Link>
                </VStack>
                {/* Logout */}
                <Box mt="auto" pt={6}>
                    <Button size="sm" w="full" onClick={handleLogout}>
                        Logout
                    </Button>
                </Box>
            </Box>
            {/* Main content */}
            <Box flex="1" p={8} bg='gray.50'>
                <Outlet />
            </Box>
        </Flex>
    )
}