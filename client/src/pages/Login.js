import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  useTheme,
  TextField,
  Alert,
  Avatar,
  Divider
} from '@mui/material';
import { Google as GoogleIcon, Lock as LockIcon } from '@mui/icons-material';
import axios from 'axios';
import { setCredentials } from '../store/slices/authSlice';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Login() {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const { isAuthenticated } = useSelector((state) => state.auth);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Handle Google OAuth callback
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (token) {
      localStorage.setItem('token', token);
      dispatch(setCredentials({ token }));
      navigate('/dashboard', { replace: true });
    }
  }, [dispatch, navigate]);

  useEffect(() => {
    // If user is already authenticated, redirect to dashboard or attempted page
    if (isAuthenticated) {
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location]);

  const handleGoogleLogin = () => {
    // Redirect to backend Google OAuth endpoint
    window.location.href = `${API_URL}/api/auth/google`;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
      const { token } = res.data;
      localStorage.setItem('token', token);
      dispatch(setCredentials({ token }));
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #e3f0ff 0%, #f9f9f9 100%)',
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={6}
          sx={{
            p: 4,
            borderRadius: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.15)',
            backdropFilter: 'blur(4px)',
          }}
        >
          <Avatar sx={{ bgcolor: 'primary.main', width: 56, height: 56, mb: 2 }}>
            <LockIcon fontSize="large" />
          </Avatar>
          <Typography component="h1" variant="h4" fontWeight={700} gutterBottom>
            Sign In
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Welcome back! Sign in to manage your customers, segments, and campaigns
          </Typography>
          {error && <Alert severity="error" sx={{ width: '100%', mb: 1 }}>{error}</Alert>}
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              autoFocus
              sx={{ borderRadius: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              sx={{ borderRadius: 2 }}
            />
            <Button
              type="submit"
              fullWidth
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ mt: 2, mb: 1, py: 1.5, fontWeight: 600, fontSize: '1.1rem', borderRadius: 2 }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
          <Divider sx={{ width: '100%', my: 2 }}>or</Divider>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleLogin}
            sx={{
              mb: 1,
              py: 1.2,
              fontWeight: 600,
              borderRadius: 2,
              background: '#fff',
              color: '#4285F4',
              borderColor: '#4285F4',
              '&:hover': {
                background: '#f1f8ff',
                borderColor: '#4285F4',
              },
            }}
          >
            Sign in with Google
          </Button>
          <Button
            fullWidth
            variant="text"
            onClick={() => navigate('/signup')}
            sx={{ mt: 1, color: 'text.secondary', fontWeight: 500 }}
          >
            Don&apos;t have an account? <span style={{ color: theme.palette.primary.main, marginLeft: 4 }}>Sign up</span>
          </Button>
          <Box sx={{ mt: 4, textAlign: 'center', width: '100%' }}>
            <Typography variant="caption" color="text.secondary">
              Powered by <b>OpenAI</b> & Material UI
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
}

export default Login; 