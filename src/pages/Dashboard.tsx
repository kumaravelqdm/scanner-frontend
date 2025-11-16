import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { useUserStore } from '../store/userStore'
import { Key, BarChart3, Activity, Clock, TrendingUp } from 'lucide-react'
import {
  Card,
  CardContent,
  CardHeader,
  Typography,
  Box,
  Chip,
  Container,
  Paper,
} from '@mui/material'

export const Dashboard = () => {
  const { profile } = useAuthStore()
  const { 
    apiKeys,
    usageStats, 
    scanLogs,
    loading,
    fetchApiKeys,
    fetchUsageStats,
    fetchScanLogs
  } = useUserStore()

  useEffect(() => {
    fetchApiKeys()
    fetchUsageStats()
    fetchScanLogs()
  }, [fetchApiKeys, fetchUsageStats, fetchScanLogs])

  const totalScans = usageStats.reduce((sum, stat) => sum + stat.scan_count, 0)
  const todayScans = usageStats.find(stat => 
    stat.date === new Date().toISOString().split('T')[0]
  )?.scan_count || 0
  
  const activeApiKeys = apiKeys.filter(key => key.status === 'active').length

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  const StatCard = ({ icon: Icon, label, value, color, trend }: any) => (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <Box className="flex items-start justify-between">
          <div>
            <Typography variant="body2" color="textSecondary" className="mb-1">
              {label}
            </Typography>
            <Typography variant="h4" className="font-bold">
              {value}
            </Typography>
            {trend && (
              <Box className="flex items-center gap-1 mt-2">
                <TrendingUp className="h-4 w-4 text-green-600" />
                <Typography variant="caption" className="text-green-600 font-medium">
                  {trend}
                </Typography>
              </Box>
            )}
          </div>
          <div className={`p-3 rounded-lg ${color}`}>
            <Icon className="h-6 w-6" />
          </div>
        </Box>
      </CardContent>
    </Card>
  )

  return (
    <Container maxWidth="lg" className="py-8">
      <div className="space-y-8">
        {/* Header */}
        <div>
          <Typography variant="h3" className="font-bold text-gray-900 mb-2">
            Welcome back, {profile?.full_name || 'User'}!
          </Typography>
          <Typography variant="body1" color="textSecondary">
            Manage your QR/Barcode scanning operations
          </Typography>
        </div>

        {/* Stats Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <StatCard
              icon={Activity}
              label="Total Scans"
              value={totalScans.toLocaleString()}
              color="bg-blue-100"
              trend={totalScans > 0 ? '+12% this week' : 'No data'}
            />
          </div>
          <div>
            <StatCard
              icon={BarChart3}
              label="Today's Scans"
              value={todayScans}
              color="bg-green-100"
              trend={todayScans > 0 ? 'Active today' : 'No scans'}
            />
          </div>
          <div>
            <StatCard
              icon={Key}
              label="Active API Keys"
              value={activeApiKeys}
              color="bg-purple-100"
              trend={activeApiKeys > 0 ? 'Ready to use' : 'Create one'}
            />
          </div>
          <div>
            <StatCard
              icon={Clock}
              label="Recent Activity"
              value={scanLogs.length}
              color="bg-orange-100"
              trend={scanLogs.length > 0 ? 'Last 24h' : 'None'}
            />
          </div>
        </div>

        {/* Recent Activity Card */}
        <Card className="shadow-md">
          <CardHeader
            title="Recent Scans"
            subheader="Latest scanning activity"
            titleTypographyProps={{ variant: "h6" }}
          />
          <CardContent>
            {scanLogs.length > 0 ? (
              <Box className="space-y-3">
                {scanLogs.slice(0, 5).map((log) => (
                  <Paper key={log.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <Box className="flex items-center justify-between">
                      <div className="flex-1">
                        <Typography variant="body2" className="font-mono font-medium break-all max-w-sm">
                          {log.scanned_code}
                        </Typography>
                        <Typography variant="caption" color="textSecondary" className="mt-1 block">
                          {log.scan_type} • {new Date(log.created_at).toLocaleString()}
                        </Typography>
                      </div>
                      <Chip
                        label={log.scan_type}
                        size="small"
                        color={
                          log.scan_type === 'QR' ? 'primary' :
                          log.scan_type === 'BARCODE' ? 'success' :
                          'default'
                        }
                        variant="outlined"
                      />
                    </Box>
                  </Paper>
                ))}
              </Box>
            ) : (
              <Box className="text-center py-12">
                <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <Typography variant="h6" className="font-semibold text-gray-900 mb-2">
                  No scans yet
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Start using your API keys to see scan activity here.
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        {/* Usage Overview Chart */}
        {usageStats.length > 0 && (
          <Card className="shadow-md">
            <CardHeader
              title="Usage Overview"
              subheader="Last 7 days of activity"
              titleTypographyProps={{ variant: "h6" }}
            />
            <CardContent>
              <Box className="grid grid-cols-7 gap-4">
                {usageStats.slice(0, 7).reverse().map((stat) => {
                  const maxScans = Math.max(...usageStats.map(s => s.scan_count), 1)
                  const height = Math.max(30, (stat.scan_count / maxScans) * 100)
                  return (
                    <Box key={stat.date} className="flex flex-col items-center">
                      <Paper
                        className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
                        style={{ height: `${height}px`, minHeight: '30px' }}
                        elevation={2}
                      />
                      <Typography variant="caption" className="text-gray-600 mt-2 text-center text-xs">
                        {new Date(stat.date).toLocaleDateString('en-US', { weekday: 'short' })}
                      </Typography>
                      <Typography variant="caption" className="font-bold text-gray-900">
                        {stat.scan_count}
                      </Typography>
                    </Box>
                  )
                })}
              </Box>
            </CardContent>
          </Card>
        )}
      </div>
    </Container>
  )
}
