import { isSupabaseConfigured } from '../lib/supabase'
import { AlertCircle } from 'lucide-react'

export const SetupCheck = () => {
  const isConfigured = isSupabaseConfigured()

  if (isConfigured) {
    return null // Don't show anything if properly configured
  }

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 mb-6">
      <div className="flex items-start">
        <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
        <div>
          <h3 className="text-sm font-medium text-yellow-800">
            Supabase Configuration Required
          </h3>
          <div className="mt-2 text-sm text-yellow-700">
            <p>To use this application, you need to configure your Supabase credentials:</p>
            <ol className="list-decimal list-inside mt-2 space-y-1">
              <li>Create a <code className="bg-yellow-100 px-1 rounded">.env.local</code> file in your project root</li>
              <li>Add your Supabase project URL and anon key:</li>
            </ol>
            <pre className="mt-2 bg-yellow-100 p-3 rounded text-xs overflow-x-auto">
{`VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here`}
            </pre>
            <p className="mt-2">
              Get these values from your <a href="https://supabase.com/dashboard" target="_blank" rel="noopener noreferrer" className="underline">Supabase Dashboard</a> → Settings → API
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
