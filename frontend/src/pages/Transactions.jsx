import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Badge, Text, Select, HStack, Button } from "@chakra-ui/react"
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useDisclosure } from "@chakra-ui/react"
import { FormControl, FormLabel, Input, NumberInput, NumberInputField, RadioGroup, Radio, Stack } from "@chakra-ui/react"
import { useMemo, useState } from "react"
import { mockTransactions } from "../mock/transactions"
import FormField from "../components/ui/FormField"


// Badge UI for transaction type
const typeBadge = (type) => {
  if (type === "income") return <Badge colorScheme="green">Income</Badge>
  return <Badge colorScheme="red">Expense</Badge>
}
export default function Transactions() {
  const { isOpen, onOpen, onClose } = useDisclosure()

  // Filter states
  const [month, setMonth] = useState("")
  const [category, setCategory] = useState("")
  const [type, setType] = useState("")
  const [form, setForm] = useState({
    date: "",
    type: "expense",
    category: "",
    description: "",
    amount: "",
  })
  const [errors, setErrors] = useState({})
  const [transactions, setTransactions] = useState(mockTransactions)
  const [editingId, setEditingId] = useState(null)

  // Build Month options from current transactions (auto updates after add)
  const monthOptions = useMemo(() => {
    const set = new Set()
    for (const t of transactions) set.add(t.date.slice(0, 7))
    return Array.from(set).sort().reverse()
  }, [transactions])

  // Build Category options from current transactions (auto updates after add)
  const categoryOptions = useMemo(() => {
    const set = new Set()
    for (const t of transactions) set.add(t.category)
    return Array.from(set).sort()
  }, [transactions])

  // Apply filters to transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      const matchMonth = month ? t.date.startsWith(month) : true
      const matchCategory = category ? t.category === category : true
      const matchType = type ? t.type === type : true
      return matchMonth && matchCategory && matchType
    })
  }, [transactions, month, category, type])

  // Generic form updater (updates one field at a time)
  const updateForm = (field, value) => {
    setForm((prev) => ({...prev, [field]: value}))
  }
  
  // Basic client-side validation (required fields + amount > 0)
  const validateForm = () => {
    const e = {}
    if (!form.date) e.date = "Date is required"
    if (!form.type) e.type = "Type is required"
    if (!form.category) e.category = "Category is required"
    if (!form.amount || Number(form.amount) <= 0) e.amount = "Amount must be greater than 0"
    setErrors(e)
    return Object.keys(e).length === 0
  }

  return (

    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">Transactions</Heading>
        <Button colorScheme="blue" onClick={() => {
          setEditingId(null)
          setForm({
            date: "",
            type: "expense",
            category: "",
            description: "",
            amount: "",
          })
          setErrors({})
          onOpen()
        }}>Add Transaction</Button>
      </HStack>

      <HStack spacing={4} mb={6} align="flex-end">
        <HStack spacing={4}>
          <Select placeholder="All Months" maxW="200px" value={month} onChange={(e) => setMonth(e.target.value)}>
            {monthOptions.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </Select>
          <Select placeholder="All Categories" maxW="200px" value={category} onChange={(e) => setCategory(e.target.value)}>
            {categoryOptions.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
          <Select placeholder="All Types" maxW="200px" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </Select>
        </HStack>
        <Button variant="outline" size="md" minW="96px" onClick={() => {
          setMonth("") 
          setCategory("") 
          setType("")}}>
          Reset
        </Button>
      </HStack>

    {filteredTransactions.length === 0 ? (
        <Box bg="white" borderRadius="12px" p={10} textAlign="center" boxShadow="sm">
          <Text fontSize="lg" fontWeight="semibold" mb={2}>No transactions found.</Text>
          <Text color="gray.500">Try adjusting your filters or add a new transaction</Text>
        </Box>
      ) : (
        <TableContainer bg="white" borderRadius="12px" p={4} boxShadow="sm">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Date</Th>
                <Th>Type</Th>
                <Th>Category</Th>
                <Th>Description</Th>
                <Th isNumeric>Amount</Th>
              </Tr>
            </Thead>

            <Tbody>
              {filteredTransactions.map((t) => (
                <Tr
                 key={t.id}
                 cursor="pointer"
                 _hover={{ bg: "gray.50"}}
                 onClick={() => {
                  setEditingId(t.id)
                  setForm({
                    date: t.date,
                    type: t.type,
                    category: t.category,
                    description: t.description,
                    amount: t.amount,
                  })
                  setErrors({})
                  onOpen()
                 }}
                >
                  <Td>{t.date}</Td>
                  <Td>{typeBadge(t.type)}</Td>
                  <Td>{t.category}</Td>
                  <Td>
                    <Text noOfLines={1}>{t.description}</Text>
                  </Td>
                  <Td isNumeric>{t.amount}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )}

      <Modal isOpen={isOpen} onClose={onClose} isCentered>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>
            {editingId ? "Edit Transaction" : "Add Transaction"}
          </ModalHeader>
          <ModalCloseButton />

          <ModalBody>
            <Stack spacing={4}>
              <FormField label="Date" error={errors.date}>
                <Input 
                 type="date"
                 value={form.date}
                 onChange={(e) => updateForm("date", e.target.value)}
                />
              </FormField>

              <FormField label="Type" error={errors.type}>
                <RadioGroup value={form.type} onChange={(v) => updateForm("type", v)}>
                  <Stack direction="row">
                    <Radio value="expense">Expense</Radio>
                    <Radio value="income">Income</Radio>
                  </Stack>
                </RadioGroup>
              </FormField>

              <FormField label="Category" error={errors.category}>
                <Input
                 placeholder="e.g. Food"
                 value={form.category}
                 onChange={(e) => updateForm("category", e.target.value)}
                />
              </FormField>

              <FormControl>
                <FormLabel>Description</FormLabel>
                <Input
                 placeholder="Optional"
                 value={form.description}
                 onChange={(e) => updateForm("description", e.target.value)}
                />
              </FormControl>

              <FormField label="Amount" error={errors.amount}>
                <NumberInput value={form.amount} onChange={(v) => updateForm("amount", v)}>
                  <NumberInputField />
                </NumberInput>
              </FormField>
            </Stack>
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>Cancel</Button>
            <Button colorScheme="blue" onClick={() => {
              if (!validateForm()) return

              if (editingId) {
                setTransactions((prev) =>
                  prev.map((t) =>
                    t.id === editingId ? {
                      ...t,
                      date: form.date,
                      type: form.type,
                      category: form.category.trim(),
                      description: form.description.trim(),
                      amount: Number(form.amount),
                    } : t
                  ))
              } else {
                const newTx = {
                  id: crypto.randomUUID(),
                  date: form.date,
                  type: form.type,
                  category: form.category.trim(),
                  description: form.description.trim(),
                  amount: Number(form.amount),
                  }
                setTransactions((prev) => [...prev, newTx])
              }

              setForm({
                date: "",
                type: "expense",
                category: "",
                description: "",
                amount: "",
              })
              setEditingId(null)
              setErrors({})
              onClose()
            }}>
              Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
