import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import MapView from "../components/MapView";
import ScheduleView from "../components/ScheduleView";
import { MODE_COLORS, MODE_LABELS } from "../constants/karachi";
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
          <span
            className="bullet"
            data-mode={route.mode}
            style={{ background: MODE_COLORS[route.mode] }}
            aria-hidden="true"
          >
            {route.number}
          </span>{" "}
          {route.name ?? `Route ${route.number}`}
        </h1>
        <p>{MODE_LABELS[route.mode]}</p>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => navigate(`/editor/${route.id}`)}
        >
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
              {stop.stop.area ? (
                <span className="muted"> — {stop.stop.area}</span>
              ) : null}
              {(index === 0 || index === ordered.length - 1) && (
                <span className="terminal"> (terminal)</span>
              )}
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
