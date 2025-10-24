import { useNavigate } from 'react-router-dom';
import PriceMap from '../components/PriceMap';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';

const MapPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Mapa Cen
          </Typography>
          <Button color="inherit" onClick={() => navigate('/')}>
            Powrót do strony głównej
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4, display: 'flex', justifyContent: 'center' }}>
        <PriceMap />
      </Container>
    </Box>
  );
};

export default MapPage;

