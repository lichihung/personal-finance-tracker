import {FormControl, FormLabel, FormErrorMessage} from "@chakra-ui/react"

export default function FormField({label, error, children}){
    return (
        <FormControl isInvalid={!!error}>
            <FormLabel>{label}</FormLabel>
            {children}
            <FormErrorMessage>{error}</FormErrorMessage>
        </FormControl>
    )
}