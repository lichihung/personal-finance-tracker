import { Box, Heading, Table, Thead, Tbody, Tr, Th, Td, TableContainer, Badge, Text, Select, HStack, Button } from "@chakra-ui/react"
import { useMemo, useState } from "react"
import { mockTransactions } from "../mock/transactions"

const typeBadge = (type) => {
  if (type === "income") return <Badge colorScheme="green">Income</Badge>
  return <Badge colorScheme="red">Expense</Badge>
}
export default function Transactions() {
  const [month, setMonth] = useState("")
  const [category, setCategory] = useState("")
  const [type, setType] = useState("")

  const monthOptions = useMemo(() => {
    const set = new Set()
    for (const t of mockTransactions) set.add(t.date.slice(0, 7))
    return Array.from(set).sort().reverse()
  }, [])

  const categoryOptions = useMemo(() => {
    const set = new Set()
    for (const t of mockTransactions) set.add(t.category)
    return Array.from(set).sort()
  }, [])

  const filteredTransactions = useMemo(() => {
    return mockTransactions.filter((t) => {
      const matchMonth = month ? t.date.startsWith(month) : true
      const matchCategory = category ? t.category === category : true
      const matchType = type ? t.type === type : true
      return matchMonth && matchCategory && matchType
    })
  }, [month, category, type])

  return (

    <Box>
      <Heading size="lg" mb={6}>Transactions</Heading>

      <HStack spacing={4} mb={6} align="flex-end">
        <HStack spacing={4}>
          <Select placeholder="All Months" maxW="200px" value={month} onChange={(e) => setMonth(e.target.value)}>
            {monthOptions.map((m) => (
              <option key={m}value={m}>{m}</option>
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
          Clear
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
                <Tr key={t.id}>
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
    </Box>
  )
}
