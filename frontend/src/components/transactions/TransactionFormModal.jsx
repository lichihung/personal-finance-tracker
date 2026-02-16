import {
  Modal, ModalOverlay, ModalContent, ModalHeader,
  ModalBody, ModalFooter, ModalCloseButton,
  FormControl, FormLabel, Input, NumberInput,
  NumberInputField, RadioGroup, Radio, Stack,
  Button, Select
} from "@chakra-ui/react"

import FormField from "../ui/FormField"

export default function TransactionFormModal(props) {
    const { isOpen, onClose, editingId, form, updateForm, fieldErrors, categories, saving, onSave, onDelete } = props

    return (
        <Modal isOpen={isOpen} onClose={onClose} isCentered>
            <ModalOverlay />
            <ModalContent>
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
    
                <ModalFooter>
                <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
                { editingId ? (
                    <Button colorScheme="red" variant="ghost" mr={3} onClick={onDelete}>
                    Delete
                    </Button>
                ): null}
                <Button colorScheme="blue" isLoading={saving} isDisabled={saving} onClick={onSave}>
                    Save
                </Button>
                </ModalFooter>
            </ModalContent>
            </Modal>
    )
}