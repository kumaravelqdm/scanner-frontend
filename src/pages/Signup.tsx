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
  FormControlLabel,
  Checkbox,
  LinearProgress,
} from '@mui/material'
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  PersonAdd,
} from '@mui/icons-material'
import { useAuthStore } from '../store/authStore'

// Import your images - you'll need to add these to src/assets/images/
// import logoImage from '../assets/images/logo.png'
import signupBgImage from '../assets/images/signup.png'

interface PasswordStrength {
  score: number
  feedback: string[]
  color: 'error' | 'warning' | 'info' | 'success'
}

const getPasswordStrength = (password: string): PasswordStrength => {
  let score = 0
  const feedback: string[] = []

  if (password.length >= 8) score += 1
  else feedback.push('At least 8 characters')

  if (/[a-z]/.test(password)) score += 1
  else feedback.push('One lowercase letter')

  if (/[A-Z]/.test(password)) score += 1
  else feedback.push('One uppercase letter')

  if (/\d/.test(password)) score += 1
  else feedback.push('One number')

  if (/[^a-zA-Z0-9]/.test(password)) score += 1
  else feedback.push('One special character')

  const colors: Array<'error' | 'warning' | 'info' | 'success'> = ['error', 'error', 'warning', 'info', 'success']
  
  return {
    score,
    feedback,
    color: colors[score] || 'error'
  }
}

export const Signup = () => {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [acceptTerms, setAcceptTerms] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  
  const { signUp } = useAuthStore()
  const navigate = useNavigate()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const passwordStrength = getPasswordStrength(password)
  const isPasswordMatch = password === confirmPassword && confirmPassword.length > 0

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    if (!fullName.trim()) {
      setError('Full name is required')
      return
    }

    if (!email.trim()) {
      setError('Email is required')
      return
    }

    if (passwordStrength.score < 3) {
      setError('Please use a stronger password')
      return
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (!acceptTerms) {
      setError('Please accept the terms and conditions')
      return
    }

    setLoading(true)

    try {
      const { error } = await signUp(email, password, fullName.trim())
      
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
        {/* Background Image Overlay for Mobile */}
        <Box
          component="img"
          // src={signupBgImage} // Uncomment when you add your signup background image
          alt="Signup Background"
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '40%',
            width: '100%',
            objectFit: 'cover',
          }}
        />        {/* Logo for Mobile */}
        <Box
          sx={{
            position: 'relative',
            zIndex: 2,
            display: 'flex',
            justifyContent: 'center',
            pt: 4,
            pb: 2,
          }}
        >
          <Box
            component="img"
            src="/src/assets/images/logo.png"
            alt="Real Scanner"
            sx={{
              height: 60,
              filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.3))',
            }}
          />
        </Box>

        {/* Form Container for Mobile */}
        <Container maxWidth="sm" sx={{ flex: 1, display: 'flex', alignItems: 'center', position: 'relative', zIndex: 2, pb: 2 }}>
          <Paper
            elevation={24}
            sx={{
              width: '100%',
              p: 3,
              borderRadius: 3,
              backdropFilter: 'blur(20px)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 3 }}>
              <PersonAdd sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h5" component="h1" gutterBottom fontWeight="bold">
                Create Account
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Join Real Scanner today
              </Typography>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            <Box component="form" onSubmit={handleSubmit} noValidate>
              <TextField
                fullWidth
                id="fullName"
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                required
                disabled={loading}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />

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
                sx={{ mb: 2 }}
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
                autoComplete="new-password"
                required
                disabled={loading}
                sx={{ mb: 1 }}
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

              {password && (
                <Box sx={{ mb: 2 }}>
                  <LinearProgress
                    variant="determinate"
                    value={(passwordStrength.score / 5) * 100}
                    color={passwordStrength.color}
                    sx={{ height: 4, borderRadius: 2, mb: 1 }}
                  />
                  {passwordStrength.feedback.length > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      Missing: {passwordStrength.feedback.join(', ')}
                    </Typography>
                  )}
                </Box>
              )}

              <TextField
                fullWidth
                id="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
                disabled={loading}
                error={confirmPassword.length > 0 && !isPasswordMatch}
                helperText={
                  confirmPassword.length > 0 && !isPasswordMatch
                    ? 'Passwords do not match'
                    : ''
                }
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        disabled={loading}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    disabled={loading}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2" color="text.secondary">
                    I agree to the Terms & Privacy Policy
                  </Typography>
                }
                sx={{ mb: 2 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={
                  loading ||
                  !fullName ||
                  !email ||
                  !password ||
                  !confirmPassword ||
                  !isPasswordMatch ||
                  passwordStrength.score < 3 ||
                  !acceptTerms
                }
                sx={{
                  mb: 2,
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
                  'Create Account'
                )}
              </Button>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    style={{
                      color: theme.palette.primary.main,
                      textDecoration: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Sign in here
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
          src={signupBgImage} // Uncomment when you add your signup background image
          alt="Signup Background"
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

      {/* Right Side - Signup Form */}
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
              p: 4,
              borderRadius: 4,
              background: 'rgba(255, 255, 255, 0.95)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
            }}
          >
            <Box sx={{ textAlign: 'center', mb: 4 }}>
              <PersonAdd sx={{ fontSize: 56, color: 'primary.main', mb: 2 }} />
              <Typography variant="h4" component="h1" gutterBottom fontWeight="bold">
                Create Account
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Join us today and start scanning!
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
                id="fullName"
                label="Full Name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                autoComplete="name"
                required
                disabled={loading}
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />

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
                autoComplete="new-password"
                required
                disabled={loading}
                sx={{ mb: 2 }}
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

              {password && (
                <Box sx={{ mb: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ mr: 2 }}>
                      Password strength:
                    </Typography>
                    <LinearProgress
                      variant="determinate"
                      value={(passwordStrength.score / 5) * 100}
                      color={passwordStrength.color}
                      sx={{ flexGrow: 1, height: 6, borderRadius: 3 }}
                    />
                  </Box>
                  {passwordStrength.feedback.length > 0 && (
                    <Typography variant="caption" color="text.secondary">
                      Missing: {passwordStrength.feedback.join(', ')}
                    </Typography>
                  )}
                </Box>
              )}

              <TextField
                fullWidth
                id="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? 'text' : 'password'}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                required
                disabled={loading}
                error={confirmPassword.length > 0 && !isPasswordMatch}
                helperText={
                  confirmPassword.length > 0 && !isPasswordMatch
                    ? 'Passwords do not match'
                    : ''
                }
                sx={{ mb: 3 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Lock color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        edge="end"
                        disabled={loading}
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <FormControlLabel
                control={
                  <Checkbox
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    disabled={loading}
                    color="primary"
                  />
                }
                label={
                  <Typography variant="body2" color="text.secondary">
                    I agree to the{' '}
                    <Link to="/terms" style={{ color: theme.palette.primary.main }}>
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" style={{ color: theme.palette.primary.main }}>
                      Privacy Policy
                    </Link>
                  </Typography>
                }
                sx={{ mb: 3 }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={
                  loading ||
                  !fullName ||
                  !email ||
                  !password ||
                  !confirmPassword ||
                  !isPasswordMatch ||
                  passwordStrength.score < 3 ||
                  !acceptTerms
                }
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
                  'Create Account'
                )}
              </Button>

              <Divider sx={{ my: 3 }}>
                <Typography variant="body2" color="text.secondary">
                  or
                </Typography>
              </Divider>

              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body2" color="text.secondary">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    style={{
                      color: theme.palette.primary.main,
                      textDecoration: 'none',
                      fontWeight: 600,
                    }}
                  >
                    Sign in here
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
