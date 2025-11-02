import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Paper,
  TextField,
  Button,
  Typography,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  CircularProgress,
  useTheme,
  useMediaQuery,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  // Login as LoginIcon,
} from '@mui/icons-material'
import { useAuthStore } from '../store/authStore'

// Import your images - you'll need to add these to src/assets/images/
// import logoImage from '../assets/images/logo.png'
import loginBg from '../assets/images/login.png'
import LoginIcon from '/favicon.svg'

export const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { signIn } = useAuthStore()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!email.trim()) {
      setError('Email is required')
      return
    }

    if (!password) {
      setError('Password is required')
      return
    }

    setLoading(true)

    try {
      const { error } = await signIn(email, password)
      
      if (error) {
        setError(error.message)
      } else {
        navigate('/dashboard')
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (isMobile) {
    // Mobile layout - stacked
    return (
      <Box
        sx={{
          minHeight: '100vh',
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%)',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Background Image Overlay for Mobile */}
        <Box
          component="img"
          src={loginBg} // Uncomment when you add your login background image
          alt="Login Background"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '40%',
            width: '100%',
            objectFit: 'cover',
          }}
        />
        
        {/* Logo for Mobile */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            justifyContent: 'center',
            pt: 6,
            pb: 2,
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
            }}
          >
            <Typography
              variant="h3"
              sx={{
                color: 'white',
                fontWeight: 900,
                fontFamily: 'monospace',
              }}
            >
              R
            </Typography>
          </Box>
        </Box>

        {/* Form Container for Mobile */}
        <Container maxWidth="sm" sx={{ flex: 1, display: 'flex', alignItems: 'center', position: 'relative', zIndex: 2 }}>
          <Paper
            elevation={24}
            sx={{
              width: '100%',
              p: 4,
              borderRadius: 3,
              backdropFilter: 'blur(20px)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              {/* <LoginIcon sx={{ fontSize: 48, color: 'primary.main', mb: 2 }} /> */}
              <img src={LoginIcon} alt="Login Icon" style={{ width: 48, height: 48, marginBottom: 16, margin: 'auto' }} />
              <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                Welcome Back
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Sign in to your Real Scanner account
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                id="email"
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={loading}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                id="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
                sx={{ mb: 4 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={loading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mb: 3,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Sign In'
                )}
              </Button>

              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  or
                </Typography>
              </Divider>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Link
                    to="/signup"
                    style={{
                      color: theme.palette.primary.main,
                      textDecoration: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Sign up here
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
    )
  }

  // Desktop layout - split screen
  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        background: '#f8fafc',
      }}
    >
      {/* Left Side - Image */}
      <Box
        sx={{
          width: { xs: '100%', md: '50%' },
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: { xs: '200px', md: '100vh' },
        }}
      >
        <Box
          component="img"
          src={loginBg} // Uncomment when you add your login background image
          alt="Login Background"
          sx={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            position: 'absolute',
            top: 0,
            left: 0,
          }}
        />
      </Box>

      {/* Right Side - Login Form */}
      <Box
        sx={{
          width: { xs: '100%', md: '50%' },
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 4,
          background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
        }}
      >
        <Container maxWidth="sm">
          <Paper
            elevation={24}
            sx={{
              p: 5,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <img src={LoginIcon} alt="Login Icon" style={{ width: 48, height: 48, marginBottom: 16, margin: 'auto' }} />
              <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                Welcome Back
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Sign in to your Real Scanner account
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                id="email"
                label="Email Address"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoComplete="email"
                required
                disabled={loading}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Email color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                id="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
                disabled={loading}
                sx={{ mb: 4 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle password visibility"
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={loading}
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  mb: 3,
                  py: 1.5,
                  fontSize: '1rem',
                  fontWeight: 600,
                  background: 'linear-gradient(135deg, #0ea5e9 0%, #3b82f6 100%)',
                  '&:hover': {
                    background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  'Sign In'
                )}
              </Button>

              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  or
                </Typography>
              </Divider>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Don't have an account?{' '}
                  <Link
                    to="/signup"
                    style={{
                      color: theme.palette.primary.main,
                      textDecoration: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Sign up here
                  </Link>
                </Typography>
              </Box>
            </Box>
          </Paper>
        </Container>
      </Box>
    </Box>
  )
}
