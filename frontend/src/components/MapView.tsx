import {
  CircleMarker,
  MapContainer,
  Polyline,
  Popup,
  TileLayer,
  useMapEvents,
} from "react-leaflet";
import { KARACHI_BOUNDS, KARACHI_CENTER, KARACHI_ZOOM } from "../constants/karachi";
import { routePath, uniqueStops } from "../services/geo";
import type { RouteDetail, Stop } from "../types/api";

interface MapViewProps {
  routes: RouteDetail[];
  center?: [number, number];
  zoom?: number;
  onStopSelect?: (stop: Stop) => void;
  onMapClick?: (lat: number, lng: number) => void;
}

function ClickCatcher({ onClick }: { onClick?: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(event) {
      onClick?.(event.latlng.lat, event.latlng.lng);
    },
  });
  return null;
}

export default function MapView({
  routes,
  center = KARACHI_CENTER,
  zoom = KARACHI_ZOOM,
  onStopSelect,
  onMapClick,
}: MapViewProps) {
  const stops = uniqueStops(routes);

  return (
    <MapContainer
      center={center}
      zoom={zoom}
      minZoom={10}
      maxBounds={KARACHI_BOUNDS}
      maxBoundsViscosity={0.8}
      style={{ height: "100%", width: "100%" }}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <ClickCatcher onClick={onMapClick} />
      {routes.map((route) => (
        <Polyline
          key={route.id}
          positions={routePath(route)}
          pathOptions={{ color: route.color, weight: 5, opacity: 0.9 }}
        />
      ))}
      {stops.map((stop) => (
        <CircleMarker
          key={stop.id}
          center={[stop.lat, stop.lng]}
          radius={6}
          pathOptions={{
            color: "#0f172a",
            weight: 2,
            fillColor: "#ffffff",
            fillOpacity: 1,
          }}
          eventHandlers={{ click: () => onStopSelect?.(stop) }}
        >
          <Popup>{stop.name}</Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
