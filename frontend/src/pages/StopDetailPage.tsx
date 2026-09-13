import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
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
      <h2>Serving routes</h2>
      <ul>
        {stop.routes.map((route) => (
          <li key={route.id}>
            <Link to={`/routes/${route.id}`}>
              {route.number} ({route.mode})
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
