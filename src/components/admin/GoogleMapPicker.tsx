import { useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker } from '@react-google-maps/api';

interface GoogleMapPickerProps {
  lat: number;
  lng: number;
  onLocationChange: (lat: number, lng: number) => void;
  height?: string;
}

const GoogleMapPicker = ({ lat, lng, onLocationChange, height = "400px" }: GoogleMapPickerProps) => {
  const [markerPosition, setMarkerPosition] = useState({ lat, lng });

  const mapContainerStyle = {
    width: '100%',
    height: height
  };

  const center = {
    lat: lat || 39.9334,
    lng: lng || 32.8597
  };

  const onMarkerDragEnd = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();
      setMarkerPosition({ lat: newLat, lng: newLng });
      onLocationChange(newLat, newLng);
    }
  }, [onLocationChange]);

  const onMapClick = useCallback((e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      const newLat = e.latLng.lat();
      const newLng = e.latLng.lng();
      setMarkerPosition({ lat: newLat, lng: newLng });
      onLocationChange(newLat, newLng);
    }
  }, [onLocationChange]);

  return (
    <LoadScript googleMapsApiKey="AIzaSyDlqZEVFKrJQAyTSmJmqOHv1XkGGCjLO5w">
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={markerPosition.lat !== 0 ? markerPosition : center}
        zoom={13}
        onClick={onMapClick}
      >
        {(markerPosition.lat !== 0 || markerPosition.lng !== 0) && (
          <Marker
            position={markerPosition}
            draggable={true}
            onDragEnd={onMarkerDragEnd}
          />
        )}
      </GoogleMap>
    </LoadScript>
  );
};

export default GoogleMapPicker;
