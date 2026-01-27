import { Button, Modal, ModalBody, ModalCloseButton, ModalContent, ModalFooter, ModalHeader, ModalOverlay, Input, VStack} from "@chakra-ui/react"
import { useEffect } from "react"
import { useForm } from "react-hook-form"
import FormField from "../ui/FormField"

export default function CategoryModal({
    isOpen,
    onClose,
    onSubmit,
    initialValue,
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
        reset({ name: initialValue?.name || ""})
    }, [initialValue, reset])

    const submit = async (values) => {
        await onSubmit(values.name)
        onClose()
    }

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay/>
            <ModalContent>
                <ModalHeader>{isEdit ? "Edit Category" : "Add Category"}</ModalHeader>
                <ModalCloseButton/>

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
                            />
                        </FormField>
                    </VStack>
                </ModalBody>

                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
                    <Button
                     colorScheme="teal"
                     type="submit"
                     form="category-form"
                     isLoading={isSubmitting}
                    >
                        {isEdit ? "Update" : "Save"}
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    )
}