import React from 'react';
import {
  GoogleMap,
  useLoadScript, // 1. Zmieniony import
  OverlayView,
} from '@react-google-maps/api';
import { Box, Typography, Paper, CircularProgress } from '@mui/material'; // 2. Dodany CircularProgress

// --- STYL MAPY ---
const containerStyle = {
  width: '100%',
  height: '250px', // Znacznie zmniejszona wysokość
  borderRadius: '8px',
};

// --- ŚRODEK MAPY (Warszawa) ---
const center = {
  lat: 52.2297,
  lng: 21.0122,
};

// --- OPCJE MAPY (np. wyłączenie domyślnego UI) ---
const mapOptions = {
  disableDefaultUI: true, // Wyłącza domyślne kontrolki
  zoomControl: true, // Ale włącza kontrolę zoomu (jak na screenie)
  clickableIcons: false, // Wyłącza klikanie na POI
  // Możesz dodać własne style, aby ukryć np. nazwy dróg
};

// --- FUNKCJA DO GENEROWANIA LOSOWYCH MARKERÓW ---
const generateRandomMarkers = (
  productPrice: number, 
  centerLat: number, 
  centerLng: number,
  productColor: 'red' | 'green' | 'neutral' = 'neutral'
) => {
  const markers = [];
  const markerCount = Math.floor(Math.random() * 8) + 8; // 8-15 markerów
  
  for (let i = 0; i < markerCount; i++) {
    // Generuj losową cenę na podstawie koloru produktu
    let priceVariation: number;
    switch (productColor) {
      case 'red':
        // Ceny niższe niż bazowa (markery tańsze)
        priceVariation = Math.random() * -0.4 - 0.3; // -30% do -70%
        break;
      case 'green':
        // Ceny wyższe niż bazowa (markery droższe)
        priceVariation = Math.random() * 0.5 + 0.2; // +20% do +70%
        break;
      default: // neutral
        // Ceny w zakresie ±5%
        priceVariation = (Math.random() - 0.5) * 0.1; // -5% do +5%
        break;
    }
    
    const randomPrice = productPrice * (1 + priceVariation);
    
    // Zaokrąglij do pełnej liczby i dodaj 0.99
    const roundedPrice = Math.floor(randomPrice) + 0.99;
    
    // Generuj losową pozycję w promieniu 4km
    const radiusKm = Math.random() * 10; // 0-10km
    const angle = Math.random() * 2 * Math.PI; // 0-2π
    
    // Konwersja km na stopnie (przybliżenie)
    const latOffset = (radiusKm / 111) * Math.cos(angle); // 1 stopień ≈ 111km
    const lngOffset = (radiusKm / (111 * Math.cos(centerLat * Math.PI / 180))) * Math.sin(angle);
    
    const randomLat = centerLat + latOffset;
    const randomLng = centerLng + lngOffset;
    
    markers.push({
      id: i + 1,
      lat: randomLat,
      lng: randomLng,
      price: roundedPrice
    });
  }
  
  return markers;
};

interface PriceMapProps {
  productPrice?: number;
  productColor?: 'red' | 'green' | 'neutral';
}

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
const PriceMap: React.FC<PriceMapProps> = ({ productPrice = 50, productColor = 'neutral' }) => {
  const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
  
  // Generuj losowe markery na podstawie ceny produktu i koloru
  const markers = generateRandomMarkers(productPrice, center.lat, center.lng, productColor);

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
      {markers.map((marker) => (
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

