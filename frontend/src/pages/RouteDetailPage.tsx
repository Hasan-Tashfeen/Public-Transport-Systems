import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MapView from "../components/MapView";
import ScheduleView from "../components/ScheduleView";
import { getRoute } from "../services/api";
import type { RouteDetail } from "../types/api";

export default function RouteDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [route, setRoute] = useState<RouteDetail | null>(null);

  useEffect(() => {
    if (id) {
      getRoute(id)
        .then(setRoute)
        .catch(() => setRoute(null));
    }
  }, [id]);

  if (!route) {
    return (
      <div className="detail">
        <Link to="/">Back</Link>
        <p className="muted">Route not found</p>
      </div>
    );
  }

  const ordered = [...route.stops].sort((a, b) => a.sequence - b.sequence);

  return (
    <div className="detail">
      <header>
        <Link to="/">Back</Link>
        <h1>
          {route.number} {route.name ?? ""}
        </h1>
        <p>{route.mode}</p>
        <button type="button" onClick={() => navigate(`/editor/${route.id}`)}>
          Edit
        </button>
      </header>

      <div className="map-container">
        <MapView routes={[route]} />
      </div>

      <section>
        <h2>Stops</h2>
        <ol>
          {ordered.map((stop, index) => (
            <li key={`${stop.stop_id}-${index}`}>
              {stop.stop.name}
              {index === 0 || index === ordered.length - 1
                ? " (terminal)"
                : ""}
            </li>
          ))}
        </ol>
      </section>

      <section>
        <h2>Schedule</h2>
        <ScheduleView schedule={route.schedule} />
      </section>
    </div>
  );
}
