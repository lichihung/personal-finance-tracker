import { Box, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Badge, Text, Select, HStack, Button, useDisclosure, Input, Flex, Wrap, WrapItem, Drawer, DrawerOverlay, DrawerContent, DrawerHeader, DrawerBody, DrawerCloseButton, VStack } from "@chakra-ui/react"
import { Spinner, Center, Alert, AlertIcon, AlertTitle, AlertDescription, useToast, AlertDialog, AlertDialogBody, AlertDialogFooter, AlertDialogHeader, AlertDialogContent, AlertDialogOverlay } from "@chakra-ui/react"
import { useEffect, useState, useRef, useCallback } from "react"
import { FiFileText, FiFilter } from "react-icons/fi"
import { FiChevronRight, FiChevronLeft, FiPlus } from "react-icons/fi"
import TransactionFormModal from "../components/transactions/TransactionFormModal"
import { getTransactions, createTransaction, updateTransaction, deleteTransaction, getTransactionMonths } from "../api/transactionService"
import { getCategories } from "../api/categoryService"
import { useNavigate } from "react-router-dom"
import { getErrorMessage, SUCCESS_MESSAGES } from "../utils/messages"
import { trackEvent } from "../utils/analytics"


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

const formatShortDate = (dateString) => {
  if (!dateString) return ""
  const [, month, day] = String(dateString).split("-")
  return `${month}-${day}`
}

