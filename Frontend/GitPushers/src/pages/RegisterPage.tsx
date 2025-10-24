import React, { useState } from 'react';
import { authService, type RegisterData }    from '../services/authService';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  InputAdornment,
  IconButton,
  Divider,
  Link,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  Email,
  Lock,
  Person,
  PersonAdd as RegisterIcon,
} from '@mui/icons-material';

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Partial<RegisterFormData>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');

  const validateForm = (): boolean => {
    const newErrors: Partial<RegisterFormData> = {};

    // First name validation
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'Imię jest wymagane';
    } else if (formData.first_name.trim().length < 2) {
      newErrors.first_name = 'Imię musi mieć co najmniej 2 znaki';
    }

    // Last name validation
    if (!formData.last_name.trim()) {
      newErrors.last_name = 'Nazwisko jest wymagane';
    } else if (formData.last_name.trim().length < 2) {
      newErrors.last_name = 'Nazwisko musi mieć co najmniej 2 znaki';
    }

    // Email validation
    if (!formData.email) {
      newErrors.email = 'Email jest wymagany';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email jest nieprawidłowy';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Hasło jest wymagane';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Hasło musi mieć co najmniej 8 znaków';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(formData.password)) {
      newErrors.password = 'Hasło musi zawierać małą literę, wielką literę i cyfrę';
    }

    // Confirm password validation
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
    setFormData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: undefined,
      }));
    }
    setRegisterError('');
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setRegisterError('');

    try {
      // Make API call to register
      const response = await authService.register(formData);
      
      console.log('Registration successful:', response);
      
      // For demo purposes, simulate successful registration
      if (onRegister) {
        onRegister(formData);
      }
    } catch (error) {
      setRegisterError(error instanceof Error ? error.message : 'Wystąpił błąd podczas rejestracji. Spróbuj ponownie.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleToggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

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
          {/* Header */}
          <Box sx={{ textAlign: 'center', mb: 3 }}>
            <RegisterIcon sx={{ fontSize: 48, color: 'primary.main', mb: 1 }} />
            <Typography component="h1" variant="h4" gutterBottom>
              Zarejestruj się
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Utwórz nowe konto, aby rozpocząć korzystanie z aplikacji
            </Typography>
          </Box>

          {/* Registration Form */}
          <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%', mt: 1 }}>
            {registerError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {registerError}
              </Alert>
            )}

            {/* Name Fields */}
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

            {/* Email Field */}
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

            {/* Password Field */}
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Hasło"
              type={showPassword ? 'text' : 'password'}
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
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleTogglePasswordVisibility}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Confirm Password Field */}
            <TextField
              margin="normal"
              required
              fullWidth
              name="password2"
              label="Potwierdź hasło"
              type={showConfirmPassword ? 'text' : 'password'}
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
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={handleToggleConfirmPasswordVisibility}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            {/* Account Type Field */}
            <FormControl fullWidth margin="normal" required>
              <InputLabel id="account-type-label">Typ konta</InputLabel>
              <Select
                labelId="account-type-label"
                id="account_type"
                name="account_type"
                value={formData.account_type}
                label="Typ konta"
                onChange={(e) => setFormData(prev => ({ ...prev, account_type: e.target.value as 'doctor' | 'pharmacy' }))}
              >
                <MenuItem value="pharmacy">Farmaceuta</MenuItem>
                <MenuItem value="doctor">Lekarz</MenuItem>
              </Select>
            </FormControl>

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

            {/* Additional Options */}
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
