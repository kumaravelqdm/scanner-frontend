import { useEffect, useState } from 'react'
import { useUserStore } from '../store/userStore'
import {
  Container,
  Box,
  Typography,
  Card,
  CardContent,
  CardHeader,
  Chip,
  TextField,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Pagination,
} from '@mui/material'
import { BarChart3, Filter, Database } from 'lucide-react'
import {
  LineChart,
  Line,
  // PieChart as RechartsChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface ScanLog {
  id: number
  scanned_code: string
  scan_type: 'QR' | 'BARCODE' | 'OTHER'
  scan_result?: any
  metadata?: Record<string, string>
  created_at: string
  device_info?: any
  ip_address?: string
}

export const Analytics = () => {
  const { scanLogs, loading, fetchScanLogs } = useUserStore()
  const [filteredLogs, setFilteredLogs] = useState<ScanLog[]>([])
  const [metadataKeys, setMetadataKeys] = useState<string[]>([])
  const [selectedMetadataKey, setSelectedMetadataKey] = useState<string>('')
  const [selectedMetadataValue, setSelectedMetadataValue] = useState<string>('')
  const [metadataValues, setMetadataValues] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState<string>('')
  const [totalScansCount, setTotalScansCount] = useState<number>(0)
  const [loadingTotal, setLoadingTotal] = useState<boolean>(false)
  const [currentPage, setCurrentPage] = useState<number>(1)
  const itemsPerPage = 10

  useEffect(() => {
    const fetchAllScans = async () => {
      setLoadingTotal(true)
      // Fetch with a very high limit to get all scans
      await fetchScanLogs(10000)
      setLoadingTotal(false)
    }
    fetchAllScans()
  }, [fetchScanLogs])

  // Calculate total scans from all logs
  useEffect(() => {
    setTotalScansCount(scanLogs.length)
  }, [scanLogs])

  // Generate chart data from scan logs
  const generateChartData = () => {
    // Group scans by date for line chart
    const dateMap = new Map<string, number>()
    scanLogs.forEach((log: any) => {
      const date = new Date(log.created_at).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
      })
      dateMap.set(date, (dateMap.get(date) || 0) + 1)
    })
    return Array.from(dateMap, ([date, count]) => ({ date, scans: count })).slice(-14)
  }

  // const generateScanTypeData = () => {
  //   const typeMap = new Map<string, number>()
  //   scanLogs.forEach((log: any) => {
  //     typeMap.set(log.scan_type, (typeMap.get(log.scan_type) || 0) + 1)
  //   })
  //   return Array.from(typeMap, ([type, value]) => ({ name: type, value }))
  // }

  const chartData = generateChartData()
  // const scanTypeData = generateScanTypeData()

  // Extract unique metadata keys from all logs
  useEffect(() => {
    if (scanLogs.length > 0) {
      const keys = new Set<string>()
      scanLogs.forEach((log: any) => {
        if (log.metadata && typeof log.metadata === 'object') {
          Object.keys(log.metadata).forEach((key) => keys.add(key))
        }
      })
      setMetadataKeys(Array.from(keys))
    }
  }, [scanLogs])

  // Extract values for selected metadata key
  useEffect(() => {
    if (selectedMetadataKey && scanLogs.length > 0) {
      const values = new Set<string>()
      scanLogs.forEach((log: any) => {
        if (log.metadata && log.metadata[selectedMetadataKey]) {
          values.add(log.metadata[selectedMetadataKey])
        }
      })
      setMetadataValues(Array.from(values))
      setSelectedMetadataValue('')
    } else {
      setMetadataValues([])
      setSelectedMetadataValue('')
    }
  }, [selectedMetadataKey, scanLogs])

  // Apply filters
  useEffect(() => {
    let filtered = [...scanLogs]

    if (searchQuery.trim()) {
      filtered = filtered.filter((log: any) =>
        log.scanned_code.toLowerCase().includes(searchQuery.toLowerCase())
      )
    }

    if (selectedMetadataKey && selectedMetadataValue) {
      filtered = filtered.filter((log: any) => {
        return (
          log.metadata &&
          log.metadata[selectedMetadataKey] === selectedMetadataValue
        )
      })
    } else if (selectedMetadataKey) {
      filtered = filtered.filter((log: any) => {
        return log.metadata && selectedMetadataKey in log.metadata
      })
    }

    setFilteredLogs(filtered)
  }, [scanLogs, searchQuery, selectedMetadataKey, selectedMetadataValue])

  const logsWithAdditionalData = filteredLogs.filter(
    (log) => log.metadata && Object.keys(log.metadata).length > 0
  ).length

  // Pagination logic
  const paginatedLogs = filteredLogs.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )
  const totalPages = Math.ceil(filteredLogs.length / itemsPerPage)

  const handlePageChange = (_: any, value: number) => {
    setCurrentPage(value)
  }

  if (loading || loadingTotal) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
          <CircularProgress size={50} />
        </Box>
      </Container>
    )
  }

  return (
    <Container maxWidth="lg" sx={{ py: 6 }}>
      <div className="space-y-8">
        {/* Premium Header Section */}
        <Box
          sx={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            borderRadius: 3,
            p: 4,
            color: 'white',
            boxShadow: '0 10px 40px rgba(102, 126, 234, 0.2)',
            position: 'relative',
            overflow: 'hidden',
            '&::before': {
              content: '""',
              position: 'absolute',
              top: -100,
              right: -100,
              width: 300,
              height: 300,
              background: 'rgba(255, 255, 255, 0.05)',
              borderRadius: '50%',
            },
          }}
        >
          <Box className="relative z-10">
            <Box className="flex items-center gap-3 mb-3">
              <Box
                sx={{
                  background: 'rgba(255, 255, 255, 0.2)',
                  borderRadius: 2,
                  p: 1.5,
                  backdropFilter: 'blur(10px)',
                }}
              >
                <BarChart3 className="h-6 w-6" />
              </Box>
              <Typography variant="h4" className="font-bold">
                Analytics Dashboard
              </Typography>
            </Box>
            <Typography variant="body1" sx={{ opacity: 0.9, fontSize: '1rem' }}>
              Track and analyze your scan activity with real-time insights
            </Typography>
          </Box>
        </Box>

        {/* Statistics Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Total Scans Card */}
          <div>
            <Card
              sx={{
                height: '100%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                boxShadow: '0 8px 24px rgba(102, 126, 234, 0.2)',
                borderRadius: 3,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 16px 40px rgba(102, 126, 234, 0.3)',
                },
              }}
            >
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.85, mb: 1.5 }}>
                      Total Scans
                    </Typography>
                    <Typography variant="h2" className="font-bold" sx={{ mb: 1 }}>
                      {loadingTotal ? <CircularProgress size={40} sx={{ color: 'white' }} /> : totalScansCount}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      All-time records
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: 2,
                      p: 1.5,
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <BarChart3 className="h-6 w-6" />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </div>

          {/* Additional Data Card */}
          <div>
            <Card
              sx={{
                height: '100%',
                background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                color: 'white',
                boxShadow: '0 8px 24px rgba(245, 87, 108, 0.2)',
                borderRadius: 3,
                position: 'relative',
                overflow: 'hidden',
                transition: 'all 0.3s ease',
                '&:hover': {
                  transform: 'translateY(-8px)',
                  boxShadow: '0 16px 40px rgba(245, 87, 108, 0.3)',
                },
              }}
            >
              <CardContent sx={{ position: 'relative', zIndex: 1 }}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                  <Box>
                    <Typography variant="body2" sx={{ opacity: 0.85, mb: 1.5 }}>
                      Enhanced Data
                    </Typography>
                    <Typography variant="h2" className="font-bold" sx={{ mb: 1 }}>
                      {logsWithAdditionalData}
                    </Typography>
                    <Typography variant="caption" sx={{ opacity: 0.8 }}>
                      Records with metadata
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      background: 'rgba(255, 255, 255, 0.2)',
                      borderRadius: 2,
                      p: 1.5,
                      backdropFilter: 'blur(10px)',
                    }}
                  >
                    <Database className="h-6 w-6" />
                  </Box>
                </Box>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Additional Data Summary */}
        {metadataKeys.length > 0 && (
          <Card
            sx={{
              borderRadius: 3,
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
              border: '1px solid rgba(0, 0, 0, 0.05)',
              transition: 'all 0.3s ease',
            }}
          >
            <CardHeader
              title={
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <Box
                    sx={{
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: 1.5,
                      p: 0.75,
                      color: 'white',
                    }}
                  >
                    <Database className="h-5 w-5" />
                  </Box>
                  <Typography variant="h6" className="font-bold">
                    Data Fields Detected
                  </Typography>
                </Box>
              }
              sx={{ pb: 2 }}
            />
            <CardContent sx={{ pt: 0 }}>
              <Alert
                severity="info"
                sx={{
                  mb: 3,
                  borderRadius: 2,
                  background: 'rgba(102, 126, 234, 0.05)',
                  border: '1px solid rgba(102, 126, 234, 0.2)',
                  color: '#667eea',
                }}
              >
                <Typography variant="body2">
                  Found <strong>{metadataKeys.length}</strong> unique data field(s) across all <strong>{totalScansCount}</strong> scans
                </Typography>
              </Alert>
              <Box className="flex flex-wrap gap-3">
                {metadataKeys.map((key) => {
                  const count = scanLogs.filter(
                    (log: any) => log.metadata && key in log.metadata
                  ).length
                  return (
                    <Chip
                      key={key}
                      label={`${key} (${count})`}
                      variant="filled"
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        color: 'white',
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        py: 2.5,
                        px: 1,
                        transition: 'all 0.2s ease',
                        '& .MuiChip-label': {
                          px: 1,
                        },
                        '&:hover': {
                          transform: 'scale(1.05)',
                          boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
                        },
                      }}
                    />
                  )
                })}
              </Box>
            </CardContent>
          </Card>
        )}

        {/* Filters */}
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
          }}
        >
          <CardHeader
            title={
              <Box className="flex items-center gap-2">
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                    borderRadius: 1.5,
                    p: 0.75,
                    color: 'white',
                  }}
                >
                  <Filter className="h-5 w-5" />
                </Box>
                <Typography variant="h6" className="font-bold">
                  Advanced Filters
                </Typography>
              </Box>
            }
            sx={{ pb: 2 }}
          />
          <Divider sx={{ opacity: 0.3 }} />
          <CardContent sx={{ pt: 3 }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <TextField
                label="Search Scanned Code"
                variant="outlined"
                size="small"
                fullWidth
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Enter code to search..."
                sx={{
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    transition: 'all 0.2s ease',
                    '&:hover fieldset': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#667eea',
                    },
                  },
                }}
              />
              <FormControl fullWidth size="small">
                <InputLabel
                  sx={{
                    '&.Mui-focused': {
                      color: '#667eea',
                    },
                  }}
                >
                  Data Field
                </InputLabel>
                <Select
                  value={selectedMetadataKey}
                  label="Data Field"
                  onChange={(e) => setSelectedMetadataKey(e.target.value)}
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      transition: 'all 0.2s ease',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#667eea',
                    },
                  }}
                >
                  <MenuItem value="">None</MenuItem>
                  {metadataKeys.map((key) => (
                    <MenuItem key={key} value={key}>
                      {key}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <FormControl fullWidth size="small" disabled={!selectedMetadataKey}>
                <InputLabel
                  sx={{
                    '&.Mui-focused': {
                      color: '#667eea',
                    },
                  }}
                >
                  Field Value
                </InputLabel>
                <Select
                  value={selectedMetadataValue}
                  label="Field Value"
                  onChange={(e) => setSelectedMetadataValue(e.target.value)}
                  sx={{
                    borderRadius: 2,
                    '& .MuiOutlinedInput-notchedOutline': {
                      transition: 'all 0.2s ease',
                    },
                    '&:hover .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#667eea',
                    },
                    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
                      borderColor: '#667eea',
                    },
                  }}
                >
                  <MenuItem value="">All Values</MenuItem>
                  {metadataValues.map((value) => (
                    <MenuItem key={value} value={value}>
                      {value}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </div>
          </CardContent>
        </Card>

        {/* Scan Logs Table */}
        <Card
          sx={{
            borderRadius: 3,
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
            border: '1px solid rgba(0, 0, 0, 0.05)',
            overflow: 'hidden',
          }}
        >
          <CardHeader
            title={
              <Box className="flex items-center gap-2 pb-3">
                <Box
                  sx={{
                    background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                    borderRadius: 1.5,
                    p: 0.75,
                    color: 'white',
                  }}
                >
                  <Database className="h-5 w-5" />
                </Box>
                <Typography variant="h6" className="font-bold">
                  Scan Records
                </Typography>
                <Chip
                  label={filteredLogs.length}
                  size="small"
                  sx={{
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    fontWeight: 600,
                    ml: 1,
                  }}
                />
              </Box>
            }
            sx={{ pb: 0 }}
          />
          <CardContent sx={{ p: 0 }}>
            {filteredLogs.length > 0 ? (
              <TableContainer
                sx={{
                  '& .MuiTable-root': {
                    borderCollapse: 'collapse',
                  },
                }}
              >
                <Table stickyHeader>
                  <TableHead>
                    <TableRow
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      }}
                    >
                      <TableCell sx={{ background:"unset", width: '25%', color: 'white', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.5px', py: 2 }}>Scanned Code</TableCell>
                      <TableCell sx={{ background:"unset", width: '20%', color: 'white', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.5px', py: 2 }}>Date & Time</TableCell>
                      <TableCell sx={{ background:"unset", width: '10%', color: 'white', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.5px', py: 2 }}>Type</TableCell>
                      <TableCell sx={{ background:"unset", width: '45%', color: 'white', fontWeight: 700, fontSize: '0.95rem', letterSpacing: '0.5px', py: 2 }}>Additional Data</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedLogs.map((log, idx) => (
                      <TableRow
                        key={log.id}
                        sx={{
                          backgroundColor: idx % 2 === 0 ? '#ffffff' : 'rgba(102, 126, 234, 0.02)',
                          transition: 'all 0.2s ease',
                          '&:hover': {
                            backgroundColor: 'rgba(102, 126, 234, 0.08)',
                          },
                          borderBottom: '1px solid rgba(0, 0, 0, 0.05)',
                          '& td': {
                            py: 2,
                          },
                        }}
                      >
                        <TableCell>
                          <Typography
                            variant="body2"
                            className="font-mono"
                            sx={{
                              wordBreak: 'break-all',
                              color: '#667eea',
                              fontWeight: 600,
                            }}
                          >
                            {log.scanned_code}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography
                            variant="caption"
                            sx={{
                              color: '#666',
                              display: 'block',
                            }}
                          >
                            {new Date(log.created_at).toLocaleString()}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={log.scan_type}
                            size="small"
                            sx={{
                              background:
                                log.scan_type === 'QR'
                                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                                  : log.scan_type === 'BARCODE'
                                  ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)'
                                  : 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                              color: 'white',
                              fontWeight: 600,
                            }}
                          />
                        </TableCell>
                        <TableCell>
                          {log.metadata && Object.keys(log.metadata).length > 0 ? (
                            <Box className="flex flex-wrap gap-1.5">
                              {Object.entries(log.metadata).map(([key, value]) => (
                                <Chip
                                  key={key}
                                  label={`${key}: ${value}`}
                                  size="small"
                                  sx={{
                                    background: 'rgba(102, 126, 234, 0.1)',
                                    color: '#667eea',
                                    fontSize: '0.75rem',
                                    fontWeight: 500,
                                  }}
                                />
                              ))}
                            </Box>
                          ) : (
                            <Typography
                              variant="caption"
                              sx={{
                                color: '#999',
                                fontStyle: 'italic',
                              }}
                            >
                              No additional data
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Box
                sx={{
                  textAlign: 'center',
                  py: 12,
                  background: 'linear-gradient(135deg, rgba(102, 126, 234, 0.02) 0%, rgba(118, 75, 162, 0.02) 100%)',
                }}
              >
                <Box
                  sx={{
                    mb: 2,
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                    mx: 'auto',
                  }}
                >
                  <Database className="h-8 w-8" />
                </Box>
                <Typography variant="h6" className="font-semibold text-gray-900 mb-2">
                  {scanLogs.length === 0 ? 'No Scans Yet' : 'No Matching Records'}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  {scanLogs.length === 0
                    ? 'Start scanning to see your activity here'
                    : 'Try adjusting your filters or search criteria'}
                </Typography>
              </Box>
            )}
          </CardContent>
          {filteredLogs.length > 0 && (
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'center',
                p: 3,
                borderTop: '1px solid rgba(0, 0, 0, 0.05)',
                background: 'rgba(102, 126, 234, 0.02)',
              }}
            >
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                color="primary"
                sx={{
                  '& .MuiButtonBase-root': {
                    color: '#667eea',
                  },
                  '& .MuiButtonBase-root.Mui-selected': {
                    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                    color: 'white',
                  },
                }}
              />
            </Box>
          )}
        </Card>

        {/* Charts Section */}
        {chartData.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-1 gap-6">
            {/* Line Chart - Scan Trends */}
            <Card
              sx={{
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
              }}
            >
              <CardHeader
                title={
                  <Box className="flex items-center gap-2">
                    <Box
                      sx={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        borderRadius: 1.5,
                        p: 0.75,
                        color: 'white',
                      }}
                    >
                      <BarChart3 className="h-5 w-5" />
                    </Box>
                    <Typography variant="h6" className="font-bold">
                      Scan Trends (Last 14 Days)
                    </Typography>
                  </Box>
                }
              />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                    <XAxis dataKey="date" stroke="#999" />
                    <YAxis stroke="#999" />
                    <Tooltip
                      contentStyle={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: 8,
                        color: 'white',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="scans"
                      stroke="url(#colorScans)"
                      strokeWidth={3}
                      dot={{ fill: '#667eea', r: 5 }}
                      activeDot={{ r: 7 }}
                    />
                    <defs>
                      <linearGradient id="colorScans" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#667eea" stopOpacity={0.8} />
                        <stop offset="95%" stopColor="#764ba2" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Pie Chart - Scan Types */}
            {/* <Card
              sx={{
                borderRadius: 3,
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
                border: '1px solid rgba(0, 0, 0, 0.05)',
              }}
            >
              <CardHeader
                title={
                  <Box className="flex items-center gap-2">
                    <Box
                      sx={{
                        background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                        borderRadius: 1.5,
                        p: 0.75,
                        color: 'white',
                      }}
                    >
                      <Database className="h-5 w-5" />
                    </Box>
                    <Typography variant="h6" className="font-bold">
                      Scan Types Distribution
                    </Typography>
                  </Box>
                }
              />
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <RechartsChart>
                    <Pie
                      data={scanTypeData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value, percent = 0 }) =>
                        `${name}: ${value} (${(percent * 100).toFixed(0)}%)`
                      }
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      <Cell fill="#667eea" />
                      <Cell fill="#764ba2" />
                      <Cell fill="#f093fb" />
                      <Cell fill="#f5576c" />
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                        border: 'none',
                        borderRadius: 8,
                        color: 'white',
                      }}
                    />
                  </RechartsChart>
                </ResponsiveContainer>
              </CardContent>
            </Card> */}
          </div>
        )}
      </div>
    </Container>
  )
}
