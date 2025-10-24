import React from 'react';
import {
  GoogleMap,
  useLoadScript, // 1. Zmieniony import
  OverlayView,
} from '@react-google-maps/api';
import { Box, Typography, Paper, CircularProgress } from '@mui/material'; // 2. Dodany CircularProgress

// --- STYL MAPY ---
const containerStyle = {
  width: '600px',
  height: '600px', // Możesz dostosować wysokość
  borderRadius: '8px',
};

// --- ŚRODEK MAPY (Wrocław, na podstawie zrzutu ekranu) ---
const center = {
  lat: 51.1079,
  lng: 17.0385,
};

// --- OPCJE MAPY (np. wyłączenie domyślnego UI) ---
const mapOptions = {
  disableDefaultUI: true, // Wyłącza domyślne kontrolki
  zoomControl: true, // Ale włącza kontrolę zoomu (jak na screenie)
  clickableIcons: false, // Wyłącza klikanie na POI
  // Możesz dodać własne style, aby ukryć np. nazwy dróg
};

// --- PRZYKŁADOWE DANE ZNACZNIKÓW (zaktualizowane do formatu ze zdjęcia) ---
const sampleMarkers = [
  { id: 1, lat: 51.140, lng: 16.920, price: 52.20 },
  { id: 2, lat: 51.100, lng: 16.960, price: 35.69 },
  { id: 3, lat: 51.120, lng: 17.020, price: 28.90 },
  { id: 4, lat: 51.125, lng: 17.060, price: 45.00 },
  { id: 5, lat: 51.122, lng: 17.085, price: 29.40 },
  { id: 6, lat: 51.118, lng: 17.110, price: 32.80 },
  { id: 7, lat: 51.050, lng: 17.060, price: 41.30 },
];

interface PriceMarkerProps {
  lat: number;
  lng: number;
  price: number;
}

/**
 * Niestandardowy komponent znacznika (metki z ceną)
 * Używamy OverlayView, aby renderować dowolny komponent React na mapie.
 */
const CustomPriceMarker: React.FC<PriceMarkerProps> = ({ price }) => {
  return (
    <Paper
      elevation={3}
      sx={{
        padding: '4px 12px', // Lekko zwiększony padding poziomy
        backgroundColor: 'white',
        borderRadius: '16px', // Duże zaokrąglenie
        border: '2px solid rgba(0, 0, 0, 0.1)',
        // 1. CENTROWANIE ZA POMOCĄ CSS TRANSFORM
        transform: 'translate(-50%, -50%)',
        cursor: 'pointer',
        whiteSpace: 'nowrap', // Zapobiega zawijaniu tekstu
        // --- KLUCZOWA ZMIANA PONIŻEJ ---
        // Wymusza na kontenerze, aby był co najmniej tak szeroki jak jego zawartość.
        minWidth: 'max-content',
        // --- KONIEC ZMIANY ---
        transition: 'all 0.2s ease',
        position: 'relative', // Pozycja jest potrzebna dla zIndex
        zIndex: 1, // Domyślny z-index
        '&:hover': {
          // Łączymy transform i scale
          transform: 'translate(-50%, -50%) scale(1.1)',
          zIndex: 1000, // Wysoki z-index na hover
          backgroundColor: '#f0f0f0',
        },
      }}
    >
      <Typography variant="body2" sx={{ fontWeight: 'bold', color: 'black' }}>
        {price.toFixed(2)} zł
      </Typography>
    </Paper>
  );
};

/**
 * Główny komponent mapy
 */
const PriceMap: React.FC = () => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

  // 3. Używamy haka useLoadScript zamiast komponentu <LoadScript>
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: apiKey || '',
    // Możesz dodać biblioteki, jeśli będą potrzebne, np. ['places']
  });

  // Obsługa błędu, jeśli klucz API jest nieprawidłowy lub nie ma internetu
  if (loadError) {
    return (
      <Box
        sx={{
          height: containerStyle.height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5ff',
          color: 'red',
          borderRadius: '8px',
          padding: 2,
        }}
      >
        <Typography variant="h6" align="center">
          Błąd ładowania mapy. Sprawdź konsolę lub klucz API. <br />
          {loadError.message}
        </Typography>
      </Box>
    );
  }

  // Obsługa braku klucza API w .env
  if (!apiKey) {
    return (
      <Box
        sx={{
          height: containerStyle.height,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5ff',
          color: 'red',
          borderRadius: '8px',
        }}
      >
        <Typography variant="h6">
          Błąd: Nie znaleziono klucza VITE_GOOGLE_MAPS_API_KEY w pliku .env
        </Typography>
      </Box>
    );
  }

  // 4. Dodajemy stan ładowania, gdy skrypt API się wczytuje
  if (!isLoaded) {
    return (
      <Box
        sx={{
          height: containerStyle.height,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#f5f5ff',
          borderRadius: '8px',
        }}
      >
        <CircularProgress sx={{ mb: 2 }} />
        <Typography variant="h6">Ładowanie mapy...</Typography>
      </Box>
    );
  }

  // 5. Renderujemy mapę bezpośrednio, bez komponentu <LoadScript>
  return (
    <GoogleMap
      mapContainerStyle={containerStyle}
      center={center}
      zoom={12}
      options={mapOptions}
    >
      {sampleMarkers.map((marker) => (
        <OverlayView
          key={marker.id}
          position={{ lat: marker.lat, lng: marker.lng }}
          // 2. STAŁY ROZMIAR (NIE SKALUJE SIĘ Z MAPĄ)
          mapPaneName={OverlayView.FLOAT_PANE}
          // 3. USUNIĘTA FUNKCJA 'getPixelPositionOffset', ABY UNIKNĄĆ KONFLIKTU
        >
          <CustomPriceMarker
            lat={marker.lat}
            lng={marker.lng}
            price={marker.price}
          />
        </OverlayView>
      ))}
    </GoogleMap>
  );
};

export default PriceMap;

