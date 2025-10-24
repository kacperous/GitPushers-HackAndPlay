import React, { useState } from 'react';
import {
  TextField,
  InputAdornment,
  IconButton,
  type TextFieldProps,
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';

// Akceptujemy wszystkie standardowe właściwości (props) TextField
// dzięki czemu możemy przekazać 'label', 'value', 'onChange', 'error' itd.
type PasswordInputProps = TextFieldProps;

/**
 * Komponent reużywalnego pola hasła z ikonką
 * pokazywania/ukrywania tekstu.
 */
const PasswordInput: React.FC<PasswordInputProps> = (props) => {
  // Ten komponent sam zarządza stanem widoczności hasła
  const [showPassword, setShowPassword] = useState(false);

  const handleTogglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleMouseDownPassword = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.preventDefault(); // Zapobiega utracie fokusu z pola tekstowego
  };

  return (
    <TextField
      // Przekazujemy wszystkie otrzymane propsy (label, value, onChange, error...)
      {...props}
      type={showPassword ? 'text' : 'password'}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              aria-label="toggle password visibility"
              onClick={handleTogglePasswordVisibility}
              onMouseDown={handleMouseDownPassword}
              edge="end"
            >
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
        // Musimy dołączyć wszelkie inne InputProps, które mogły zostać przekazane
        ...(props.InputProps || {}), 
      }}
    />
  );
};

// TA LINIA NAPRAWIA TWÓJ BŁĄD:
export default PasswordInput;

