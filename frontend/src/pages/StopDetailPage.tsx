import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { MODE_COLORS, MODE_LABELS } from "../constants/karachi";
import { getStop } from "../services/api";
import type { StopDetail } from "../types/api";

export default function StopDetailPage() {
  const { id } = useParams();
  const [stop, setStop] = useState<StopDetail | null>(null);

  useEffect(() => {
    if (id) {
      getStop(id)
        .then(setStop)
        .catch(() => setStop(null));
    }
  }, [id]);

  if (!stop) {
    return (
      <div className="detail">
        <Link to="/">Back</Link>
        <p className="muted">Stop not found</p>
      </div>
    );
  }

  return (
    <div className="detail">
      <Link to="/">Back</Link>
      <h1>{stop.name}</h1>
      {stop.area && <p className="muted">{stop.area}</p>}
      <h2>Serving routes</h2>
      <ul className="route-list">
        {stop.routes.map((route) => (
          <li key={route.id}>
            <Link to={`/routes/${route.id}`}>
              <span
                className="bullet"
                data-mode={route.mode}
                style={{ background: MODE_COLORS[route.mode] }}
                aria-hidden="true"
              >
                {route.number}
              </span>{" "}
              {MODE_LABELS[route.mode]}
            </Link>
          </li>
        ))}
      </ul>
      {stop.routes.length === 0 && (
        <p className="muted">No routes serve this stop yet.</p>
      )}
    </div>
  );
}
