import { Box, Button, Heading, Text} from "@chakra-ui/react"
import {useNavigate} from "react-router-dom"
import {signIn} from "../auth/auth"

export default function Login() {
  const navigate = useNavigate()
  const handleLogin = () =>{
    signIn()
    navigate("/dashboard")
  }
  return (
    <Box>
      <Heading size="lg">Login</Heading>
      <Text mt={2}>Temporary login for MVP routing.</Text>
      <Button mt={6} colorScheme="teal" onClick={handleLogin}>Sign in</Button>
    </Box>
  )
}