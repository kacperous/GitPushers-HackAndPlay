import React, { useState } from 'react';
import { authService, type RegisterData } from '../services/authService';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  InputAdornment, 
  Divider,
  Link,
  Paper,
} from '@mui/material';
import {
  Email,
  Lock,
  Person,
  PersonAdd as RegisterIcon,
} from '@mui/icons-material';

import PasswordInput from '../components/PasswordInput';

interface RegisterFormData extends RegisterData {}

interface RegisterPageProps {
  onRegister?: (formData: RegisterFormData) => void;
  onBackToLogin?: () => void;
  onBackToHome?: () => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onRegister, onBackToLogin, onBackToHome }) => {
  const [formData, setFormData] = useState<RegisterFormData>({
    first_name: '',
    last_name: '',
    email: '',
    password: '',
    password2: '',
    account_type: 'pharmacy',
  });
  
  // Usunięte: Te stany są teraz zarządzane wewnątrz PasswordInput
  // const [showPassword, setShowPassword] = useState(false);
  // const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');

  const validateForm = (): boolean => {
    // ... (Logika walidacji bez zmian)
    const newErrors: Partial<RegisterFormData> = {};
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Imię jest wymagane';
    } else if (formData.first_name.trim().length < 2) {
      newErrors.first_name = 'Imię musi mieć co najmniej 2 znaki';
    }
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Nazwisko jest wymagane';
    } else if (formData.last_name.trim().length < 2) {
      newErrors.last_name = 'Nazwisko musi mieć co najmniej 2 znaki';
    }
    if (!formData.email) {
      newErrors.email = 'Email jest wymagany';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email jest nieprawidłowy';
    }
    if (!formData.password) {
      newErrors.password = 'Hasło jest wymagane';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Hasło musi mieć co najmniej 8 znaków';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Hasło musi zawierać małą literę, wielką literę i cyfrę';
    }
    if (!formData.password2) {
      newErrors.password2 = 'Potwierdzenie hasła jest wymagane';
    } else if (formData.password !== formData.password2) {
      newErrors.password2 = 'Hasła nie są identyczne';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof RegisterFormData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    // ... (Logika bez zmian)
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
    setRegisterError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    // ... (Logika bez zmian)
    event.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    setRegisterError('');
    try {
      const response = await authService.register(formData);
      console.log('Registration successful:', response);
      if (onRegister) {
        onRegister(formData);
      }
    } catch (error) {
      setRegisterError(error instanceof Error ? error.message : 'Wystąpił błąd podczas rejestracji. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  };

  // Usunięte: Te funkcje są teraz wewnątrz PasswordInput
  // const handleTogglePasswordVisibility = () => { ... };
  // const handleToggleConfirmPasswordVisibility = () => { ... };

  return (
    <Container component="main" maxWidth="sm">
      <Box
        sx={{
          marginTop: 4,
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
            <RegisterIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography component="h1" variant="h4" gutterBottom>
              Zarejestruj się
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Utwórz nowe konto, aby rozpocząć korzystanie z aplikacji
            </Typography>
          </Box>

          {/* Registration Form (bez zmian) */}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mt: 1 }}>
            {registerError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {registerError}
              </Alert>
            )}

            {/* Name Fields (bez zmian) */}
            <Box sx={{ display: 'flex', gap: 2, mb: 1 }}>
              <TextField
                margin="normal"
                required
                fullWidth
                id="first_name"
                label="Imię"
                name="first_name"
                autoComplete="given-name"
                autoFocus
                value={formData.first_name}
                onChange={handleInputChange('first_name')}
                error={!!errors.first_name}
                helperText={errors.first_name}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <Person color="action" />
                    </InputAdornment>
                  ),
                }}
              />
              <TextField
                margin="normal"
                required
                fullWidth
                id="last_name"
                label="Nazwisko"
                name="last_name"
                autoComplete="family-name"
                value={formData.last_name}
                onChange={handleInputChange('last_name')}
                error={!!errors.last_name}
                helperText={errors.last_name}
              />
            </Box>

            {/* Email Field (bez zmian) */}
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Adres email"
              name="email"
              autoComplete="email"
              value={formData.email}
              onChange={handleInputChange('email')}
              error={!!errors.email}
              helperText={errors.email}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Email color="action" />
                  </InputAdornment>
                ),
              }}
            />

            {/* ZASTĄPIONE: Password Field */}
            <PasswordInput
              margin="normal"
              required
              fullWidth
              name="password"
              label="Hasło"
              id="password"
              autoComplete="new-password"
              value={formData.password}
              onChange={handleInputChange('password')}
              error={!!errors.password}
              helperText={errors.password}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
                // endAdornment (ikonka "oka") jest dodawane automatycznie przez PasswordInput
              }}
            />

            <PasswordInput
              margin="normal"
              required
              fullWidth
              name="password2"
              label="Potwierdź hasło"
              id="password2"
              autoComplete="new-password"
              value={formData.password2}
              onChange={handleInputChange('password2')}
              error={!!errors.password2}
              helperText={errors.password2}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Lock color="action" />
                  </InputAdornment>
                ),
              }}
            />

            {/* <TextField
              margin="normal"
              fullWidth
              id="account_type"
              label="Typ konta"
              name="account_type"
              value="Farmaceuta"
              disabled
              helperText="Typ konta jest automatycznie ustawiony"
            /> */}

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2, py: 1.5 }}
              disabled={isLoading}
            >
              {isLoading ? 'Rejestracja...' : 'Zarejestruj się'}
            </Button>

            <Divider sx={{ my: 2 }}>
              <Typography variant="body2" color="text.secondary">
                lub
              </Typography>
            </Divider>

            <Box sx={{ textAlign: 'center', mt: 2 }}>
              <Link 
                href="#" 
                variant="body2" 
                sx={{ display: 'block', mb: 1 }}
                onClick={(e) => {
                  e.preventDefault();
                  if (onBackToLogin) onBackToLogin();
                }}
              >
                Masz już konto? Zaloguj się
              </Link>
              
              {onBackToHome && (
                <Button
                  variant="outlined"
                  onClick={onBackToHome}
                  sx={{ mt: 1 }}
                >
                  Powrót do strony głównej
                </Button>
              )}
            </Box>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default RegisterPage;
