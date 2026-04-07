import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Input, VStack, Box, Text } from "@chakra-ui/react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import FormField from "../ui/FormField"

export default function CategoryModal({
    isOpen,
    onClose,
    onSubmit,
    initialValue,
    isDemo,
}) {
    const isEdit = !!initialValue

    const {
        register,
        handleSubmit,
        reset,
        formState: {errors, isSubmitting},
    } = useForm({
        defaultValues: { name:"" }
    })

    useEffect(() => {
        if (isOpen) {
            reset({ name: initialValue?.name || "" })
        }
    }, [initialValue, isOpen, reset])

    const submit = async (values) => {
        if (isDemo) return
        await onSubmit(values.name)
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay/>
            <ModalContent  borderRadius="xl" p={4} boxShadow="soft">
                <ModalHeader>{isEdit ? "Edit Category" : "Add Category"}</ModalHeader>
                <ModalCloseButton _focus={{boxShadow: "0 0 0 2px rgba(255,255,255,0.6)"}}/>

                <ModalBody>
                    <VStack as="form" id="category-form" onSubmit={handleSubmit(submit)} spacing={4}>
                        <FormField label="Name" error={errors.name?.message}>
                            <Input
                             autoFocus
                             placeholder="e.g., Food"
                             {...register("name", {
                                required: "Category name is required.",
                                maxLength: {value: 30, message: "Max 30 characters."}
                             })}
                             autoComplete="off"
                            />
                        </FormField>
                    </VStack>
                </ModalBody>

                <ModalFooter flexDirection="column" align="stretch">
                    <Box display="flex" justifyContent="flex-end" w="full">
                        <Button variant="ghost" fontWeight="600" mr={3} onClick={onClose}>Cancel</Button>
                        <Button
                        _hover={{ bg: "transparent", color:"brand.900", borderColor:"brand.900" }}
                        type="submit"
                        form="category-form"
                        isLoading={isSubmitting}
                        isDisabled={isSubmitting || isDemo}
                        >
                            {isEdit ? "Update" : "Save"}
                        </Button>
                    </Box>

                    {isDemo ? (
                        <Text fontSize={{base: "12px", md: "14px"}} color="orange.500" mt={4} textAlign="right" w="full">
                        Demo account is read-only. Please log in.
                        </Text>
                    ) : null}
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}