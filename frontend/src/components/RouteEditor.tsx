import { useState } from "react";
import { MODE_LABELS } from "../constants/karachi";
import { createRoute, createStop, updateRoute } from "../services/api";
import { MODES, buildRouteInput, modeColor } from "../services/editor";
import type {
  PlaceSuggestion,
  RouteDetail,
  Schedule,
  TransportMode,
  WaypointInput,
} from "../types/api";
import MapView from "./MapView";
import PlaceAutocomplete from "./PlaceAutocomplete";
import { ScheduleForm } from "./ScheduleView";

interface EditorStop {
  stop_id: string;
  sequence: number;
  name: string;
  area: string | null;
  lat: number;
  lng: number;
}

interface RouteEditorProps {
  initial?: RouteDetail | null;
  onSaved?: (route: RouteDetail) => void;
}

export default function RouteEditor({ initial, onSaved }: RouteEditorProps) {
  const [number, setNumber] = useState(initial?.number ?? "");
  const [name, setName] = useState(initial?.name ?? "");
  const [mode, setMode] = useState<TransportMode>(initial?.mode ?? "bus");
  const [stops, setStops] = useState<EditorStop[]>(
    initial?.stops.map((s) => ({
      stop_id: s.stop_id,
      sequence: s.sequence,
      name: s.stop.name,
      area: s.stop.area,
      lat: s.stop.lat,
      lng: s.stop.lng,
    })) ?? [],
  );
  const [waypoints, setWaypoints] = useState<WaypointInput[]>(
    initial?.waypoints.map((w) => ({
      sequence: w.sequence,
      lat: w.lat,
      lng: w.lng,
    })) ?? [],
  );
  const [schedule, setSchedule] = useState<Schedule | null>(initial?.schedule ?? null);
  const [addingStops, setAddingStops] = useState(true);
  const [stopQuery, setStopQuery] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleMapClick(lat: number, lng: number) {
    if (addingStops) {
      const stop = await createStop({
        name: `Stop ${stops.length + 1}`,
        lat,
        lng,
      });
      setStops((prev) => [
        ...prev,
        {
          stop_id: stop.id,
          sequence: prev.length,
          name: stop.name,
          area: stop.area,
          lat,
          lng,
        },
      ]);
    } else {
      setWaypoints((prev) => [...prev, { sequence: prev.length, lat, lng }]);
    }
  }

  async function handlePlaceSelect(place: PlaceSuggestion) {
    const stop = await createStop({
      name: place.name,
      area: place.area,
      lat: place.lat,
      lng: place.lng,
    });
    setStops((prev) => [
      ...prev,
      {
        stop_id: stop.id,
        sequence: prev.length,
        name: stop.name,
        area: stop.area,
        lat: stop.lat,
        lng: stop.lng,
      },
    ]);
    setStopQuery("");
  }

  async function save() {
    setSaving(true);
    setError(null);
    const payload = buildRouteInput(
      { number, name: name || null, mode, color: modeColor(mode) },
      stops.map((s) => ({ stop_id: s.stop_id, sequence: s.sequence })),
      waypoints,
      schedule,
    );
    try {
      const saved = initial
        ? await updateRoute(initial.id, payload)
        : await createRoute(payload);
      onSaved?.(saved);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSaving(false);
    }
  }

  const preview: RouteDetail = {
    id: initial?.id ?? "preview",
    number,
    name: name || null,
    mode,
    color: modeColor(mode),
    stops: stops.map((s) => ({
      stop_id: s.stop_id,
      sequence: s.sequence,
      arrival_time: null,
      departure_time: null,
      stop: { id: s.stop_id, name: s.name, area: s.area, lat: s.lat, lng: s.lng },
    })),
    waypoints,
    schedule,
  };

  return (
    <div className="editor">
      <header>
        <h1>{initial ? "Edit route" : "New route"}</h1>
      </header>

      <div className="editor-form">
        <label>
          Number
          <input value={number} onChange={(e) => setNumber(e.target.value)} />
        </label>
        <label>
          Name
          <input value={name} onChange={(e) => setName(e.target.value)} />
        </label>
        <label>
          Mode
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as TransportMode)}
          >
            {MODES.map((m) => (
              <option key={m} value={m}>
                {MODE_LABELS[m]}
              </option>
            ))}
          </select>
        </label>
        <PlaceAutocomplete
          value={stopQuery}
          onValueChange={setStopQuery}
          onSelect={handlePlaceSelect}
          label="Add stop by name"
        />
        <ScheduleForm value={schedule} onChange={setSchedule} />
        <div className="editor-tools">
          <label>
            <input
              type="radio"
              checked={addingStops}
              onChange={() => setAddingStops(true)}
            />
            Add stops
          </label>
          <label>
            <input
              type="radio"
              checked={!addingStops}
              onChange={() => setAddingStops(false)}
            />
            Add waypoints
          </label>
        </div>
        <button
          type="button"
          className="btn-primary"
          onClick={save}
          disabled={saving || !number}
        >
          {saving ? "Saving…" : "Save route"}
        </button>
        {error && <p className="error">{error}</p>}
      </div>

      <div className="map-container">
        <MapView routes={[preview]} onMapClick={handleMapClick} />
      </div>
    </div>
  );
}
