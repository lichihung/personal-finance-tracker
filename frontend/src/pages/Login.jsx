import { useEffect, useMemo, useState} from "react"
import { Box, Button, Container, FormControl, FormErrorMessage, FormLabel, Input, InputGroup, InputRightElement, Link, Text, VStack} from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import { useNavigate} from "react-router-dom"

import AuthCard from "../components/auth/AuthCard"
import FormField from "../components/ui/FormField"
import { login, register as registerUser } from "../api/authFetch"
import { isAuthed } from "../api/clientFetch"

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState("login")
  const [showPw, setShowPw] = useState(true)
  const [showConfirmPw, setShowConfirmPw] = useState(false)

  const title = useMemo(
    () => (mode === "login" ? "Welcome back" : "Create account"), [mode]
  )
  const subtitle = useMemo(
    () => (mode === "login" ? "Track your income and expenses" : "It takes less than a minute"), [mode]
  )

  useEffect(() => {
    if (isAuthed()) {
      navigate("/dashboard", { replace: true })
    }
  }, [navigate])

  const {
    register,
    handleSubmit,
    watch,
    formState: {errors, isSubmitting},
  } = useForm({
    defaultValues: {username: "", password: "", confirmPassword: ""},
  })
  const password = watch("password")

  const onSubmit = async (values) => {
    try {
      if (mode === "login") {
        await login(values.username, values.password)
        navigate("/dashboard", {replace: true})
      } else {
        await registerUser(values.username, values.password)
        await login(values.username, values.password)
        navigate("/dashboard", {replace: true})
      }
    } catch (err) {
      console.error(err)
      alert(err.message || "Failed")
    }
  }

  return (
    <Container maxW="container.sm" py={16}>
      <Box display="flex" justifyContent="center">
        <AuthCard title={title} subtitle={subtitle}>
          <Box as="form" onSubmit={handleSubmit(onSubmit)}>
            <VStack spacing={4} align="stretch">
              <FormField label="Username" error={errors.username?.message}>
                <Input
                  placeholder="username"
                  {...register("username", {required: "Username is required."})}
                />
              </FormField>

              <FormField label="Password" error={errors.password?.message}>
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
              </FormField>

              {mode === "register" ? (
                <FormField label="Confirm Password" error={errors.confirmPassword?.message}>
                  <InputGroup>
                    <Input
                      placeholder="Re-enter password"
                      type={showConfirmPw ? "text" : "password"}
                      {...register("confirmPassword", {
                        required: "Please confrim your password.", 
                        validate: (v) => v === password || "Password do not match",})}
                    />
                    <InputRightElement width="4.5em">
                      <Button h="1.75rem" size="sm" variant="ghost" onClick={()=> setShowConfirmPw((v) => (!v))}>
                        {showConfirmPw ? "Show" : "Hide"}
                      </Button>
                    </InputRightElement>
                  </InputGroup>

                </FormField>
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