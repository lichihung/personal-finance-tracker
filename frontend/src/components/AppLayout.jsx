import {Box, Flex, VStack, Link, Text} from '@chakra-ui/react'
import {NavLink, Outlet} from "react-router-dom"

const navStyle = ({isActive})=>({
    textDecoration: "none",
    padding: "8px 12px",
    borderRadius: "6px",
    background: isActive ? "#2D3748" : "transparent",
    color: "white",
})

export default function AppLayout(){
    return (
        <Flex minH="100vh">
            {/* Sidebar */}
            <Box w="240px" bg='gray.800' color='white' p={4}>
                <Text font-size="lg" fontWeight="bold" mb={6}>
                    Finance Tracker
                </Text>
                <VStack align='stretch' spacing={3}>
                    <Link as={NavLink} to="/dashboard" style={navStyle}>Dashboard</Link>
                    <Link as={NavLink} to="/transactions" style={navStyle}>Transactions</Link>
                    <Link as={NavLink} to="/categories" style={navStyle}>Categories</Link>
                </VStack>
                {/* Logout */}
                <Box mt="auto" pt={6}>
                    <Text fontSize="sm" opacity={0.7}>
                        Logout (coming soon)
                    </Text>
                </Box>
            </Box>
            {/* Main content */}
            <Box flex="1" p={8} bg='gray.50'>
                <Outlet />
            </Box>
        </Flex>
    )
}