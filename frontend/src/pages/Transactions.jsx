import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Badge, Text, Select, HStack, Button } from "@chakra-ui/react"
import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalBody, ModalFooter, ModalCloseButton, useDisclosure } from "@chakra-ui/react"
import { FormControl, FormLabel, Input, NumberInput, NumberInputField, RadioGroup, Radio, Stack } from "@chakra-ui/react"
import { useEffect, useMemo, useState } from "react"
import FormField from "../components/ui/FormField"
import { apiFetch } from "../api/clientFetch"


// Badge UI for transaction type
const typeBadge = (type) => {
  if (type === "income") return <Badge colorScheme="green">Income</Badge>
  return <Badge colorScheme="red">Expense</Badge>
}

const getCategoryName = (t) => {
  if (!t) return ""
  if (typeof t.category === "string") return t.category
  if (t.category && typeof t.category === "object" && t.category.name) return t.category.name
  return ""
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
  const [errorMsg, setErrorMsg] = useState("")
  const [fieldErrors, setFieldErrors] = useState({})
  const [loading, setLoading] = useState(true)
  const [transactions, setTransactions] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [categories, setCategories] = useState([])
  const [q, setQ] = useState("")
  const [sort, setSort] = useState("date_desc")

  const loadCategories = async () => {
    try {
      const cats = await apiFetch("/categories/")
      if (Array.isArray(cats)) setCategories(cats)
      else if (cats && Array.isArray(cats.results)) setCategories(cats.results)
      else setCategories([])
    } catch (err) {

    }
  }
  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    const onFocus = () => {
      loadCategories()
    }
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [])

  const fetchTransactions = async (params = {}) => {
    const qs = new URLSearchParams()

    if (params.month) qs.set("month", params.month)
    if (params.type) qs.set("type", params.type)
    if (params.category) qs.set("category", params.category)
    if (params.q) qs.set("q", params.q)
    if (params.sort) qs.set("sort", params.sort)

    const url = qs.toString() ? `/transactions/?${qs.toString()}` : "/transactions/"
    const data = await apiFetch(url)

    if (Array.isArray(data)) return data
    if (data && Array.isArray(data.results)) return data.results
    return []
  }


  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setErrorMsg("")
      try {
        const list = await fetchTransactions({ month, type, category, q, sort})
        setTransactions(list)
      } catch(err) {
        setErrorMsg(err.message || "Failed to load transactions")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [month, type, category, q, sort])

  // Build Month options from current transactions (auto updates after add)
  const monthOptions = useMemo(() => {
    const set = new Set()
    for (const t of transactions) {
      if (t && typeof t.date === "string") set.add(t.date.slice(0, 7))
    }
    return Array.from(set).sort().reverse()
  }, [transactions])

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
    setFieldErrors(e)
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
          setFieldErrors({})
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
            {categories.map((c) => (
              <option key={c.id} value={String(c.id)}>{c.name}</option>
            ))}
          </Select>
          <Select placeholder="All Types" maxW="200px" value={type} onChange={(e) => setType(e.target.value)}>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </Select>
          <Select maxW="220px" value={sort} onChange={(e) => setSort(e.target.value)}>
            <option value="date_desc">Date: New → Old </option>
            <option value="date_asc">Date: Old → New </option>
            <option value="amount_desc">Amount: High → Low </option>
            <option value="amount_asc">Amount: Low → High </option>
          </Select>
          <Input placeholder="Search" maxW="260px" value={q} onChange={(e) => setQ(e.target.value)} />
        </HStack>
        <Button variant="outline" size="md" minW="96px" onClick={() => {
          setMonth("") 
          setCategory("") 
          setType("")
          setQ("")
          setSort("date_desc")}}>
          Reset
        </Button>
      </HStack>

    {loading ? <Text>Loading</Text> : null}
    {errorMsg ? <Text color="red.500">{errorMsg}</Text> : null}

    {!loading && !errorMsg ? (
      transactions.length === 0 ? (
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
              {transactions.map((t) => (
                <Tr
                 key={t.id}
                 cursor="pointer"
                 _hover={{ bg: "gray.50"}}
                 onClick={() => {
                  setEditingId(t.id)

                  let categoryValue = ""
                  if (t.category && typeof t.category === "object" && t.category.id != null) {
                    categoryValue = String(t.category.id)
                  } else if (t.category != null) {
                    categoryValue = String(t.category)
                  }

                  setForm({
                    date: t.date,
                    type: t.type,
                    category: categoryValue,
                    description: t.description,
                    amount: t.amount,
                  })
                  setFieldErrors({})
                  onOpen()
                 }}
                >
                  <Td>{t.date}</Td>
                  <Td>{typeBadge(t.type)}</Td>
                  <Td>{getCategoryName(t)}</Td>
                  <Td>
                    <Text noOfLines={1}>{t.description}</Text>
                  </Td>
                  <Td isNumeric>{t.amount}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      )
    ) : null}

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
              <Button
                colorScheme="red"
                variant="ghost"
                mr={3}
                onClick={async () => {
                  const ok = window.confirm("Delete this transaction?")
                  if (!ok) return

                  setErrorMsg("")
                  try {
                    await apiFetch(`/transactions/${editingId}/`, { method: "DELETE"})
                    const list = await fetchTransactions({ month, type, category })
                    setTransactions(list)
                    onClose()
                    setEditingId(null)
                  } catch (err){
                    setErrorMsg(err.data ? JSON.stringify(err.data) : (err.message || "Delete failed"))
                  }
                }}
                >
                Delete
              </Button>
            ): null}
            <Button colorScheme="blue" onClick={async () => {
              if (!validateForm()) return

              if (editingId) {
                const payload = {
                  date: form.date,
                  type: form.type,
                  category_id: Number(form.category),
                  description: form.description.trim(),
                  amount: Number(form.amount),
                }

                await apiFetch("/transactions/" + editingId + "/", {
                  method: "PATCH",
                  body: payload,
                })

                const list = await fetchTransactions({ month, type, category })
                setTransactions(list)
              } else {
                const payload = {
                  date: form.date,
                  type: form.type,
                  category_id: Number(form.category),
                  description: form.description.trim(),
                  amount: Number(form.amount),
                  }

                try {
                  await apiFetch("/transactions/", {
                    method: "POST",
                    body: payload,
                  })
                } catch (err) {
                  console.log("POST status:", err.status)
                  console.log("POST data:", err.data)
                  setErrorMsg(err.data ? JSON.stringify(err.data) : (err.message || "Create failed"))
                  return
                }


                const list = await fetchTransactions({ month, type, category })
                setTransactions(list)
              }

              setForm({
                date: "",
                type: "expense",
                category: "",
                description: "",
                amount: "",
              })
              setEditingId(null)
              setFieldErrors({})
              onClose()
            }}>
              Save</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </Box>
  )
}
