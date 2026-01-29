import { useMemo, useState} from "react"
import { Box, Button, Heading, HStack, IconButton, Table, Tbody, Td, Th, Thead, Tr, Text, useToast} from "@chakra-ui/react"
import { EditIcon, DeleteIcon } from "@chakra-ui/icons"
import ConfirmDialog from "../components/ui/ConfirmDialog"
import CategoryModal from "../components/categories/CategoryModal"

function nowDate() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  const dd = String(d.getDate()).padStart(2, "0")
  return `${yyyy}-${mm}-${dd}`
}
export default function Categories() {
  const toast = useToast()

  const [categories, setCategories] = useState(() => [
    { id: 1, name: "Food", createdAt: "2026-01-21"},
    { id: 2, name: "Rent", createdAt: "2026-01-20"},
    { id: 3, name: "Transport", createdAt: "2026-01-21"},
  ])
  const [deleteId, setDeleteId] = useState(null)

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
      toast({title: "Category already exists.", status: "error"})
      return
    }

    if (editing) {
      setCategories((prev) =>
        prev.map((c) => (c.id === editing.id ? {...c, name:trimmed} : c))
      )
      toast({ title: "Category updated.", status: "success"})
    } else {
      const nextId = Math.max(0, ...categories.map((c) => c.id)) + 1
      setCategories((prev) => [
        ...prev,
        { id: nextId, name: trimmed, createdAt: nowDate()},
      ])
      toast({ title: "Category added.", status: "success"})
    }
    setIsModalOpen(false)
    setEditing(null)
  }

  const confirmDelete = () => {
    if (!categoryToDelete) return
    setCategories((prev) => prev.filter((c) => c.id !== categoryToDelete.id))
    setDeleteId(null)
    toast({title: "Category deleted.", status: "success"})
  }

  return (
    <Box>
      <HStack justify="space-between" mb={6}>
        <Heading size="lg">Categories</Heading>
        <Button colorScheme="teal" onClick={openAdd}>+ Add Category</Button>
      </HStack>

      {categories.length === 0 ? (
        <Box bg="white" p={6} borderRadius="lg" boxShadow="sm">
          <Text color="gray.600">No categories yet. Add your first one.</Text>
        </Box>
      ) : (
        <Box bg="white" borderRadius="lg" boxShadow="sm" overflow="hidden">
          <Table variant="simple">
            <Thead>
              <Tr>
                <Th>Category Name</Th>
                <Th>Created At</Th>
                <Th textAlign="right">Actions</Th>
              </Tr>
            </Thead>
            <Tbody>
              {categories.map((c) => (
                <Tr key={c.id}>
                  <Td>{c.name}</Td>
                  <Td>{c.createdAt}</Td>
                  <Td textAlign="right">
                    <HStack justify="flex-end">
                      <IconButton aria-label="Edit category" icon={<EditIcon/>} size="sm" onClick={() => openEdit(c.id)}/>
                      <IconButton aria-label="Delete category" icon={<DeleteIcon/>} size="sm" onClick={() => setDeleteId(c.id)}/>
                    </HStack>
                  </Td>
                </Tr>
              ))}
            </Tbody>
          </Table>
        </Box>
      )}

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