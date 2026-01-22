import { useEffect, useMemo, useState} from "react"
import { Box, Button, Container, FormControl, FormErrorMessage, FormLabel, Input, InputGroup, InputRightElement, Link, Text, VStack} from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import { useNavigate} from "react-router-dom"

import AuthCard from "../components/auth/AuthCard"
import { isAuthed, signIn} from "../auth/auth"

function isValidEmail(value){
  return value.includes("@") || "Please enter a valid email."
}

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState("login")
  const [showPw, setShowPw] = useState("true")

  const title = useMemo(
    () => (mode === "login" ? "Welcome back" : "Create account"), [mode]
  )
  const subtitle = useMemo(
    () => (mode === "login" ? "Track your income and expenses" : "It takes less than a minute"), [mode]
  )

  useEffect(() => {
    if (isAuthed()) navigate("/dashboard", {replace: true})
  }, [navigate])

  const {
    register,
    handleSubmit,
    watch,
    formState: {errors, isSubmitting},
  } = useForm({
    defaultValues: {email: "", password: "", confirmPassword: ""},
  })
  const password = watch("password")

  const onSubmit = async (values) => {
    signIn()
    navigate("/dashboard")
  }

  return (
    <Container maxW="container.sm" py={16}>
      <Box display="flex" justifyContent="center">
        <AuthCard title={title} subtitle={subtitle}>
          <Box as="form" onSubmit={handleSubmit(onSubmit)}>
            <VStack spacing={4} align="stretch">
              <FormControl isInvalid={!!errors.email}>
                <FormLabel>Email</FormLabel>
                <Input
                  placeholder="liz@example.com"
                  {...register("email", {required: "Email is required.", validate: isValidEmail})}
                />
                <FormErrorMessage>{errors.email?.message}</FormErrorMessage>
              </FormControl>

              <FormControl isInvalid={!!errors.password}>
                <FormLabel>Password</FormLabel>
                <InputGroup>
                  <Input
                    placeholder="Minimum 8 characters"
                    type={showPw ? "password" : "text"}
                    {...register("password", {required: "Password is required.", minLength: {value: 8, message:"Password must be at least 8 characters."},})}
                  />
                  <InputRightElement width="4.5em">
                    <Button h="1.75rem" size="sm" variant="ghost" onClick={()=> setShowPw((v) => (!v))}>
                      {showPw ? "Show" : "Hide"}
                    </Button>
                  </InputRightElement>
                </InputGroup>
                <FormErrorMessage>{errors.password?.message}</FormErrorMessage>
              </FormControl>

              {mode === "register" ? (
                <FormControl isInvalid={!!errors.confirmPassword}>
                  <FormLabel>Confirm Password</FormLabel>
                  <Input
                    placeholder="Re-enter password"
                    type={showPw ? "password" : "text"}
                    {...register("confirmPassword", {
                      required: "Please confrim your password.", 
                      validate: (v) => v === password || "Password do not match",})}
                  />
                  <FormErrorMessage>{errors.confirmPassword?.message}</FormErrorMessage>
                </FormControl>
              ) : null}

              <Button
                mt={2}
                colorScheme="teal"
                type="submit"
                isLoading={isSubmitting}
                w="full">
                {mode === "login" ? "Sign in" : "Create account"}
              </Button>

              <Text fontSize="sm" color="gray.600" textAlign="center">
                {mode === "login" ? (
                  <>
                   Don't have an account?{" "}
                   <Link color="teal.600" onClick={() => setMode("register")}>Sign up</Link>
                  </>
                ) : (
                  <>
                   Already have an account?{" "}
                   <Link color="teal.600" onClick={() => setMode("login")}>Sign in</Link>
                  </>
                )}
              </Text>
            </VStack>
          </Box>
        </AuthCard>
      </Box>
    </Container>
  )
}