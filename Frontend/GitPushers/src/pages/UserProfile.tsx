import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Typography,
  Container,
  Alert,
  Paper,
  
  Card,
  CardContent,
  Divider,
  CircularProgress,
} from '@mui/material';
import {
  Person,
  Email,
  Edit,
  Save,
  Cancel,
} from '@mui/icons-material';
import { authService, type UserData, type UpdateUserData } from '../services/authService';

const UserProfile: React.FC = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  const [editData, setEditData] = useState<UpdateUserData>({});

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setIsLoading(true);
      const user = await authService.getCurrentUser();
      setUserData(user);
      setEditData({
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        account_type: user.account_type,
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Nie udało się załadować danych użytkownika');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setError('');
    setSuccess('');
  };

  const handleCancel = () => {
    setIsEditing(false);
    if (userData) {
      setEditData({
        email: userData.email,
        first_name: userData.first_name,
        last_name: userData.last_name,
        account_type: userData.account_type,
      });
    }
    setError('');
    setSuccess('');
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError('');
      setSuccess('');

      const updatedUser = await authService.updateUser(editData, 'PATCH');
      setUserData(updatedUser);
      setIsEditing(false);
      setSuccess('Dane zostały pomyślnie zaktualizowane');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Nie udało się zaktualizować danych');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof UpdateUserData) => (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    setEditData(prev => ({
      ...prev,
      [field]: event.target.value,
    }));
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  if (isLoading) {
    return (
      <Container component="main" maxWidth="md">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '50vh',
          }}
        >
          <CircularProgress size={60} />
          <Typography variant="h6" sx={{ mt: 2 }}>
            Ładowanie danych użytkownika...
          </Typography>
        </Box>
      </Container>
    );
  }

  if (!userData) {
    return (
      <Container component="main" maxWidth="md">
        <Box
          sx={{
            marginTop: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
          }}
        >
          <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
            {error || 'Nie udało się załadować danych użytkownika'}
          </Alert>
          <Button variant="contained" onClick={loadUserData}>
            Spróbuj ponownie
          </Button>
        </Box>
      </Container>
    );
  }

  return (
    <Container component="main" maxWidth="md">
      <Box
        sx={{
          marginTop: 4,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            width: '100%',
            borderRadius: 2,
          }}
        >
          {/* Header */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <Typography component="h1" variant="h4" gutterBottom>
              <Person sx={{ mr: 1, verticalAlign: 'middle' }} />
              Profil użytkownika
            </Typography>
            {!isEditing && (
              <Button
                variant="outlined"
                startIcon={<Edit />}
                onClick={handleEdit}
              >
                Edytuj
              </Button>
            )}
          </Box>

          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}

          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          {/* User Information */}
          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 3 }}>
            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Dane osobowe
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <TextField
                  fullWidth
                  label="Imię"
                  value={isEditing ? editData.first_name || '' : userData.first_name}
                  onChange={handleInputChange('first_name')}
                  disabled={!isEditing}
                  margin="normal"
                />
                
                <TextField
                  fullWidth
                  label="Nazwisko"
                  value={isEditing ? editData.last_name || '' : userData.last_name}
                  onChange={handleInputChange('last_name')}
                  disabled={!isEditing}
                  margin="normal"
                />
                
                <TextField
                  fullWidth
                  label="Email"
                  value={isEditing ? editData.email || '' : userData.email}
                  onChange={handleInputChange('email')}
                  disabled={!isEditing}
                  margin="normal"
                  InputProps={{
                    startAdornment: <Email sx={{ mr: 1, color: 'action.active' }} />,
                  }}
                />
                
                <TextField
                  fullWidth
                  label="Typ konta"
                  value={isEditing ? editData.account_type || '' : userData.account_type}
                  disabled
                  margin="normal"
                  helperText="Typ konta nie może być zmieniony"
                />
              </CardContent>
            </Card>

            <Card variant="outlined">
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Informacje o koncie
                </Typography>
                <Divider sx={{ mb: 2 }} />
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    ID użytkownika:
                  </Typography>
                  <Typography variant="body1">
                    {userData.id}
                  </Typography>
                </Box>
                
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2" color="text.secondary">
                    Typ konta:
                  </Typography>
                  <Typography variant="body1" sx={{ 
                    color: userData.account_type === 'doctor' ? 'primary.main' : 'secondary.main',
                    fontWeight: 'bold'
                  }}>
                    {userData.account_type === 'doctor' ? 'Lekarz' : 'Farmaceuta'}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Box>

          {/* Action Buttons */}
          {isEditing && (
            <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'center' }}>
              <Button
                variant="contained"
                startIcon={<Save />}
                onClick={handleSave}
                disabled={isSaving}
              >
                {isSaving ? 'Zapisywanie...' : 'Zapisz zmiany'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<Cancel />}
                onClick={handleCancel}
                disabled={isSaving}
              >
                Anuluj
              </Button>
            </Box>
          )}

          {/* Logout Button */}
          <Box sx={{ display: 'flex', gap: 2, mt: 3, justifyContent: 'center' }}>
            <Button
              variant="outlined"
              color="error"
              onClick={handleLogout}
            >
              Wyloguj się
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/')}
            >
              Powrót do strony głównej
            </Button>
          </Box>
        </Paper>
      </Box>
    </Container>
  );
};

export default UserProfile;
