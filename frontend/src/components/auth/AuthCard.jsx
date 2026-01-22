import { Box, Heading, Text } from "@chakra-ui/react"

export default function AuthCard({ title, subtitle, children}) {
    return (
        <Box
        maxW="420px"
        w="full"
        bg="white"
        p={8}
        borderRadius="lg"
        boxShadow="md">
            <Heading size="md">{title}</Heading>

            {subtitle ? (
                <Text mt={2} color="gray.600">
                    {subtitle}
                </Text>
            ): null}

            <Box mt={6}>{children}</Box>
        </Box>
    )
}