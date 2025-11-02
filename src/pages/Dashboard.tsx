import { useEffect } from 'react'
import { useAuthStore } from '../store/authStore'
import { useUserStore } from '../store/userStore'
import { Key, BarChart3, Activity, Clock } from 'lucide-react'

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

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Welcome back, {profile?.full_name || 'User'}!
          </h1>
          <p className="text-gray-600">Manage your QR/Barcode scanning operations</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Activity className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Scans</p>
              <p className="text-2xl font-bold text-gray-900">{totalScans}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <BarChart3 className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Today's Scans</p>
              <p className="text-2xl font-bold text-gray-900">{todayScans}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <Key className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Active API Keys</p>
              <p className="text-2xl font-bold text-gray-900">{activeApiKeys}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <Clock className="h-6 w-6 text-orange-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Recent Activity</p>
              <p className="text-lg font-bold text-gray-900">
                {scanLogs.length > 0 ? 'Active' : 'None'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Recent Scans</h2>
        </div>
        <div className="p-6">
          {scanLogs.length > 0 ? (
            <div className="space-y-4">
              {scanLogs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium truncate max-w-md">{log.scanned_code}</p>
                    <p className="text-sm text-gray-500">
                      {log.scan_type} • {new Date(log.created_at).toLocaleString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      log.scan_type === 'QR' ? 'bg-blue-100 text-blue-800' :
                      log.scan_type === 'BARCODE' ? 'bg-green-100 text-green-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {log.scan_type}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">No scans yet</h3>
              <p className="text-gray-500">Start using your API keys to see scan activity here.</p>
            </div>
          )}
        </div>
      </div>

      {/* Usage Chart Placeholder */}
      {usageStats.length > 0 && (
        <div className="bg-white rounded-lg shadow">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold">Usage Overview</h2>
          </div>
          <div className="p-6">
            <div className="grid grid-cols-7 gap-2">
              {usageStats.slice(0, 7).reverse().map((stat) => (
                <div key={stat.date} className="text-center">
                  <div 
                    className="bg-blue-500 rounded mb-2 mx-auto"
                    style={{ 
                      height: `${Math.max(20, (stat.scan_count / Math.max(...usageStats.map(s => s.scan_count))) * 100)}px`,
                      width: '20px' 
                    }}
                  ></div>
                  <p className="text-xs text-gray-500">
                    {new Date(stat.date).toLocaleDateString('en-US', { weekday: 'short' })}
                  </p>
                  <p className="text-xs font-medium">{stat.scan_count}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
