import type { ReactNode } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { LogOut, Key, BarChart3 } from 'lucide-react'
import LoginIcon from '/logo.png'
interface LayoutProps {
  children: ReactNode
}

export const Layout = ({ children }: LayoutProps) => {
  const { user, profile, signOut } = useAuthStore()
  const navigate = useNavigate()

  const handleSignOut = async () => {
    await signOut()
    localStorage.clear();
    navigate('/login')
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <img src={LoginIcon} alt="Logo" className="h-8 w-8 mr-2" />
              <Link to="/dashboard" id='product-name' className="text-xl font-bold text-gray-900">
                Real Scanner
              </Link>
            </div>
            
            <nav className="hidden md:flex space-x-8">
              <Link
                to="/dashboard"
                className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium"
              >
                Dashboard
              </Link>
              <Link
                to="/keys"
                className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
              >
                <Key className="h-4 w-4" />
                API Keys
              </Link>
              <Link
                to="/analytics"
                className="text-gray-500 hover:text-gray-900 px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1"
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Link>
            </nav>

            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="h-8 w-8 bg-blue-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-medium">
                    {profile?.full_name?.charAt(0) || user?.email?.charAt(0)}
                  </span>
                </div>
                <span className="text-sm text-gray-700">
                  {profile?.full_name || user?.email}
                </span>
              </div>
              
              <button
                onClick={handleSignOut}
                className="text-gray-500 hover:text-gray-900 p-2 rounded-md"
                title="Sign Out"
              >
                <LogOut className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  )
}
