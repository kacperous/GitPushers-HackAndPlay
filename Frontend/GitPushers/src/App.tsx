import { useState } from 'react';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import UserProfile from './pages/UserProfile';
import { authService } from './services/authService';

// Importy komponentów Material UI
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Grid from '@mui/material/Grid';

function App() {
  const [count, setCount] = useState(0);
  const [currentPage, setCurrentPage] = useState<'home' | 'login' | 'register' | 'profile'>('home');
  const [isLoggedIn, setIsLoggedIn] = useState(authService.isAuthenticated());

  const handleLogin = (formData: { email: string; password: string }) => {
    console.log('Login successful:', formData);
    setIsLoggedIn(true);
    setCurrentPage('home');
  };

  const handleRegister = (formData: { first_name: string; last_name: string; email: string; password: string; password2: string; account_type: 'doctor' | 'pharmacy' }) => {
    console.log('Registration successful:', formData);
    setIsLoggedIn(true);
    setCurrentPage('home');
  };

  const handleBackToHome = () => {
    setCurrentPage('home');
  };

  const handleGoToLogin = () => {
    setCurrentPage('login');
  };

  const handleLogout = () => {
    authService.logout();
    setIsLoggedIn(false);
    setCurrentPage('home');
  };

  const handleGoToProfile = () => {
    setCurrentPage('profile');
  };

  const handleGoToRegister = () => {
    setCurrentPage('register');
  };

  if (currentPage === 'login') {
    return <LoginPage onLogin={handleLogin} onBackToHome={handleBackToHome} onGoToRegister={handleGoToRegister} />;
  }

  if (currentPage === 'register') {
    return <RegisterPage onRegister={handleRegister} onBackToLogin={handleGoToLogin} onBackToHome={handleBackToHome} />;
  }

  if (currentPage === 'profile') {
    return <UserProfile onBackToHome={handleBackToHome} />;
  }

  return (
    // Box to uniwersalny komponent do układu, często używany jako wrapper
    <Box sx={{ flexGrow: 1 }}>
      {/* 1. AppBar (Nagłówek) */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Moja Aplikacja MUI
          </Typography>
          <Button color="inherit" onClick={isLoggedIn ? handleLogout : () => setCurrentPage('login')} sx={{ mr: 1 }}>
            {isLoggedIn ? 'Wyloguj się' : 'Logowanie'}
          </Button>
          {!isLoggedIn && (
            <Button color="inherit" onClick={() => setCurrentPage('register')} sx={{ mr: 1 }}>
              Rejestracja
            </Button>
          )}
          {isLoggedIn && (
            <Button color="inherit" onClick={handleGoToProfile}>
              Profil
            </Button>
          )}
        </Toolbar>
      </AppBar>

      {/* 2. Główna zawartość w kontenerze */}
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}> {/* mt: margin-top, mb: margin-bottom */}
        <Grid container spacing={3}> {/* Siatka do responsywnego układu */}
          {/* Karta 1 */}
          <Grid item xs={12} md={6}> {/* Na małych ekranach 12 kolumn, na średnich 6 */}
            <Card variant="outlined" sx={{ minHeight: 200 }}>
              <CardContent>
                <Typography variant="h5" component="div" gutterBottom>
                  Pierwsza Karta
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  To jest przykładowa treść pierwszej karty. Możesz tutaj umieścić dowolne informacje.
                </Typography>
                <Button 
                  variant="contained" 
                  sx={{ mt: 2 }} 
                  onClick={() => setCount((prevCount) => prevCount + 1)}
                >
                  Zwiększ Licznik ({count})
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Karta 2 */}
          <Grid item xs={12} md={6}>
            <Card variant="outlined" sx={{ minHeight: 200 }}>
              <CardContent>
                <Typography variant="h5" component="div" gutterBottom>
                  Druga Karta
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Tutaj możesz umieścić kolejne ważne informacje lub funkcjonalności.
                  Material UI ułatwia tworzenie spójnych interfejsów.
                </Typography>
                <Button 
                  variant="outlined" 
                  color="secondary" 
                  sx={{ mt: 2 }} 
                  onClick={() => alert('Druga karta kliknięta!')}
                >
                  Akcja 2
                </Button>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
}

export default App;