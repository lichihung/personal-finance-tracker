import { Heading, Text, Box , Stat, StatLabel, StatNumber, SimpleGrid, HStack, Button} from "@chakra-ui/react"
import { useEffect, useState } from "react"
import { apiFetch } from "../api/clientFetch"
import { PieChart, Pie, Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Cell, BarChart, Bar } from "recharts"

function getCurrentMonth() {
  const d = new Date()
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, "0")
  return `${yyyy}-${mm}`
}

export default function Dashboard() {
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState("")
  const [chartType, setChartType] = useState("bar")

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setErrorMsg("")
      try {
        const month = getCurrentMonth()
        const data = await apiFetch(`/transactions/?month=${month}`)
        if (Array.isArray(data)) setTransactions(data)
        else if (data && Array.isArray(data.results)) setTransactions(data.results)
        else setTransactions([])
      } catch (err) {
        setErrorMsg(err.message || "Failed to load dashboard data")
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const totalIncome = transactions
  .filter((t) => t.type === "income")
  .reduce((sum, t) => sum + Number(t.amount), 0)

  const totalExpense = transactions
  .filter((t) => t.type === "expense")
  .reduce((sum, t) => sum + Number(t.amount), 0)

  const money = (n) => new Intl.NumberFormat("en-CA", {style: "currency", currency: "CAD"}).format(n)
  const moneyShort = (n) => new Intl.NumberFormat("en-CA", {style: "currency", currency: "CAD", maximumFractionDigits: 0,}).format(n) 
  const net = totalIncome - totalExpense

  const pieData = (() => {
    const map = new Map()

    for (const t of transactions) {
      if (t.type !== "expense") continue

      const name = typeof t.category === "string" ? t.category : t.category?.name || "Uncategorized"
      const amt = Number(t.amount) || 0
      map.set(name, (map.get(name) || 0) + amt)
    }

    const sorted = Array.from(map.entries())
      .map(([name, value]) => ({name, value}))
      .sort((a, b) => b.value - a.value)

    if (sorted.length <=5) return sorted

    const top5 = sorted.slice(0,5)
    const otherTotal = sorted.slice(5).reduce((sum, item) => sum + item.value, 0)
    return [...top5, { name: "Other", value: otherTotal}]
  })()

  const dailyExpenseData = (() => {
    const month = getCurrentMonth()
    const map = new Map()

    for (const t of transactions) {
      if (t.type !== "expense") continue
      const day = t.date
      const amt = Number(t.amount) || 0
      map.set(day, (map.get(day) || 0) + amt)
    }

    const [yyyy, mm] = month.split("-").map(Number)
    const start = new Date(yyyy, mm - 1, 1)
    const today = new Date()
    const end = new Date(yyyy, mm - 1, today.getDate())

    const out = []
    for (let d = new Date (start); d <= end; d.setDate(d.getDate() + 1)) {
      const y = d.getFullYear()
      const m = String(d.getMonth() + 1).padStart(2, "0")
      const dd = String(d.getDate()).padStart(2, "0")
      const key = `${y}-${m}-${dd}`
      out.push({ date: key, expense: map.get(key) || 0})
    }

    return out
  })()

  const shortDate = (s) => {
    const [, mm, dd] = String(s).split("-")
    return `${mm}/${dd}`
  }

  const PIE_COLORS= ["#8ecae6", "#219ebc", "#023047", "#ffb703", "#fb8500", "#FFF9EC"]
  return (
    <Box>
      <Heading size="lg" mb={6}>Dashboard</Heading>

      {loading && <Text>Loading...</Text>}
      {errorMsg && <Text color="red.500">{errorMsg}</Text>}

      {!loading && !errorMsg && (
        <>
          <SimpleGrid columns={{ base: 1, md: 3}} spacing={6}>
            <Stat bg="white" p={6} borderRadius="lg" boxShadow="sm">
              <StatLabel>This Month Income</StatLabel>
              <StatNumber color="green.500">{money(totalIncome)}</StatNumber>
            </Stat>
            <Stat bg="white" p={6} borderRadius="lg" boxShadow="sm">
              <StatLabel>This Month Expense</StatLabel>
              <StatNumber color="red.500">{money(totalExpense)}</StatNumber>
            </Stat>
            <Stat bg="white" p={6} borderRadius="lg" boxShadow="sm">
              <StatLabel>This Month Net</StatLabel>
              <StatNumber color={net >=0 ? "green.500" : "red.500"}>{money(net)}</StatNumber>
            </Stat>
          </SimpleGrid>

          <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" mt={6} height="380px">
            <Heading size="md" mb={4}>Expense by Category</Heading>

            {pieData.length === 0 ? (
              <Text color="gray.500">No expense data this month.</Text>
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                   data = {pieData}
                   dataKey = "value"
                   nameKey = "name"
                   outerRadius = {110}
                   label = {({percent}) => `${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>
                    ))}
                  </Pie>
                  <Tooltip formatter={(value, name) => [money(value), name]}/>
                  <Legend layout="vertical" align="right" verticalAlign="middle"/>
                </PieChart>
              </ResponsiveContainer>
            )}
          </Box>

          <Box bg="white" p={6} borderRadius="lg" boxShadow="sm" mt={6} height="320px">
            <Box display="flex" justifyContent="space-between" alignItems="center" mb={4}>
              <Heading size="md">Daily Expense Trend</Heading>
              <HStack>
                <Button size="sm" variant={chartType === "bar" ? "solid" : "outline"} onClick={() => setChartType("bar")}>Bar</Button>
                <Button size="sm" variant={chartType === "line" ? "solid" : "outline"} onClick={() => setChartType("line")}>Line</Button>
              </HStack>
            </Box>


            {dailyExpenseData.length === 0 ? (
              <Text color="gray.500">No expense data this month.</Text>
            ) : (
              <ResponsiveContainer width="100%" height={260}>
                {chartType === "bar" ? (
                  <BarChart data={dailyExpenseData}>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis
                      dataKey="date"
                      tickFormatter={shortDate}
                      interval="preserveStartEnd"
                      minTickGap={20}
                    />
                    <YAxis tickFormatter={moneyShort}/>
                    <Tooltip 
                      labelFormatter={(label) => `Date: ${shortDate(label)}`}
                      formatter={(value) => [money(value), "Expense"]}
                      />
                    <Bar dataKey="expense" />
                  </BarChart>
                ) : (
                  <LineChart data={dailyExpenseData}>
                    <CartesianGrid strokeDasharray="3 3"/>
                    <XAxis
                      dataKey="date"
                      tickFormatter={shortDate}
                      interval="preserveStartEnd"
                      minTickGap={20}
                    />
                    <YAxis tickFormatter={moneyShort}/>
                    <Tooltip 
                      labelFormatter={(label) => `Date: ${shortDate(label)}`}
                      formatter={(value) => [money(value), "Expense"]}
                      />
                    <Line type="linear" dataKey="expense" />
                  </LineChart>
                )}
              </ResponsiveContainer>
            )}
          </Box>
        </>
      )}
    </Box>
  )
}
