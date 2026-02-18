import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Badge, Text, Select, HStack, Button, useDisclosure, Input, Flex, Wrap, WrapItem } from "@chakra-ui/react"
import { Spinner, Center, Alert, AlertIcon, AlertTitle, AlertDescription, useToast, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay } from "@chakra-ui/react"
import { useEffect, useState, useRef, useCallback } from "react"
import { FiFileText } from "react-icons/fi"
import { FiChevronRight, FiChevronLeft, FiPlus } from "react-icons/fi"
import TransactionFormModal from "../components/transactions/TransactionFormModal"
import { getTransactions, createTransaction, updateTransaction, deleteTransaction, getTransactionMonths } from "../api/transactionService"
import { getCategories } from "../api/categoryService"


// Badge UI for transaction type
const typeBadge = (type) => {
  if (type === "income") return <Badge variant="dark">Income</Badge>
  return <Badge variant="light">Expense</Badge>
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
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [next, setNext] = useState(null)
  const [previous, setPrevious] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [categories, setCategories] = useState([])
  const [q, setQ] = useState("")
  const [sort, setSort] = useState("date_desc")
  const [isDeleteOpen, setIsDeleteOpen] = useState(false)
  const [allMonths, setAllMonths] = useState([])

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

  const loadCategories = async () => {
    try {
      const cats = await getCategories()
      setCategories(cats)
    } catch (err) {

    }
  }

  const loadMonths = useCallback(async () => {
    try {
      const months = await getTransactionMonths({ type, category, q })
      setAllMonths(months)
    } catch {
      // ignore
    }
  }, [type, category, q])

  const reloadTransactions = useCallback(async () => {
    const data = await getTransactions({ month, type, category, q, sort, page })
    setTransactions(data.results)
    setTotalCount(data.count)
    setNext(data.next)
    setPrevious(data.previous)
  }, [month, type, category, q, sort, page])

  // initial load
  useEffect(() => {
    loadCategories()
  }, [])

  useEffect(() => {
    const onFocus = () => loadCategories()
    window.addEventListener("focus", onFocus)
    return () => window.removeEventListener("focus", onFocus)
  }, [])

  // when filters (except page) change, reset page
  useEffect(() => {
    setPage(1)
    setNext(null)
    setPrevious(null)
  }, [month, type, category, q, sort])

  // fetch transactions
  useEffect(() => {
    const run = async () => {
      setLoading(true)
      setErrorMsg("")
      try {
        await reloadTransactions()
      } catch (err) {
        setErrorMsg(err.message || "Failed to load transactions")
      } finally {
        setLoading(false)
      }
    }
    run()
  }, [reloadTransactions])

  // fetch months list (depends on type/category/q)
  useEffect(() => {
    loadMonths()
  }, [loadMonths])

  // if selected month disappears, reset to "All"
  useEffect(() => {
    if (month && !allMonths.includes(month)) setMonth("")
  }, [allMonths, month])


  const handleSave = async () => {
    if (!validateForm()) return
    setSaving(true)
    setErrorMsg("")

    try {
      const payload = {
        date: form.date,
        type: form.type,
        category_id: Number(form.category),
        description: form.description.trim(),
        amount: Number(form.amount),
      }

      if (editingId) {
        await updateTransaction(editingId, payload)
        toast({
          title: "Updated",
          description: "Transaction updated successfully.",
          status: "success",
          duration: 2000,
          isClosable: true,
        })
      } else {
        await createTransaction(payload)
        toast({
          title: "Created",
          description: "Transaction created successfully.",
          status: "success",
          duration: 2000,
          isClosable: true,
        })
      }

      // refresh UI
      await loadMonths()
      await reloadTransactions()

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

  const openDelete = () => setIsDeleteOpen(true)
  const closeDelete = () => setIsDeleteOpen(false)

  return (

    <Box w="full" px={{ base: 6, md: 16 }} >
        <Text
          fontSize={{ base: "42px", md: "80px" }}
          fontWeight="400"
          letterSpacing="2px"
          textTransform="uppercase"
          mb={12}
          mt={8}
          textAlign="center"
          color="brand.900"
          fontFamily="Imbue, serif"
        >
          Transactions
        </Text>

        <Box mb={16} >
          <Flex align="center" justify="space-between" mb={4}>
            <Wrap spacing={4} align="center">
                <WrapItem>
                  <Select placeholder="All Months" maxW="200px" size="sm" variant="pillDark" value={month} onChange={(e) => {
                    setMonth(e.target.value)
                    setPage(1)}}>
                    {allMonths.map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </Select>
                </WrapItem>
                <WrapItem>
                  <Select placeholder="All Categories" maxW="200px" size="sm" variant="pillDark" value={category} onChange={(e) => {
                    setCategory(e.target.value)
                    setPage(1)}}>
                    {categories.map((c) => (
                      <option key={c.id} value={String(c.id)}>{c.name}</option>
                    ))}
                  </Select>
                </WrapItem>
                <WrapItem>
                  <Select placeholder="All Types" maxW="200px" size="sm" variant="pillDark" value={type} onChange={(e) => {
                    setType(e.target.value)
                    setPage(1)}}>
                    <option value="income">Income</option>
                    <option value="expense">Expense</option>
                  </Select>
                </WrapItem>
                <WrapItem>
                  <Select maxW="220px" size="sm" variant="pillDark" value={sort} onChange={(e) => {
                    setSort(e.target.value)
                    setPage(1)}}>
                    <option value="date_desc">Date: New → Old </option>
                    <option value="date_asc">Date: Old → New </option>
                    <option value="amount_desc">Amount: High → Low </option>
                    <option value="amount_asc">Amount: Low → High </option>
                  </Select>
                </WrapItem>
                <WrapItem>
                  <Input placeholder="Search" maxW="260px" size="sm" variant="outline" value={q} onChange={(e) => {
                    setQ(e.target.value)
                    setPage(1)}} />
                </WrapItem>
                <WrapItem>
                  <Button variant="brandOutline" size="sm" minW="96px" onClick={() => {
                    setMonth("") 
                    setCategory("") 
                    setType("")
                    setQ("")
                    setSort("date_desc")}}>
                    Reset
                  </Button>
                </WrapItem>
            </Wrap>

            <Button variant="brandOutline" size="sm" onClick={() => { 
              setEditingId(null) 
              setForm({ date: "", type: "expense", category: "", description: "", amount: "", }) 
              setFieldErrors({}) 
              onOpen() }}
              leftIcon={<FiPlus />}
              >
              Add Transaction
              </Button>
          </Flex>
        </Box>
  
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
              if (String(err?.message || "").includes("Invalid page")) {
                setPage(1)
                return
              }
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
        <Box bg="cream.50" borderRadius="12px" p={10} textAlign="center">
          <Box w="60px" h="60px" mb={5} mx="auto" borderRadius="20px" bg="#36403b07" display="flex" alignItems="center" justifyContent="center">
            <FiFileText size={28} />
          </Box>
          <Text fontSize="lg" fontWeight="semibold" mb={2} color="ink.900">No transactions found</Text>
          <Text color="brand.700">Try adjusting your filters or add a new transaction</Text>
          <Button mt={6} mb={6} leftIcon={<FiPlus />} fontSize="sm" onClick={() => {
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
        <TableContainer bg="transparent" w="full">
          <Table variant="simple" w="full">
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
                 _hover={{ bg: "#36403b07"}}
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

    {!loading && !errorMsg && totalCount > 0 ? (
      <HStack justify="space-between" mt={20} mb={10}>
        <Text fontSize="md" color="ink.700">Total: {totalCount}</Text>
        <HStack>
          <Button variant="outline" onClick={() => setPage((p) => Math.max(1, p-1))} isDisabled={!previous} leftIcon={<FiChevronLeft />}>
            Prev
          </Button>
          <Text fontSize="md">{page}</Text>
          <Button variant="outline" onClick={() => setPage((p) => p + 1)} isDisabled={!next} rightIcon={<FiChevronRight />}>
            Next
          </Button>
        </HStack>
      </HStack>
    ) : null }


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
                  await deleteTransaction(editingId)

                   // refresh UI
                  await loadMonths()
                  await reloadTransactions()

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
