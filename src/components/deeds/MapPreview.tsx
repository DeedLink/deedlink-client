import { MapContainer, TileLayer, Polygon } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import type { LocationPoint } from "../../types/types";

interface MapPreviewProps {
  points: LocationPoint[];
  zoom?: number;
}

const MapPreview: React.FC<MapPreviewProps> = ({ points, zoom = 16 }) => {
  if (!points || points.length === 0) return null;
  const polygonCoords = points.map(p => [p.latitude, p.longitude] as [number, number]);
  const center = polygonCoords[0];

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      scrollWheelZoom={false}
      className="h-28 w-full rounded-lg z-0"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />
      <Polygon
        positions={polygonCoords}
        pathOptions={{ color: "green", fillOpacity: 0.3 }}
      />
    </MapContainer>
  );
};

export default MapPreview;
