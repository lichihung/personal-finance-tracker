import { Heading, Text, Box , Stat, StatLabel, StatNumber, SimpleGrid, HStack, Button, Select, useBreakpointValue, Center, Spinner, Alert, AlertIcon, AlertTitle, AlertDescription} from "@chakra-ui/react"
import { Link as RouterLink } from "react-router-dom"
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
  const [selectedMonth, setSelectedMonth] = useState("")
  const [allMonths, setAllMonths] = useState([])

  const activeMonth = selectedMonth || getCurrentMonth()
  const pieCx = useBreakpointValue({ base: "50%", md: "38%" })
  const pieCy = useBreakpointValue({ base: "50%", md: "46%" })
  const yAxisWidth = useBreakpointValue({ base: 40, md: 50 })
  const pieOuterRadius = useBreakpointValue({ base: 110, md: 120 })
  const pieLineOffset = useBreakpointValue({ base: 3, md: 5 })
  const pieLabelOffset = useBreakpointValue({ base: 10, md: 20 })
  const pieLabelFontSize = useBreakpointValue({ base: 14, md: 14 })

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setErrorMsg("")
      try {
        const data = await apiFetch(`/transactions/?month=${activeMonth}`)
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
  }, [selectedMonth])

  useEffect(() => {
    const loadMonths = async () => {
      try {
        const data = await apiFetch("/transactions/months/")
        if (data && Array.isArray(data.results)) {
          setAllMonths(data.results)
        } else {
          setAllMonths([])
        }
      } catch (err) {
        setAllMonths([])
      }
    }
    loadMonths()
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
  const hasAnyTransactions = transactions.length > 0

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
    const month = activeMonth
    const map = new Map()

    for (const t of transactions) {
      if (t.type !== "expense") continue
      const day = t.date
      const amt = Number(t.amount) || 0
      map.set(day, (map.get(day) || 0) + amt)
    }

    const [yyyy, mm] = month.split("-").map(Number)
    const start = new Date(yyyy, mm - 1, 1)
    const currentMonth = getCurrentMonth()
    let end

    if (month === currentMonth) {
      const today = new Date()
      end = new Date(yyyy, mm - 1, today.getDate())
    } else {
      end = new Date(yyyy, mm, 0)
    }

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

  const hasDailyExpenseData = dailyExpenseData.some((item) => item.expense > 0)

  const shortDate = (s) => {
    const [, mm, dd] = String(s).split("-")
    return `${mm}/${dd}`
  }

  const PIE_COLORS= [
    "#003d20",
    "#2f6b54",
    "#5f8f77",
    "#89a899",
    "#bdd2c8",
    "#e6f1ed",
  ]

  const CustomLegend = ({ payload }) => {
    const sorted = [...payload].sort(
      (a, b) => PIE_COLORS.indexOf(a.color) - PIE_COLORS.indexOf(b.color)
    )

    return (
      <Box
        display="flex"
        justifyContent={{ base: "center", md: "flex-start" }}
        flexWrap="wrap"
        gap="18px 15px"
        mt={{base: "24px", md: "14px"}}
      >
        {sorted.map((entry, idx) => (
          <div key={idx} style={{ display: "flex", alignItems: "center" }}>
            <span
              style={{
                width: 14,
                height: 14,
                borderRadius: 4,
                background: entry.color,
                display: "inline-block",
                marginRight: 8,
              }}
            />
            <span style={{ color: "var(--chakra-colors-brand-900)", fontSize: 12 }}>{entry.value}</span>
          </div>
        ))}
      </Box>
    )
  }

  const renderPieLabel = (props) => {
    const { cx, cy, midAngle, outerRadius, percent, fill } = props

    if (percent < 0.01) return null

    const RAD = Math.PI / 180
    const cos = Math.cos(-midAngle * RAD)
    const sin = Math.sin(-midAngle * RAD)

    const lineOffset = pieLineOffset
    const labelOffset = pieLabelOffset

    const x1 = cx + (outerRadius + lineOffset) * cos
    const y1 = cy + (outerRadius + lineOffset) * sin
    const x2 = cx + (outerRadius + labelOffset) * cos
    const y2 = cy + (outerRadius + labelOffset) * sin

    const textAnchor = cos >= 0 ? "start" : "end"

    return (
      <g>
        <line x1={x1} y1={y1} x2={x2} y2={y2} stroke={fill} strokeWidth={1.5} />
        <text
          x={x2}
          y={y2}
          dx={cos >= 0 ? 4 : -4}
          textAnchor={textAnchor}
          dominantBaseline="middle"
          fill="var(--chakra-colors-brand-900)"
          style={{ fontSize: pieLabelFontSize }}
        >
          {`${Math.round(percent * 100)}%`}
        </text>
      </g>
    )
  }

  const tooltipStyle = {
    contentStyle: {
      background: "#1b1b1bcc",
      border: "none",
      borderRadius: "4px",
      padding: "4px 14px",
    },
    itemStyle: { color: "white", fontSize: "15px" },
    labelStyle: { color: "white", fontSize: "15px", marginBottom: 1 },
  }

  return (
    <Box w="full" maxW="1200px" mx="auto" px={{ base: 2, md: 16 }}>
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
        display={{ base: "none", md: "block" }}
      >
        Dashboard
      </Text>

      {loading && (
        <Center py={16}>
          <HStack spacing={3}>
            <Spinner />
            <Text color="gray.500">Loading dashboard...</Text>
          </HStack>
        </Center>
      )}
      {errorMsg && (
        <Alert status="error" borderRadius="12px" mb={6}>
          <AlertIcon />
          <Box flex="1">
            <AlertTitle>Failed to load dashboard</AlertTitle>
            <AlertDescription>{errorMsg}</AlertDescription>
          </Box>
          <Button size="sm" onClick={() => {
              setSelectedMonth("")
            }}>
            Retry
          </Button>
        </Alert>
      )}

      {!loading && !errorMsg && (
        <>
        <HStack display={{ base: "flex", md: "none" }} justify="center" mb={{ base: 4, md: 8}} w="full">
            <Box w="180px">
              <Select
                w="full"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                placeholder="Month" 
              >
                {allMonths.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </Select>
            </Box>
          </HStack>

          <SimpleGrid columns={{ base: 1, md: 3 }} spacing={{base: 2, md: 8}} mt={{base: 0, md: 8}} mb={{base: 8, md: 8}}>
            <Box bg="linear-gradient(135deg, #003d20, #5f8f77)" p={{base: 6, md: 8}} borderRadius="8px" color="white">
              <Stat>
                <StatLabel fontSize={{ base: "16px", md: "18px" }} mb={{ base: 1, md: 2}}>This Month Income</StatLabel>
                <StatNumber fontSize={{ base: "20px", md: "24px" }}>{hasAnyTransactions ? money(totalIncome) : "-"}</StatNumber>
              </Stat>
            </Box>

            <Box bg="linear-gradient(135deg, #89a899, #d7e6de)" p={{base: 6, md: 8}} borderRadius="8px" color="white">
              <Stat>
                <StatLabel fontSize={{ base: "16px", md: "18px" }} mb={{ base: 1, md: 2}}>This Month Expense</StatLabel>
                <StatNumber fontSize={{ base: "20px", md: "24px" }}>{hasAnyTransactions ? money(totalExpense) : "-"}</StatNumber>
              </Stat>
            </Box>

            <Box bg="linear-gradient(135deg, #c9a24d, #f8e6c8)" p={{base: 6, md: 8}} borderRadius="8px" color="white" >
              <Stat>
                <StatLabel fontSize={{ base: "16px", md: "18px" }} mb={{ base: 1, md: 2}}>This Month Net</StatLabel>
                <StatNumber fontSize={{ base: "20px", md: "24px" }} color={net >= 0 ? "white" : "ink.900"}>
                  {hasAnyTransactions ? money(net) : "-"}
                </StatNumber>
              </Stat>
            </Box>

          </SimpleGrid>

          <HStack display={{ base: "none", md: "block" }} justify="flex-start" mb={8} w="full">
            <Box w="180px">
              <Select
                w="full"
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                placeholder="Month"
              >
                {allMonths.map((month) => (
                  <option key={month} value={month}>
                    {month}
                  </option>
                ))}
              </Select>
            </Box>
          </HStack>

          <SimpleGrid columns={{ base: 1, lg: 2 }} spacing={{ base: 6, md: 10 }} mb={{ base: 6, md: 8 }} alignItems="start">
            <Box bg="transparent" p={0} w="full" display="flex" flexDirection="column" alignItems={{ base: "center", md: "flex-start" }} textAlign={{ base: "center", md: "left" }}>
              <Heading fontSize={{ base: "24px", md: "26px"}} mb={{ base: 2, md: 6 }} textAlign={{ base: "center", md: "left" }}>Expense by Category</Heading>

              {pieData.length === 0 ? (
                  <Box textAlign={{ base: "center", md: "left" }}>
                    <Text fontSize="md" fontWeight="400" mb={6} color="ink.900">
                      You don't have any expenses this month.
                    </Text>
                    <Button as={RouterLink} to="/categories" fontSize="sm" _hover={{color:"white"}}>Go to Categories</Button>
                  </Box>
              ) : (
                <ResponsiveContainer width="100%" height={360}>
                  <PieChart>
                    <Pie
                    data = {pieData}
                    dataKey = "value"
                    nameKey = "name"
                    outerRadius={pieOuterRadius}
                    cx={pieCx}
                    cy={pieCy}
                    labelLine={false}
                    label = {renderPieLabel}
                    >
                      {pieData.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]}/>
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value, name) => [`${name}  ${money(value)}`]}
                      contentStyle={{
                        background: "#1b1b1bcc",
                        border: "none",
                        borderRadius: "4px",
                        padding: "4px 14px",
                      }}
                      itemStyle={{
                        color: "white",
                        fontSize: "15px",
                      }}
                      labelStyle={{ display: "none" }}
                    />
                    <Legend verticalAlign="bottom" align="center" content={<CustomLegend />} />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </Box>

            <Box bg="transparent" p={0} w="full" display="flex" flexDirection="column" alignItems={{ base: "center", md: "stretch" }}>
              <Heading fontSize={{ base: "24px", md: "26px"}} mb={6}>Daily Expense Trend</Heading>

              {!hasDailyExpenseData ? (
                  <Box textAlign={{ base: "center", md: "left" }}>
                    <Text fontSize="md" fontWeight="400" mb={6} color="ink.900">
                     You don't have any expenses this month.
                    </Text>
                    <Button as={RouterLink} to="/transactions" fontSize="sm" _hover={{color:"white"}}>Add Transaction</Button>
                  </Box>
              ) : (
                <>
                  <Box w="full" h={{ base: "300px", md: "290px" }} mt={4}>
                    <ResponsiveContainer width="100%" height="100%">
                      {chartType === "bar" ? (
                        <BarChart data={dailyExpenseData}>
                          <CartesianGrid strokeDasharray="3 3"/>
                          <XAxis
                            dataKey="date"
                            tickFormatter={shortDate}
                            interval="preserveStartEnd"
                            minTickGap={20}
                            tick={{ fontSize: 14, fill: "var(--chakra-colors-brand-900)"}}
                          />
                          <YAxis width={yAxisWidth} tickFormatter={moneyShort} tick={{ fontSize: 14, fill: "var(--chakra-colors-brand-900)"}}/>
                          <Tooltip
                            cursor={{ fill: "#36403b07" }} 
                            {...tooltipStyle}
                            labelFormatter={(label) => `Date: ${shortDate(label)}`}
                            formatter={(value) => [money(value), "Expense"]}
                          />
                          <Bar dataKey="expense" fill="var(--chakra-colors-brand-800)" radius={[4, 4, 0, 0]}/>
                        </BarChart>
                      ) : (
                        <LineChart data={dailyExpenseData}>
                          <CartesianGrid strokeDasharray="3 3"/>
                          <XAxis
                            dataKey="date"
                            tickFormatter={shortDate}
                            interval="preserveStartEnd"
                            minTickGap={20}
                            tick={{ fontSize: 14, fill: "var(--chakra-colors-brand-900)"}}
                          />
                          <YAxis width={yAxisWidth} tickFormatter={moneyShort} tick={{ fontSize: 14, fill: "var(--chakra-colors-brand-900)"}}/>
                          <Tooltip
                            {...tooltipStyle}
                            labelFormatter={(label) => `Date: ${shortDate(label)}`}
                            formatter={(value) => [money(value), "Expense"]}
                          />
                          <Line type="linear" dataKey="expense" stroke="var(--chakra-colors-accent-500)"/>
                        </LineChart>
                      )}
                    </ResponsiveContainer>
                  </Box>

                  <HStack mt={3} justify={{ base: "center", md: "flex-end" }} w="full">
                    <Button size="sm" variant={chartType === "bar" ? "brandOutline" : "outline"} onClick={() => setChartType("bar")}>Bar</Button>
                    <Button size="sm" variant={chartType === "line" ? "brandOutline" : "outline"} onClick={() => setChartType("line")}>Line</Button>
                  </HStack>
                </>
              )}


            </Box>
          </SimpleGrid>
        </>
      )}
    </Box>
  )
}
