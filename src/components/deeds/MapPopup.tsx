import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect } from "react";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

interface MapPopupProps {
  points: { latitude: number; longitude: number }[];
  isOpen: boolean;
  onClose: () => void;
}

const FitBounds: React.FC<{ coords: [number, number][] }> = ({ coords }) => {
  const map = useMap();
  useEffect(() => {
    if (coords.length > 0) {
      const bounds = L.latLngBounds(coords);
      map.fitBounds(bounds, { 
        padding: [50, 50],
        maxZoom: 25
      });
    }
  }, [coords, map]);
  return null;
};

const MapPopup: React.FC<MapPopupProps> = ({ points, isOpen, onClose }) => {
  if (!isOpen || !points || points.length === 0) return null;

  const coords = points.map(p => [p.latitude, p.longitude] as [number, number]);
  
  const getCenter = (): [number, number] => {
    if (coords.length === 1) return coords[0];
    const latSum = coords.reduce((sum, c) => sum + c[0], 0);
    const lngSum = coords.reduce((sum, c) => sum + c[1], 0);
    return [latSum / coords.length, lngSum / coords.length];
  };

  const center = getCenter();

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl overflow-hidden w-full max-w-4xl h-[500px] relative"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          className="absolute top-2 right-2 bg-white rounded-full p-2 shadow-lg text-gray-600 hover:text-gray-900 z-[1000] hover:bg-gray-100 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
        <MapContainer
          center={center}
          zoom={13}
          minZoom={1}
          maxZoom={25}
          scrollWheelZoom={true}
          className="w-full h-full"
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            maxZoom={25}
            maxNativeZoom={19}
            zoomOffset={0}
          />
          <FitBounds coords={coords} />
          {coords.map((c, i) => (
            <Marker key={i} position={c}>
              <Popup>
                Point {i + 1}<br />
                Lat: {c[0].toFixed(6)}<br />
                Lng: {c[1].toFixed(6)}
              </Popup>
            </Marker>
          ))}
          {coords.length > 1 && (
            <Polygon positions={coords} pathOptions={{ color: "green", fillColor: "green", fillOpacity: 0.3, weight: 3 }} />
          )}
        </MapContainer>
      </div>
    </div>
  );
};

export default MapPopup;