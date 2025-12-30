import { useState, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface GoogleMapPickerProps {
  lat: number;
  lng: number;
  onLocationChange: (lat: number, lng: number) => void;
  height?: string;
}

// Leaflet marker icon ayarlarını düzelt
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Harita tıklama olaylarını yakalayan iç komponent
const MapClickHandler = ({ onLocationChange }: { onLocationChange: (lat: number, lng: number) => void }) => {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

// Sürüklenebilir marker komponenti
const DraggableMarker = ({ 
  initialLat, 
  initialLng, 
  onLocationChange 
}: { 
  initialLat: number; 
  initialLng: number; 
  onLocationChange: (lat: number, lng: number) => void;
}) => {
  const [position, setPosition] = useState({ lat: initialLat, lng: initialLng });

  const marker: any = null;

  const handleDragEnd = useCallback(() => {
    if (marker) {
      const newPos = marker.getLatLng();
      setPosition({ lat: newPos.lat, lng: newPos.lng });
      onLocationChange(newPos.lat, newPos.lng);
    }
  }, [onLocationChange, marker]);

  return position.lat !== 0 && position.lng !== 0 ? (
    <Marker 
      position={[position.lat, position.lng]}
      draggable={true}
      eventHandlers={{
        dragend: handleDragEnd,
      }}
    >
      <Popup>Konum seçildi</Popup>
    </Marker>
  ) : null;
};

const OpenStreetMapPicker = ({ lat, lng, onLocationChange, height = "400px" }: GoogleMapPickerProps) => {
  const [markerPos, setMarkerPos] = useState({ lat: lat || 39.9334, lng: lng || 32.8597 });

  const handleLocationChange = useCallback((newLat: number, newLng: number) => {
    setMarkerPos({ lat: newLat, lng: newLng });
    onLocationChange(newLat, newLng);
  }, [onLocationChange]);

  return (
    <div style={{ width: '100%', height }} className="rounded-md overflow-hidden border border-slate-200">
      <MapContainer
        center={[markerPos.lat, markerPos.lng]}
        zoom={13}
        style={{ width: '100%', height: '100%' }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <MapClickHandler onLocationChange={handleLocationChange} />
        <DraggableMarker 
          initialLat={markerPos.lat} 
          initialLng={markerPos.lng}
          onLocationChange={handleLocationChange}
        />
      </MapContainer>
    </div>
  );
};

export default OpenStreetMapPicker;
