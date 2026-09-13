import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import MapView from "../components/MapView";
import ModeFilter from "../components/ModeFilter";
import SearchBar from "../components/SearchBar";
import { listRoutes } from "../services/api";
import { MODES } from "../services/editor";
import type { RouteDetail, Stop, TransportMode } from "../types/api";

export default function MapPage() {
  const [routes, setRoutes] = useState<RouteDetail[]>([]);
  const [mode, setMode] = useState<TransportMode | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    listRoutes(mode ?? undefined)
      .then(setRoutes)
      .catch(() => setRoutes([]));
  }, [mode]);

  return (
    <div className="map-page">
      <aside className="sidebar">
        <h1>City Transport</h1>
        <SearchBar
          onSelectRoute={(route) => navigate(`/routes/${route.id}`)}
          onSelectStop={(stop: Stop) => navigate(`/stops/${stop.id}`)}
        />
        <ModeFilter modes={MODES} selected={mode} onChange={setMode} />
        <ul className="route-list">
          {routes.map((route) => (
            <li key={route.id}>
              <button
                type="button"
                onClick={() => navigate(`/routes/${route.id}`)}
              >
                <span className="swatch" style={{ background: route.color }} />
                {route.number} {route.name ?? ""} ({route.mode})
              </button>
            </li>
          ))}
        </ul>
        {routes.length === 0 && (
          <p className="muted">No routes mapped yet.</p>
        )}
        <button type="button" onClick={() => navigate("/editor")}>
          Add route
        </button>
      </aside>
      <main className="map-container">
        <MapView
          routes={routes}
          onStopSelect={(stop: Stop) => navigate(`/stops/${stop.id}`)}
        />
      </main>
    </div>
  );
}
