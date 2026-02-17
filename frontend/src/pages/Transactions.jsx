import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Badge, Text, Select, HStack, Button, useDisclosure, Input} from "@chakra-ui/react"
import { Spinner, Center, Alert, AlertIcon, AlertTitle, AlertDescription, useToast, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay } from "@chakra-ui/react"
import { useEffect, useMemo, useState, useRef } from "react"
import { FiFileText } from "react-icons/fi"
import TransactionFormModal from "../components/transactions/TransactionFormModal"
import { getTransactions, createTransaction, updateTransaction, deleteTransaction } from "../api/transactionService"
import { getCategories } from "../api/categoryService"


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
  const toast = useToast()
  const cancelRef = useRef()

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
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [transactions, setTransactions] = useState([])
  const [editingId, setEditingId] = useState(null)
  const [categories, setCategories] = useState([])
  const [q, setQ] = useState("")
  const [sort, setSort] = useState("date_desc")
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [allMonths, setAllMonths] = useState([])

  const upsertMonthOption = (dateStr) => {
    if (!dateStr || typeof dateStr !== "string") return
    const ym = dateStr.slice(0, 7)

    setAllMonths((prev) => {
      if(prev.includes(ym)) return prev
      return [ym, ...prev].sort().reverse()
    })
  }

  const removeMonthIfEmpty = (ym) => {
    if (!ym) return

    const remaining = new Set()
    for (const t of transactions) {
      if (t?.data) remaining.add(t.date.slice(0, 7))
    }
    
    if (!remaining.has(ym)) {
      setAllMonths((prev) => prev.filter((m) => m !== ym))
      setMonth((prev) => (prev === ym ? "" : prev))
    }
  }
  const handleSave = async () => {
    if (!validateForm()) return
    setSaving(true)
    setErrorMsg("")

    try {
      if (editingId) {
        const payload = {
          date: form.date,
          type: form.type,
          category_id: Number(form.category),
          description: form.description.trim(),
          amount: Number(form.amount),
        }

        await updateTransaction(editingId, payload)
        upsertMonthOption(form.date)
        await reloadTransactions()

        toast({
          title: "Updated",
          description: "Transaction updated successfully.",
          status: "success",
          duration: 2000,
          isClosable: true,
        })
      } else {
        const payload = {
          date: form.date,
          type: form.type,
          category_id: Number(form.category),
          description: form.description.trim(),
          amount: Number(form.amount),
          }

        await createTransaction(payload)
        upsertMonthOption(form.date)
        await reloadTransactions()

        toast({
          title: "Created",
          description: "Transaction created successfully.",
          status: "success",
          duration: 2000,
          isClosable: true,
        })
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
    } catch (err) {
      setErrorMsg(err.data ? JSON.stringify(err.data) : (err.message || "Save failed"))
    } finally {
      setSaving(false)
    }
  }

  const loadCategories = async () => {
    try {
      const cats = await getCategories()
      setCategories(cats)
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
  
  const reloadTransactions = async () => {
    const list = await getTransactions({ month, type, category, q, sort})
    setTransactions(list)
  }

  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setErrorMsg("")
      try {
        await reloadTransactions()
      } catch(err) {
        setErrorMsg(err.message || "Failed to load transactions")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [month, type, category, q, sort])

  useEffect(() => {
    const loadMonthOptions = async () => {
      try {
        const list = await getTransactions({ type, category, q, sort})
        const set = new Set()
        for (const t of list) {
          if (t?.date) set.add(t.date.slice(0,7))
        }
        setAllMonths(Array.from(set).sort().reverse())
      } catch (err) {

      }
    }
    loadMonthOptions()
  }, [])

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

  const openDelete = () => setIsDeleteOpen(true)
  const closeDelete = () => setIsDeleteOpen(false)

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
            {allMonths.map((m) => (
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

    {loading ? (
      <Center py={16}>
        <HStack spacing={3}>
          <Spinner />
          <Text>Loading transactions...</Text>
        </HStack>
      </Center>
    ) : null }

    {!loading && errorMsg ? (
      <Alert status="error" borderRadius="12px" mb={6}>
        <AlertIcon />
        <Box flex="1">
          <AlertTitle>Failed to load transactions</AlertTitle>
          <AlertDescription>{errorMsg}</AlertDescription>
        </Box>
        <Button
          variant="ghost"
          size="sm"
          onClick={async () => {
            setLoading(true)
            setErrorMsg("")
            try {
              await reloadTransactions()
            } catch (err) {
              setErrorMsg(err.message || "Failed to load transactions")
            } finally {
              setLoading(false)
            }
          }}
          >
          Retry
        </Button>
      </Alert>
    ) : null}

    {!loading && !errorMsg ? (
      transactions.length === 0 ? (
        <Box bg="white" borderRadius="12px" p={10} textAlign="center" boxShadow="sm">
          <Box w="72px" h="72px" mx="auto" mb={5} borderRadius="20px" bg="blue.50" display="flex" alignItems="center" justifyContent="center">
            <FiFileText size={32} color="#3182CE" />
          </Box>
          <Text fontSize="lg" fontWeight="semibold" mb={2}>No transactions found.</Text>
          <Text color="gray.500">Try adjusting your filters or add a new transaction</Text>
          <Button mt={6} colorScheme="blue" onClick={() => {
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
          }}>
            Add Transaction
          </Button>
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

      <TransactionFormModal
        isOpen={isOpen}
        onClose={onClose}
        editingId={editingId}
        form={form}
        updateForm={updateForm}
        fieldErrors={fieldErrors}
        categories={categories}
        saving={saving}
        onSave={handleSave}
        onDelete={openDelete}
       />

      <AlertDialog
        isOpen={isDeleteOpen}
        leastDestructiveRef={cancelRef}
        onClose={closeDelete}
        isCentered
      >
        <AlertDialogOverlay />
        <AlertDialogContent>
          <AlertDialogHeader fontSize="lg" fontWeight="bold">
            Delete Transaction
          </AlertDialogHeader>

          <AlertDialogBody>
            Are you sure? This action cannot be undone.
          </AlertDialogBody>

          <AlertDialogFooter>
            <Button ref={cancelRef} onClick={closeDelete}>Cancel</Button>
            <Button
              colorScheme="red"
              ml={3}
              isLoading={deleting}
              isDisabled={deleting}
              onClick={async () => {
                setDeleting(true)
                setErrorMsg("")
                try {
                  const deletedYm = transactions.find((t) => t.id === editingId)?.date?.slice(0, 7)
                  await deleteTransaction(editingId)
                  await reloadTransactions()
                  removeMonthIfEmpty(deletedYm)

                  toast({
                    title: "Deleted",
                    description: "Transaction deleted successfully.",
                    status: "success",
                    duration: 2000,
                    isClosable: true,
                  })

                  closeDelete()
                  onClose()
                  setEditingId(null)
                } catch (err) {
                  setErrorMsg(err.data ? JSON.stringify(err.data) : (err.message || "Delete failed"))
                  closeDelete()
                } finally {
                  setDeleting(false)
                }
              }}
              >
              Delete
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Box>
  )
}
