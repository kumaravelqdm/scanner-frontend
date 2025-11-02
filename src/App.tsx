import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import { ProtectedRoute } from './components/ProtectedRoute'
import { Layout } from './components/Layout'
import { SetupCheck } from './components/SetupCheck'
import { Login } from './pages/Login'
import { Signup } from './pages/Signup'
import { Dashboard } from './pages/Dashboard'
import { KeyManagement } from './pages/KeyManagement'
import { Validate } from './pages/Validate'
import { muiTheme } from './theme/muiTheme'
import './App.css'

function App() {
  return (
    <ThemeProvider theme={muiTheme}>
      <CssBaseline />
      <div>
        <SetupCheck />
        <Router>
          <Routes>
          {/* Public routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          
          {/* Protected routes */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          {/* Validate route (public) */}
          <Route path="/validate" element={<Validate />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Layout>
                  <Dashboard />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/keys"
            element={
              <ProtectedRoute>
                <Layout>
                  <KeyManagement />
                </Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/analytics"
            element={
              <ProtectedRoute>
                <Layout>
                  <div className="text-center py-12">
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Analytics</h1>
                    <p className="text-gray-600">Analytics dashboard coming soon...</p>
                  </div>
                </Layout>
              </ProtectedRoute>
            }
          />
          
          {/* Catch all route */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
      </div>
    </ThemeProvider>
  )
}

export default App
