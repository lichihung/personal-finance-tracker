import {
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton,
  FormControl, FormLabel, Input, NumberInput,
  NumberInputField, RadioGroup, Radio, Stack,
  Button, Select, Text, Link
} from "@chakra-ui/react"

import FormField from "../ui/FormField"

export default function TransactionFormModal(props) {
    const { isOpen, onClose, editingId, form, updateForm, fieldErrors, categories, saving, onSave, onDelete, isDemo } = props

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent borderRadius="xl" p={4} boxShadow="soft">
                <ModalHeader>
                {editingId ? "Edit Transaction" : "Add Transaction"}
                </ModalHeader>
                <ModalCloseButton />
    
                <ModalBody>
                <Stack spacing={4}>
                    <FormField label="Date" error={fieldErrors.date}>
                    <Input 
                        type="date"
                        value={form.date}
                        onChange={(e) => updateForm("date", e.target.value)}
                    />
                    </FormField>
    
                    <FormField label="Type" error={fieldErrors.type}>
                    <RadioGroup value={form.type} onChange={(v) => updateForm("type", v)}>
                        <Stack direction="row">
                        <Radio value="expense">Expense</Radio>
                        <Radio value="income">Income</Radio>
                        </Stack>
                    </RadioGroup>
                    </FormField>
    
                    <FormField label="Category" error={fieldErrors.category}>
                        <>
                            <Select
                                placeholder="Select category"
                                value={form.category}
                                onChange={(e) => updateForm("category", e.target.value)}>
                                {categories.map((c) => (
                                    <option key={c.id} value={c.id}>
                                    {c.name}
                                    </option>
                                ))}
                            </Select>
                            <Text mt={2} fontSize="sm" color="gray.600">
                                Can't find a category?{" "}
                                <Link href="/categories" color="brand.800" _hover={{color: "brand.700", textDecoration: "underline"}}>Create Category</Link>
                            </Text>
                        </>
                    </FormField>
    
                    <FormControl>
                    <FormLabel>Description</FormLabel>
                    <Input
                        placeholder="Optional"
                        value={form.description}
                        onChange={(e) => updateForm("description", e.target.value)}
                    />
                    </FormControl>
    
                    <FormField label="Amount" error={fieldErrors.amount}>
                    <NumberInput value={form.amount} onChange={(v) => updateForm("amount", v)}>
                        <NumberInputField />
                    </NumberInput>
                    </FormField>
                </Stack>
                </ModalBody>
    
                <ModalFooter flexDirection="column" align="stretch">
                    <Box display="flex" justifyContent="flex-end" w="full">

                       <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
                        { editingId ? (
                            <Button colorScheme="red" variant="ghost" mr={3} onClick={onDelete} isDisabled={isDemo}>
                            Delete
                            </Button>
                        ): null}
                        <Button _hover={{ bg: "transparent", color:"brand.900", borderColor:"brand.900" }} isLoading={saving} isDisabled={saving || isDemo} onClick={onSave}>
                            Save
                        </Button>

                        {isDemo ? (
                            <Text fontSize="12px" color="orange.500" mt={2} textAlign="right" w="full">
                                Demo account is read-only.
                            </Text>
                        ) : null}
                    </Box>


                </ModalFooter>
            </ModalContent>
            </Modal>
    )
}