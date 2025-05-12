import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Button,
  Container,
  Paper,
  Typography,
  useTheme,
  TextField,
  Alert,
  Stack,
  Avatar,
  Divider
} from '@mui/material';
import { Google as GoogleIcon, PersonAdd as PersonAddIcon } from '@mui/icons-material';
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';

function Signup() {
  const theme = useTheme();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');
    try {
      await axios.post(`${API_URL}/api/auth/register`, { name, email, password });
      setSuccess('Registration successful! You can now log in.');
      setTimeout(() => navigate('/login'), 1500);
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignup = () => {
    window.location.href = `${API_URL}/api/auth/google`;
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
            <PersonAddIcon fontSize="large" />
          </Avatar>
          <Typography component="h1" variant="h4" fontWeight={700} gutterBottom>
            Sign Up
          </Typography>
          <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
            Create your account to manage customers, segments, and campaigns
          </Typography>
          {error && <Alert severity="error" sx={{ width: '100%', mb: 1 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ width: '100%', mb: 1 }}>{success}</Alert>}
          <form onSubmit={handleSubmit} style={{ width: '100%' }}>
            <TextField
              margin="normal"
              required
              fullWidth
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
              autoFocus
              sx={{ borderRadius: 2 }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
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
              autoComplete="new-password"
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
              {loading ? 'Signing up...' : 'Sign Up'}
            </Button>
          </form>
          <Divider sx={{ width: '100%', my: 2 }}>or</Divider>
          <Button
            fullWidth
            variant="outlined"
            startIcon={<GoogleIcon />}
            onClick={handleGoogleSignup}
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
            Sign up with Google
          </Button>
          <Button
            fullWidth
            variant="text"
            onClick={() => navigate('/login')}
            sx={{ mt: 1, color: 'text.secondary', fontWeight: 500 }}
          >
            Already have an account? <span style={{ color: theme.palette.primary.main, marginLeft: 4 }}>Log in</span>
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

export default Signup; 