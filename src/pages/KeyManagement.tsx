import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUserStore } from '../store/userStore'
import { Plus, Copy, Eye, EyeOff, Trash2, Key, AlertCircle, CheckCircle } from 'lucide-react'

export const KeyManagement = () => {
  const navigate = useNavigate()
  const { 
    apiKeys, 
    loading,
    fetchApiKeys, 
    createApiKey, 
    revokeApiKey 
  } = useUserStore()
  
  const [creating, setCreating] = useState(false)
  const [newKey, setNewKey] = useState<{ access_key: string; secret: string; name: string } | null>(null)
  const [showSecret, setShowSecret] = useState(false)
  const [copied, setCopied] = useState<string | null>(null)
  const [keyName, setKeyName] = useState('')
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [formErrors, setFormErrors] = useState<{ name?: string }>({})
  const [createError, setCreateError] = useState<string | null>(null)

  useEffect(() => {
    fetchApiKeys()
  }, [fetchApiKeys])

  const validateForm = () => {
    const errors: { name?: string } = {}
    
    if (keyName.trim().length < 3) {
      errors.name = 'Key name must be at least 3 characters long'
    }
    
    if (keyName.trim().length > 50) {
      errors.name = 'Key name must be less than 50 characters'
    }
    
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  const handleCreateKey = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreateError(null)
    
    if (!validateForm()) {
      return
    }
    
    const name = keyName.trim() || 'Default API Key'

    setCreating(true)
    try {
      const { data, error } = await createApiKey(name)
      
      if (!error && data) {
        setNewKey(data)
        setKeyName('')
        setShowCreateForm(false)
        setFormErrors({})
      } else {
        setCreateError(error?.message || 'Failed to create API key. Please try again.')
      }
    } catch (err) {
      setCreateError('An unexpected error occurred. Please try again.')
    } finally {
      setCreating(false)
    }
  }

  const handleRevokeKey = async (id: number) => {
    if (!confirm('Are you sure you want to revoke this API key? This action cannot be undone.')) {
      return
    }

    await revokeApiKey(id)
  }

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(type)
      setTimeout(() => setCopied(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">API Key Management</h1>
          <p className="text-gray-600">Manage your API keys for the QR/Barcode scanner</p>
        </div>
        
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/validate-v1')}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center gap-2"
          >
            <CheckCircle className="h-4 w-4" />
            Validate Scan
          </button>
          <button
            onClick={() => setShowCreateForm(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Create API Key
          </button>
        </div>
      </div>

      {/* Create API Key Form */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md transform transition-all">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Key className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">Create New API Key</h3>
                  <p className="text-sm text-gray-500">Generate a new API key for your application</p>
                </div>
              </div>
            </div>

            {/* Modal Body */}
            <form onSubmit={handleCreateKey} className="p-6 space-y-5">
              {/* Error Message */}
              {createError && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-red-700">
                    <p className="font-medium">Error creating API key</p>
                    <p>{createError}</p>
                  </div>
                </div>
              )}

              {/* Key Name Field */}
              <div>
                <label htmlFor="keyName" className="block text-sm font-medium text-gray-700 mb-2">
                  Key Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="keyName"
                  type="text"
                  value={keyName}
                  onChange={(e) => {
                    setKeyName(e.target.value)
                    if (formErrors.name) {
                      setFormErrors({ ...formErrors, name: undefined })
                    }
                  }}
                  className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors ${
                    formErrors.name ? 'border-red-300 bg-red-50' : 'border-gray-300'
                  }`}
                  placeholder="e.g., Production API Key"
                  required
                  maxLength={50}
                  aria-describedby={formErrors.name ? "keyName-error" : undefined}
                />
                {formErrors.name && (
                  <p id="keyName-error" className="mt-1 text-sm text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {formErrors.name}
                  </p>
                )}
                <p className="mt-1 text-xs text-gray-500">
                  {keyName.length}/50 characters
                </p>
              </div>

              {/* Info Box */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <div className="flex gap-2">
                  <AlertCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                  <div className="text-sm text-blue-700">
                    <p className="font-medium mb-1">Security Notice</p>
                    <p>Your secret key will only be shown once. Make sure to copy and store it securely.</p>
                  </div>
                </div>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={creating || !keyName.trim()}
                  className="flex-1 bg-blue-600 text-white px-4 py-2.5 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 font-medium transition-colors"
                >
                  {creating ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Creating...
                    </>
                  ) : (
                    <>
                      <Plus className="h-4 w-4" />
                      Create Key
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowCreateForm(false)
                    setKeyName('')
                    setFormErrors({})
                    setCreateError(null)
                  }}
                  disabled={creating}
                  className="px-4 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Key Modal */}
      {newKey && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-2xl mx-4">
            <div className="flex items-center gap-2 mb-4">
              <AlertCircle className="h-5 w-5 text-yellow-500" />
              <h3 className="text-lg font-semibold">New API Key Created</h3>
            </div>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
              <p className="text-sm text-yellow-800">
                <strong>Important:</strong> Please copy and store your secret key securely. 
                You won't be able to see it again after closing this dialog.
              </p>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Key Name
                </label>
                <input
                  type="text"
                  value={newKey.name}
                  readOnly
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Access Key
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newKey.access_key}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm"
                  />
                  <button
                    onClick={() => copyToClipboard(newKey.access_key, 'access')}
                    className="p-2 text-gray-500 hover:text-gray-700"
                    title="Copy access key"
                  >
                    {copied === 'access' ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Secret Key
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type={showSecret ? 'text' : 'password'}
                    value={newKey.secret}
                    readOnly
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-md bg-gray-50 font-mono text-sm"
                  />
                  <button
                    onClick={() => setShowSecret(!showSecret)}
                    className="p-2 text-gray-500 hover:text-gray-700"
                    title={showSecret ? 'Hide secret' : 'Show secret'}
                  >
                    {showSecret ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                  <button
                    onClick={() => copyToClipboard(newKey.secret, 'secret')}
                    className="p-2 text-gray-500 hover:text-gray-700"
                    title="Copy secret key"
                  >
                    {copied === 'secret' ? (
                      <span className="text-green-600">✓</span>
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setNewKey(null)}
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
              >
                I've saved my keys
              </button>
            </div>
          </div>
        </div>
      )}

      {/* API Keys List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold">Your API Keys</h2>
        </div>
        
        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          </div>
        ) : apiKeys.length > 0 ? (
          <div className="divide-y divide-gray-200">
            {apiKeys.map((key) => (
              <div key={key.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <Key className="h-5 w-5 text-gray-400" />
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{key.name}</span>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            key.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {key.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="font-mono text-sm bg-gray-100 px-2 py-1 rounded">
                            {key.access_key}
                          </code>
                        </div>
                        <div className="mt-1 text-sm text-gray-500">
                          Created: {new Date(key.created_at).toLocaleString()}
                          {key.last_used_at && (
                            <span className="ml-4">
                              Last used: {new Date(key.last_used_at).toLocaleString()}
                            </span>
                          )}
                          <span className="ml-4">
                            Usage: {key.usage_count} calls
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => copyToClipboard(key.access_key, `access-${key.id}`)}
                      className="p-2 text-gray-500 hover:text-gray-700"
                      title="Copy access key"
                    >
                      {copied === `access-${key.id}` ? (
                        <span className="text-green-600">✓</span>
                      ) : (
                        <Copy className="h-4 w-4" />
                      )}
                    </button>
                    
                    {key.status === 'active' && (
                      <button
                        onClick={() => handleRevokeKey(key.id)}
                        className="p-2 text-red-500 hover:text-red-700"
                        title="Revoke key"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-12 text-center">
            <Key className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No API keys yet</h3>
            <p className="text-gray-500 mb-6">Create your first API key to start using the scanning service.</p>
            <button
              onClick={() => setShowCreateForm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2 mx-auto"
            >
              <Plus className="h-4 w-4" />
              Create Your First API Key
            </button>
          </div>
        )}
      </div>

      {/* Usage Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-3">How to use your API keys</h3>
        <div className="text-sm text-blue-800 space-y-2">
          <p>1. Include your access key in the <code className="bg-blue-100 px-1 rounded">X-API-Key</code> header</p>
          <p>2. Include your secret key in the <code className="bg-blue-100 px-1 rounded">X-API-Secret</code> header</p>
          <p>3. Make POST requests to your scanning endpoint with the scanned data</p>
          <p>4. Monitor usage and manage keys from this dashboard</p>
        </div>
      </div>
    </div>
  )
}
