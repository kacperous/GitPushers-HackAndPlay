import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';
import { Button as ShadcnButton } from '@/components/ui/button';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';



const HomePage: React.FC = () => {
  const [count, setCount] = useState(0);
  const navigate = useNavigate();
  const isLoggedIn = authService.isAuthenticated();

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {/* AppBar - Nawigacja */}
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Moja Aplikacja MUI
          </Typography>
          
          <Button color="inherit" onClick={() => navigate('/map')} sx={{ mr: 1 }}>
            Mapa
          </Button>

          {isLoggedIn ? (
            <>
              <Button color="inherit" onClick={() => navigate('/profile')} sx={{ mr: 1 }}>
                Profil
              </Button>
              <Button color="inherit" onClick={handleLogout}>
                Wyloguj się
              </Button>
            </>
          ) : (
            <>
              <Button color="inherit" onClick={() => navigate('/login')} sx={{ mr: 1 }}>
                Logowanie
              </Button>
              <Button color="inherit" onClick={() => navigate('/register')}>
                Rejestracja
              </Button>
            </>
          )}
        </Toolbar>
      </AppBar>

      {/* Główna zawartość */}
      <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 3 }}>
          {/* Karta 1 */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
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
          </Box>

          {/* Karta 2 */}
          <Box sx={{ flex: { xs: '1 1 100%', md: '1 1 calc(50% - 12px)' } }}>
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
          </Box>

          {/* Karta 3 - Demonstracja shadcn/ui */}
          <Box sx={{ flex: '1 1 100%' }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h5" component="div" gutterBottom>
                  shadcn/ui - Nowy System Stylistyczny
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Poniżej przykład komponentu Button z shadcn/ui - nowoczesnej biblioteki komponentów z Tailwind CSS.
                </Typography>
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <ShadcnButton>Default Button</ShadcnButton>
                  <ShadcnButton variant="secondary">Secondary</ShadcnButton>
                  <ShadcnButton variant="destructive">Destructive</ShadcnButton>
                  <ShadcnButton variant="outline">Outline</ShadcnButton>
                  <ShadcnButton variant="ghost">Ghost</ShadcnButton>
                  <ShadcnButton variant="link">Link</ShadcnButton>
                </Box>
              </CardContent>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default HomePage;

