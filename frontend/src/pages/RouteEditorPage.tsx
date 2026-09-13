import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import RouteEditor from "../components/RouteEditor";
import { getRoute } from "../services/api";
import type { RouteDetail } from "../types/api";

export default function RouteEditorPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [initial, setInitial] = useState<RouteDetail | null>(null);

  useEffect(() => {
    if (id) {
      getRoute(id)
        .then(setInitial)
        .catch(() => setInitial(null));
    }
  }, [id]);

  return (
    <RouteEditor
      initial={initial}
      onSaved={(route) => navigate(`/routes/${route.id}`)}
    />
  );
}
