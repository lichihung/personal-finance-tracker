import { useEffect, useMemo, useState} from "react"
import { Box, Button, Container, FormControl, FormErrorMessage, FormLabel, Input, InputGroup, InputRightElement, Link, Text, VStack} from "@chakra-ui/react"
import { useForm } from "react-hook-form"
import { useNavigate, Link as RouterLink} from "react-router-dom"

import AuthCard from "../components/auth/AuthCard"
import FormField from "../components/ui/FormField"
import { login, register as registerUser, resendVerificationEmail } from "../api/authFetch"
import { isAuthed } from "../api/clientFetch"
import { getErrorMessage } from "../utils/messages"

export default function Login() {
  const navigate = useNavigate()
  const [mode, setMode] = useState("login")
  const [showPw, setShowPw] = useState(true)
  const [showConfirmPw, setShowConfirmPw] = useState(false)
  const [submitError, setSubmitError] = useState("")
  const [resendMessage, setResendMessage] = useState("")
  const [showResendLink, setShowResendLink] = useState(false)

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
    reset,
    formState: { errors, isSubmitting },
  } = useForm({
    defaultValues: {
      identifier: "",
      username: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  })

  const password = watch("password")

  const onSubmit = async (values) => {
    setSubmitError("")
    setResendMessage("")
    try {
      if (mode === "login") {
        await login(values.identifier, values.password)
        setShowResendLink(false)
        navigate("/dashboard", {replace: true})
      } else {
        await registerUser(values.username, values.email, values.password)

        reset({
          identifier: "",
          username: "",
          email: "",
          password: "",
          confirmPassword: "",
        })

        setMode("login")
        setShowResendLink(true)
        setSubmitError("Account created successfully. Please verify your email.")
      }
    } catch (err) {
      console.error(err)
      setSubmitError(err.message || "Unable to continue. Please try again.")
    }
  }

  const handleResendVerification = async () => {
    setResendMessage("")

    const email = watch("identifier")?.trim()

    if (!email) {
      setSubmitError("Please enter your email first.")
      return
    }

    if (!email.includes("@")) {
      setSubmitError("Please enter your email address to resend verification.")
      return
    }

    try {
      const data = await resendVerificationEmail(email)
      setResendMessage(
        data?.detail ||
          "If an account with that email exists and is not yet verified, a verification email has been sent."
      )
    } catch (err) {
      console.error(err)
      setSubmitError(err.message || "Unable to resend verification email.")
    }
  }

  return (
    <Box minH="100vh" bg="cream.50">
      <Container maxW="container.sm" py={16}>
        <Box display="flex" justifyContent="center">
          <AuthCard title={title} subtitle={subtitle}>
            <Box as="form" onSubmit={handleSubmit(onSubmit)} >
              <VStack spacing={4} align="stretch">
              {mode === "login" ? (
                <FormField label="Email or Username" error={errors.identifier?.message}>
                  <Input
                    placeholder="email@example.com or username"
                    {...register("identifier", {
                      required: "Email or username is required.",
                    })}
                  />
                </FormField>
              ) : (
                <FormField label="Username" error={errors.username?.message}>
                  <Input
                    placeholder="username"
                    {...register("username", {
                      required: "Username is required.",
                    })}
                  />
                </FormField>
              )}

                {mode === "register" ? (
                  <FormField label="Email" error={errors.email?.message}>
                    <Input
                      type="email"
                      placeholder="email@example.com"
                      {...register("email", {
                        required: "Email is required.",
                        pattern: {
                          value: /^\S+@\S+\.\S+$/,
                          message: "Enter a valid email address.",
                        },
                      })}
                    />
                  </FormField>
                ) : null}

                <FormField label="Password" error={errors.password?.message}>
                  <InputGroup>
                    <Input
                      placeholder="Minimum 8 characters"
                      type={showPw ? "password" : "text"}
                      {...register("password", {required: "Password is required.", minLength: {value: 8, message:"Password must be at least 8 characters."},})}
                    />
                    <InputRightElement width="4.5em" top="50%" transform="translateY(-50%)">
                      <Button size="sm" variant="simple" onClick={()=> setShowPw((v) => (!v))}>
                        {showPw ? "Show" : "Hide"}
                      </Button>
                    </InputRightElement>
                  </InputGroup>
                </FormField>

                {mode === "login" ? (
                  <Text fontSize="sm" textAlign="left">
                    <Link
                      as={RouterLink}
                      to="/forgot-password"
                      color="brand.800"
                      textDecoration="underline"
                      _hover={{ color: "brand.700", textDecoration: "underline" }}
                    >
                      Forgot password?
                    </Link>
                  </Text>
                ) : null}

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
                      <InputRightElement width="4.5em" top="50%" transform="translateY(-50%)">
                        <Button size="sm" variant="simple" onClick={()=> setShowConfirmPw((v) => (!v))}>
                          {showConfirmPw ? "Hide" : "Show"}
                        </Button>
                      </InputRightElement>
                    </InputGroup>

                  </FormField>
                ) : null}

                {submitError ? (
                  <Text
                    color={submitError.includes("successfully") ? "green.500" : "red.500"}
                    fontSize="sm"
                    textAlign="left"
                  >
                    {submitError}{" "}
                    {mode === "login" && showResendLink ? (
                      <Link
                        color="brand.800"
                        textDecoration="underline"
                        _hover={{ color: "brand.700", textDecoration: "underline" }}
                        onClick={handleResendVerification}
                      >
                        Resend verification email
                      </Link>
                    ) : null}
                  </Text>
                ) : null}

                {resendMessage ? (
                  <Text color="green.500" fontSize="sm" textAlign="left">
                    {resendMessage}
                  </Text>
                ) : null}

                <Button
                  mt={4}
                  mb={6}
                  colorScheme="teal"
                  type="submit"
                  isLoading={isSubmitting}
                  w="full">
                  {mode === "login" ? "Log in" : "Create account"}
                </Button>

                <Text fontSize="sm" color="gray.600" textAlign="center">
                  {mode === "login" ? (
                    <>
                    Don't have an account?{" "}
                    <Link color="brand.700" textDecoration="underline" _hover={{color: "brand.800", textDecoration: "underline"}} 
                    onClick={() => {
                      setMode("register")
                      setShowResendLink(false)
                      setSubmitError("")
                      setResendMessage("")
                    }}
                    >Sign up</Link>
                    </>
                  ) : (
                    <>
                    Already have an account?{" "}
                    <Link color="brand.700" textDecoration="underline" _hover={{color: "brand.800", textDecoration: "underline"}}
                    onClick={() => {
                      setMode("login")
                      setShowResendLink(false)
                      setSubmitError("")
                      setResendMessage("")
                    }}
                    >Log in</Link>
                    </>
                  )}
                </Text>

                <Text fontSize="xs" color="gray.500" textAlign="center" mt={0}>
                  By using this app, you agree to our{" "}
                  <Link as={RouterLink} to="/privacy" color="brand.800" textDecoration="underline" _hover={{color: "brand.700", textDecoration: "underline"}}>
                    Privacy Policy
                  </Link>{" "}
                  and{" "}
                  <Link as={RouterLink} to="/terms" color="brand.800" textDecoration="underline" _hover={{color: "brand.700", textDecoration: "underline"}}>
                    Terms of Use
                  </Link>
                </Text>
              </VStack>
            </Box>
          </AuthCard>
        </Box>
      </Container>
    </Box>
  )
}