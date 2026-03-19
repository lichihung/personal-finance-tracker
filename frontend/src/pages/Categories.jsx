import { useEffect, useMemo, useState} from "react"
import { Box, Button, Heading, HStack, IconButton, Table, Tbody, Td, Th, Thead, Tr, Text, useToast, Flex, TableContainer} from "@chakra-ui/react"
import { EditIcon, DeleteIcon } from "@chakra-ui/icons"
import { FiChevronRight, FiChevronLeft, FiPlus } from "react-icons/fi"
import ConfirmDialog from "../components/ui/ConfirmDialog"
import CategoryModal from "../components/categories/CategoryModal"
import { apiFetch } from "../api/clientFetch"

const formatShortDate = (dateString) => {
  if (!dateString) return ""
  const [, month, day] = String(dateString).slice(0, 10).split("-")
  return `${month}-${day}`
}

export default function Categories() {
  const toast = useToast()

  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState("")
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setErrorMsg("")
      try {
        const data = await apiFetch("/categories/")
        if (Array.isArray(data)) setCategories(data)
        else if (data && Array.isArray(data.results)) setCategories(data.results)
        else setCategories([])
      } catch (err) {
        setErrorMsg(err.message || "Failed to load categories")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const categoryToDelete = useMemo(
    () => categories.find((c) => c.id === deleteId) || null,
    [categories, deleteId]
  )
  
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editing, setEditing] = useState(null)

  const openAdd = () => {
    setEditing(null)
    setIsModalOpen(true)
  }

  const openEdit = (id) => {
    const current = categories.find((c) => c.id === id)
    if (!current) return
    setEditing({id: current.id, name: current.name})
    setIsModalOpen(true)
  }

  const submitCategoryName = async (name) => {
    const trimmed = name.trim()
    if (!trimmed) return

    const exists = categories.some((c) =>
      editing
      ? c.id !== editing.id && c.name.toLowerCase() === trimmed.toLowerCase()
      : c.name.toLowerCase() === trimmed.toLowerCase()
    )

    if (exists) {
      toast({
        title: "Category already exists.",
        status: "error",
        duration: 2500,
        isClosable: true,
      })
      return
    }

    if (editing) {
      try {
        await apiFetch(`/categories/${editing.id}/`, {
          method: "PATCH",
          body: {name: trimmed}
        })
        
        const fresh = await apiFetch("/categories/")
        if (Array.isArray(fresh)) setCategories(fresh)
        else if (fresh && Array.isArray(fresh.results)) setCategories(fresh.results)
        else setCategories([])

        toast({ title: "Category updated.", status: "success"})
      } catch (err) {
        toast({
          title: err?.data?.name?.[0] || err.message || "Update failed",
          status: "error",
          duration: 2500,
          isClosable: true,
        })
        return
      }
    } else {
      try {
        const created = await apiFetch("/categories/", {
          method: "POST",
          body: {name: trimmed}
        })

        const fresh = await apiFetch("/categories/")
        if (Array.isArray(fresh)) setCategories(fresh)
        else if (fresh && Array.isArray(fresh.results)) setCategories(fresh.results)
        else setCategories([])

        toast({ title: "Category added.", status: "success", duration: 2500, isClosable: true })
      } catch (err) {
        toast({
          title: err?.data?.name?.[0] || err.message || "Create failed",
          status: "error",
          duration: 2500,
          isClosable: true,
        })
        return
      }
    }
    setIsModalOpen(false)
    setEditing(null)
  }

  const getErrMsg = (err) => {
    if (err?.data?.detail) return err.data.detail
    if (err?.data?.name?.[0]) return err.data.name[0]
    return err?.message || "Delete failed"
  }
  const confirmDelete = async () => {
    if (!categoryToDelete) return

    try {
      await apiFetch(`/categories/${categoryToDelete.id}/`, {
        method: "DELETE",
      })

      setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id))
      setDeleteId(null)
      toast({ title: "Category deleted", status: "success", duration: 2500, isClosable: true })
    } catch (err) {
      if (err.status === 409) {
        toast({ title: "Can't delete", description: err.data.detail, status: "error", duration: 3000, isClosable: true })
        return
      }
      toast({ title: "Delete failed", description: getErrMsg(err), status: "error", duration: 2500, isClosable: true })
    }
  }

  return (
    <Box w="full" px={{ base: 2, md: 16 }} >
      <Text
        fontSize={{ base: "42px", md: "80px" }}
        fontWeight="400"
        letterSpacing="2px"
        textTransform="uppercase"
        mb={8}
        mt={8}
        textAlign="center"
        color="brand.900"
        fontFamily="Imbue, serif"
        display={{ base: "none", md: "block"}}
      >
        Categories
      </Text>
        
      <Flex justify={{base: "center", md:"flex-start"}} mb={{ base: 10, md: 12 }}>
        <Button variant="brandOutline" w={{ base: "full", md: "220px" }} size="sm" onClick={openAdd} leftIcon={<FiPlus />}>Add Category</Button>
      </Flex>

      {loading ? <Text>Loading...</Text> : null}
      {errorMsg ? <Text color="red.500">{errorMsg}</Text> : null}
      {!loading && !errorMsg ? (
      categories.length === 0 ? (
        <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
          <Text color="gray.600">No categories yet. Add your first one.</Text>
        </Box>
      ) : (
      <>
      {/* Desktop table */}
        <TableContainer bg="transparent" w="full" display={{ base: "none", md: "block" }} mb={20}>
          <Table variant="simple" w="full">
            <Thead>
              <Tr>
                <Th>Created At</Th>
                <Th>Category</Th>
                <Th>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {categories.map((c) => (
                <Tr key={c.id}>
                  <Td>{c.created_at ? c.created_at.slice(0, 10) : ""}</Td>
                  <Td>
                    <Text noOfLines={1}>{c.name}</Text>
                  </Td>
                  <Td>
                    <HStack spacing={2}>
                      <IconButton
                        aria-label="Edit category"
                        icon={<EditIcon />}
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(c.id)}
                      />
                      <IconButton
                        aria-label="Delete category"
                        icon={<DeleteIcon />}
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteId(c.id)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>

        {/* Mobile table */}
        <TableContainer bg="transparent" w="full" display={{ base: "block", md: "none" }} mb={20}>
          <Table variant="simple" w="full" sx={{ tableLayout: "fixed" }}>
            <Thead>
              <Tr>
                <Th w="28%" fontSize="12px">Date</Th>
                <Th w="42%" fontSize="12px">Category</Th>
                <Th w="30%" fontSize="12px" isNumeric>Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {categories.map((c) => (
                <Tr key={c.id}>
                  <Td>{formatShortDate(c.created_at)}</Td>
                  <Td>
                    <Text noOfLines={1}>{c.name}</Text>
                  </Td>
                  <Td isNumeric>
                    <HStack spacing={1} justify="flex-end">
                      <IconButton
                        aria-label="Edit category"
                        icon={<EditIcon />}
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(c.id)}
                      />
                      <IconButton
                        aria-label="Delete category"
                        icon={<DeleteIcon />}
                        size="sm"
                        variant="ghost"
                        onClick={() => setDeleteId(c.id)}
                      />
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </TableContainer>
      </>
      )): null}

      <CategoryModal
       isOpen={isModalOpen}
       onClose={() => setIsModalOpen(false)}
       onSubmit={submitCategoryName}
       initialValue={editing}
      />

      <ConfirmDialog
        isOpen={deleteId !== null}
        onClose={() => setDeleteId(null)}
        onConfirm={confirmDelete}
        title="Delete Category?"
        message={
          categoryToDelete
          ? `Delete "${categoryToDelete.name}"?`
          : "Delete this category?"
        }
        confirmText = "Delete"
      />
    </Box>
  )
}