export default function Transactions() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const cancelRef = useRef()
  const navigate = useNavigate()
  const isDemo = localStorage.getItem("isDemo") === "true"


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
  const [searchInput, setSearchInput] = useState("")
  const [isFilterOpen, setIsFilterOpen] = useState(false)

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
      const months = await getTransactionMonths()
      setAllMonths(months)
    } catch {
      // ignore
    }
  }, [])

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
        setErrorMsg(getErrorMessage(err, "Unable to load transactions."))
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

  useEffect(() => {
    const timer = setTimeout(() => {
      setQ(searchInput)
      setPage(1)
    }, 300)

    return () => clearTimeout(timer)
  }, [searchInput])

  const handleSave = async () => {
    if (isDemo) {
      toast({
        title: "Demo account",
        description: "Changes are disabled in the demo account.",
        status: "info",
        duration: 2000,
        isClosable: true,
      })
      return
    }
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
          title: "Success",
          description: SUCCESS_MESSAGES.transactionUpdated,
          status: "success",
          duration: 2000,
          isClosable: true,
        })
      } else {
        await createTransaction(payload)
        toast({
          title: "Success",
          description: SUCCESS_MESSAGES.transactionCreated,
          status: "success",
          duration: 2000,
          isClosable: true,
        })
      }

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
      setErrorMsg(getErrorMessage(err, "Unable to save transaction."))
    } finally {
      setSaving(false)
    }
  }

  const hasActiveFilters =
    Boolean(month) ||
    Boolean(category) ||
    Boolean(type) ||
    Boolean(q.trim())

  const activeFilterCount =
    (month ? 1 : 0) +
    (category ? 1 : 0) +
    (type ? 1 : 0) +
    (q.trim() ? 1 : 0) +
    (sort !== "date_desc" ? 1 : 0)

  const openDelete = () => setIsDeleteOpen(true)
  const closeDelete = () => setIsDeleteOpen(false)

  const handleExport = async () => {
    try {
      const token = localStorage.getItem("access")

      const exportMonth =
        month || new Date().toISOString().slice(0, 7)

      const url = new URL(
        `${import.meta.env.VITE_API_BASE_URL}/transactions/export/`
      )
      url.searchParams.set("month", exportMonth)

      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error(`Export failed: ${response.status}`)
      }

      const contentType = response.headers.get("content-type") || ""
      if (!contentType.includes("text/csv")) {
        const text = await response.text()
        console.error("Unexpected response:", text)
        throw new Error("Response was not CSV")
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = downloadUrl
      a.download = `transactions-${exportMonth}.csv`
      document.body.appendChild(a)
      a.click()
      a.remove()
      window.URL.revokeObjectURL(downloadUrl)
    } catch (err) {
      console.error(err)
    }
  }

  return (

    <Box w="full" px={{ base: 2, md: 16 }}>
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
          display={{ base: "none", md: "block"}}
        >
          Transactions
        </Text>

        <Box mb={{ base: 10, md: 16 }} mt={{ base: 4 }}>
          {/* Mobile controls */}
          <Box display={{ base: "block", md: "none" }}>
            <Flex gap={3} mb={4}>
              <Input
                placeholder="Search"
                flex="1"
                size="sm"
                variant="outline"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
              />

              <Button
                size="sm"
                minW="120px"
                onClick={() => setIsFilterOpen(true)}
                leftIcon={<FiFilter />}
                variant={hasActiveFilters ? "solid" : "brandOutline"}
                bg={hasActiveFilters ? "brand.700" : undefined}
                color={hasActiveFilters ? "white" : undefined}
                _hover={
                  hasActiveFilters
                    ? { bg: "brand.800" }
                    : undefined
                }
              >
                Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
              </Button>
            </Flex>

            <Button
              w="full"
              variant="solid"
              size="sm"
              leftIcon={<FiPlus />}
              onClick={() => {
                trackEvent("click_add_transaction", {
                  page: "transactions",
                })

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
              }}
            >
              Add Transaction
            </Button>
          </Box>

          {/* Desktop controls */}
          <Flex
            display={{ base: "none", md: "flex" }}
            align="flex-start"
            direction="row"
            justify="space-between"
            mb={4}
            gap={2}
          >
            <Wrap spacing={4} align="center" w="auto">
              <WrapItem>
                <Select
                  placeholder="All Months"
                  w="240px"
                  size="sm"
                  variant="pillDark"
                  value={month}
                  onChange={(e) => {
                    setMonth(e.target.value)
                    setPage(1)
                  }}
                >
                  {allMonths.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </Select>
              </WrapItem>

              <WrapItem>
                <Select
                  placeholder="All Categories"
                  w="240px"
                  size="sm"
                  variant="pillDark"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value)
                    setPage(1)
                  }}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={String(c.id)}>{c.name}</option>
                  ))}
                </Select>
              </WrapItem>

              <WrapItem>
                <Select
                  placeholder="All Types"
                  w="240px"
                  size="sm"
                  variant="pillDark"
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value)
                    setPage(1)
                  }}
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </Select>
              </WrapItem>

              <WrapItem>
                <Select
                  w="240px"
                  size="sm"
                  variant="pillDark"
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value)
                    setPage(1)
                  }}
                >
                  <option value="date_desc">Date: New → Old</option>
                  <option value="date_asc">Date: Old → New</option>
                  <option value="amount_desc">Amount: High → Low</option>
                  <option value="amount_asc">Amount: Low → High</option>
                </Select>
              </WrapItem>

              <WrapItem>
                <Input
                  placeholder="Search"
                  w="240px"
                  size="sm"
                  variant="pillDark"
                  _placeholder={{ textAlign: "left", color: "white" }}
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </WrapItem>

              <WrapItem>
                <Button
                  variant="brandOutline"
                  size="sm"
                  w="96px"
                  onClick={() => {
                    setMonth("")
                    setCategory("")
                    setType("")
                    setSearchInput("")
                    setQ("")
                    setSort("date_desc")
                  }}
                >
                  Reset
                </Button>
              </WrapItem>
            </Wrap>

            <Flex w="220px" direction="column">
              <Button
                w="220px"
                variant="brandOutline"
                size="sm"
                onClick={() => {
                  trackEvent("click_add_transaction", {
                    page: "transactions",
                  })

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
                }}
                leftIcon={<FiPlus />}
              >
                Add Transaction
              </Button>

              <Button
                w="full"
                mt={4}
                variant="brandOutline"
                size="sm"
                onClick={() => {
                  trackEvent("click_export_pro", {
                    page: "transactions",
                  })

                  toast({
                    title: "Coming soon",
                    description: "Export will be available in Pro. Stay tuned.",
                    status: "info",
                    duration: 2000,
                    isClosable: true,
                  })
                }}
              >
                Export
                <Badge
                  ml={5}
                  fontSize="0.6em"
                  bg="transparent"
                  borderColor="#c9a24d"
                  color="#c9a24d"
                  borderRadius="full"
                >
                  PRO
                </Badge>
              </Button>
            </Flex>
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
              setErrorMsg(getErrorMessage(err, "Unable to load transactions."))
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
        <Box bg="cream.50" borderRadius="12px" p={10} textAlign="center" mb={8}>
          <Box
            w="60px"
            h="60px"
            mb={5}
            mx="auto"
            borderRadius="20px"
            bg="#36403b07"
            display="flex"
            alignItems="center"
            justifyContent="center"
          >
            <FiFileText size={28} />
          </Box>

          {hasActiveFilters ? (
            <>
              <Text fontSize="lg" fontWeight="semibold" mb={2} color="ink.900">
                No transactions found
              </Text>
              <Text color="brand.700">
                Try adjusting your filters or search
              </Text>
            </>
          ) : (
            <>
              <Text fontSize="lg" fontWeight="semibold" mb={2} color="ink.900">
                No transactions yet
              </Text>
              <Text color="brand.700">
                Add your first transaction to get started
              </Text>
            </>
          )}
        </Box>
      ) : (
      <>
        <TableContainer bg="transparent" w="full" display={{ base: "none", md: "block" }}>
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

        <TableContainer bg="transparent" w="full" display={{ base: "block", md: "none" }}>
          <Table variant="simple" w="full" sx={{ tableLayout: "fixed" }}>
            <Thead>
              <Tr>
                <Th w="28%" fontSize="12px">Date</Th>
                <Th w="44%" fontSize="12px">Description</Th>
                <Th w="28%" fontSize="12px" isNumeric>Amount</Th>
              </Tr>
            </Thead>

            <Tbody>
              {transactions.map((t) => (
                <Tr
                  key={t.id}
                  cursor="pointer"
                  _hover={{ bg: "#36403b07" }}
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
                  <Td>{formatShortDate(t.date)}</Td>
                  <Td>
                    <Text noOfLines={1}>{t.description}</Text>
                  </Td>
                  <Td isNumeric fontWeight="500">{t.amount}</Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </>
      )
    ) : null}

    {!loading && !errorMsg && totalCount > 0 ? (
      <HStack justify="space-between" mt={20} mb={10}>
        <Text fontSize="md" color="ink.700" ml={6}>Total: {totalCount}</Text>
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

      <Drawer
        isOpen={isFilterOpen}
        placement="right"
        onClose={() => setIsFilterOpen(false)}
      >
        <DrawerOverlay bg="blackAlpha.300" />
        <DrawerContent bg="cream.50" maxW="85vw">
          <DrawerCloseButton mt={2} mr={2}  _focus={{boxShadow: "0 0 0 2px rgba(255,255,255,0.6)"}}/>
          <DrawerHeader
            pt={20}
            fontSize="2xl"
            fontWeight="700"
            color="brand.900"
          >
            Filters
          </DrawerHeader>

          <DrawerBody pb={12}>
            <VStack spacing={6} align="stretch">
              <Box>
                <Text mb={2} fontWeight="600" color="brand.900">Month</Text>
                <Select
                  placeholder="Select Month"
                  size="sm"
                  variant="outline"
                  value={month}
                  onChange={(e) => {
                    setMonth(e.target.value)
                    setPage(1)
                  }}
                >
                  {allMonths.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </Select>
              </Box>

              <Box>
                <Text mb={2} fontWeight="600" color="brand.900">Category</Text>
                <Select
                  placeholder="Select Category"
                  size="sm"
                  variant="outline"
                  value={category}
                  onChange={(e) => {
                    setCategory(e.target.value)
                    setPage(1)
                  }}
                >
                  {categories.map((c) => (
                    <option key={c.id} value={String(c.id)}>{c.name}</option>
                  ))}
                </Select>
              </Box>

              <Box>
                <Text mb={2} fontWeight="600" color="brand.900">Type</Text>
                <Select
                  placeholder="Select Type"
                  size="sm"
                  variant="outline"
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value)
                    setPage(1)
                  }}
                >
                  <option value="income">Income</option>
                  <option value="expense">Expense</option>
                </Select>
              </Box>

              <Box>
                <Text mb={2} fontWeight="600" color="brand.900">Sort</Text>
                <Select
                  size="sm"
                  variant="outline"
                  value={sort}
                  onChange={(e) => {
                    setSort(e.target.value)
                    setPage(1)
                  }}
                >
                  <option value="date_desc">Date: New → Old</option>
                  <option value="date_asc">Date: Old → New</option>
                  <option value="amount_desc">Amount: High → Low</option>
                  <option value="amount_asc">Amount: Low → High</option>
                </Select>
              </Box>

              <Box>
                <Button
                  variant="ghost"
                  color="brand.900"
                  fontWeight="600"
                  _hover={{ bg: "transparent", borderColor: "transparent" }}
                  _focus={{outline: "none", borderColor: "transparent"}}
                  px="0"
                  onClick={() => {
                    trackEvent("click_export_pro", {
                      page: "transactions",
                    })

                    toast({
                      title: "Coming soon",
                      description: "Export will be available in Pro. Stay tuned.",
                      status: "info",
                      duration: 2000,
                      isClosable: true,
                    })
                  }}
                >
                  Export CSV
                  <Badge
                    ml={3}
                    fontSize="0.7em"
                    bg="transparent"
                    borderColor="#c9a24d"
                    color="#c9a24d"
                    borderRadius="full"
                  >
                    PRO
                  </Badge>
                </Button>


              </Box>

              <HStack spacing={3} pt={4}>
                <Button
                  flex="1"
                  variant="brandOutline"
                  size="sm"
                  onClick={() => {
                    setMonth("")
                    setCategory("")
                    setType("")
                    setSearchInput("")
                    setQ("")
                    setSort("date_desc")
                  }}
                >
                  Reset
                </Button>

                <Button
                  flex="1"
                  variant="solid"
                  size="sm"
                  onClick={() => {
                    setIsFilterOpen(false)
                  }}
                >
                  Save
                </Button>
              </HStack>
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>


      <TransactionFormModal
        isOpen={isOpen}
        onClose={onClose}
        editingId={editingId}
        form={form}
        updateForm={updateForm}
        fieldErrors={fieldErrors}
        categories={categories}
        saving={saving}
        isDemo={isDemo}
        onSave={handleSave}
        onDelete={openDelete}
        onGoToCategories={() => {
          onClose()
          navigate("/categories")
        }}
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
            <Button variant="ghost" ref={cancelRef} onClick={closeDelete}>Cancel</Button>
            <Button
              colorScheme="red"
              ml={3}
              isLoading={deleting}
              isDisabled={deleting}
              onClick={async () => {
                if (isDemo) {
                  toast({
                    title: "Demo account",
                    description: "Changes are disabled in the demo account.",
                    status: "info",
                    duration: 2000,
                    isClosable: true,
                  })
                  closeDelete()
                  onClose()
                  return
                }
                setDeleting(true)
                setErrorMsg("")
                try {
                  await deleteTransaction(editingId)

                   // refresh UI
                  await loadMonths()
                  await reloadTransactions()

                  toast({
                    title: "Success",
                    description: SUCCESS_MESSAGES.transactionDeleted,
                    status: "success",
                    duration: 2000,
                    isClosable: true,
                  })

                  closeDelete()
                  onClose()
                  setEditingId(null)
                } catch (err) {
                  setErrorMsg(getErrorMessage(err, "Unable to delete transaction."))
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
