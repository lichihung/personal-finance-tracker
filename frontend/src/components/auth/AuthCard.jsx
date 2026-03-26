import { Box, Heading, Text } from "@chakra-ui/react"

export default function AuthCard({ title, subtitle, children}) {
    return (
        <Box
        maxW="550px"
        w="full"
        bg="white"
        p={10}
        borderRadius="lg"
        textAlign="center"
        boxShadow="md">
            <Heading fontSize="26px">{title}</Heading>

            {subtitle ? (
                <Text mt={2} color="gray.600">
                    {subtitle}
                </Text>
            ): null}

            <Box mt={6}>{children}</Box>
        </Box>
    )
}