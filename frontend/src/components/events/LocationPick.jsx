/** @format */
import React, { useEffect, memo } from "react"; // Thêm memo
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl:
    "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click(e) {
      onLocationSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
};

const RecenterMap = ({ lat, lng }) => {
  const map = useMap();

  useEffect(() => {
    if (map && lat && lng && !isNaN(lat) && !isNaN(lng)) {
      try {
        map.setView([lat, lng], map.getZoom(), { animate: false });
      } catch (e) {
        console.warn("Map update error ignored:", e);
      }
    }
  }, [lat, lng, map]);

  return null;
};

const LocationPicker = memo(
  ({ lat, lng, onLocationSelect }) => {
    const defaultCenter = [10.762622, 106.660172];
    const hasValidLocation = lat && lng && !isNaN(lat) && !isNaN(lng);
    const position = hasValidLocation ? [lat, lng] : defaultCenter;

    return (
      <div className='h-64 w-full rounded-lg overflow-hidden border border-gray-300 relative z-0'>
        <MapContainer
          center={position}
          zoom={13}
          style={{ height: "100%", width: "100%" }}
          zoomAnimation={false}
          markerZoomAnimation={false}>
          <TileLayer
            attribution='&copy; OpenStreetMap'
            url='https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          />

          <MapClickHandler onLocationSelect={onLocationSelect} />

          {hasValidLocation && (
            <>
              <Marker position={position} />
              <RecenterMap lat={lat} lng={lng} />
            </>
          )}
        </MapContainer>
      </div>
    );
  },
  (prevProps, nextProps) => {
    return prevProps.lat === nextProps.lat && prevProps.lng === nextProps.lng;
  }
);

export default LocationPicker;
