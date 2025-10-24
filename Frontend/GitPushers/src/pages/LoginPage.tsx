import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService, type LoginData } from '../services/authService';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  Divider,
  Link,
  Paper,
} from '@mui/material';

import PasswordInput from '../components/PasswordInput';

interface LoginFormData extends LoginData {}

const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });
  
  const [errors, setErrors] = useState<Partial<LoginFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const validateForm = (): boolean => {
    // ... (logika walidacji bez zmian)
    const newErrors: Partial<LoginFormData> = {};
    if (!formData.email) {
      newErrors.email = 'Email jest wymagany';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email jest nieprawidłowy';
    }
    if (!formData.password) {
      newErrors.password = 'Hasło jest wymagane';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Hasło musi mieć co najmniej 6 znaków';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof LoginFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
    setLoginError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!validateForm()) return;
    setIsLoading(true);
    setLoginError('');
    try {
      const response = await authService.login(formData);
      console.log('Login successful:', response);
      navigate('/');
    } catch (error) {
      setLoginError(error instanceof Error ? error.message : 'Wystąpił błąd podczas logowania. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  };

  // USUNIĘTE: Ta funkcja została przeniesiona do PasswordInput
  // const handleTogglePasswordVisibility = () => {
  //   setShowPassword(!showPassword);
  // };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 8,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          minHeight: '100vh',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            width: '100%',
            borderRadius: 2,
          }}
        >
          {/* Header (bez zmian) */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <Typography component="h1" variant="h4" gutterBottom>
              Zaloguj się
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Wprowadź swoje dane, aby uzyskać dostęp do konta
            </Typography>
          </Box>

          {/* Login Form (bez zmian) */}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mt: 1 }}>
            {loginError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {loginError}
              </Alert>
            )}

            {/* Pole Email (bez zmian) */}
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Adres email"
              name="email"
              autoComplete="email"
              autoFocus
              value={formData.email}
              onChange={handleInputChange('email')}
              error={!!errors.email}
              helperText={errors.email}
              placeholder="Wprowadź swój email"
            />

            <PasswordInput
              margin="normal"
              required
              fullWidth
              name="password"
              label="Hasło"
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleInputChange('password')}
              error={!!errors.password}
              helperText={errors.password}
              placeholder="Wprowadź swoje hasło"
            />
            
            {/* Przycisk i reszta formularza (bez zmian) */}
            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={isLoading}
            >
              {isLoading ? 'Logowanie...' : 'Zaloguj się'}
            </Button>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                lub
              </Typography>
            </Divider>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link href="#" variant="body2" sx={{ display: 'block', mb: 1 }}>
                Zapomniałeś hasła?
              </Link>
              <Link 
                href="#" 
                variant="body2" 
                sx={{ display: 'block', mb: 2 }}
                onClick={(e) => {
                  e.preventDefault();
                  navigate('/register');
                }}
              >
                Nie masz konta? Zarejestruj się
              </Link>
              
              <Button
                variant="outlined"
                onClick={() => navigate('/')}
                sx={{ mt: 1 }}
              >
                Powrót do strony głównej
              </Button>
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default LoginPage;
