import { useState } from "react";
import { search } from "../services/api";
import type { Route, Stop } from "../types/api";

interface SearchBarProps {
  onSelectRoute: (route: Route) => void;
  onSelectStop: (stop: Stop) => void;
}

export default function SearchBar({
  onSelectRoute,
  onSelectStop,
}: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<{
    routes: Route[];
    stops: Stop[];
  } | null>(null);

  async function handleChange(value: string) {
    setQuery(value);
    if (value.trim().length === 0) {
      setResults(null);
      return;
    }
    const found = await search(value.trim());
    setResults(found);
  }

  return (
    <div className="search">
      <input
        type="search"
        value={query}
        onChange={(event) => handleChange(event.target.value)}
        placeholder="Search routes or stops"
        aria-label="search"
      />
      {results && (
        <ul>
          {results.routes.map((route) => (
            <li key={route.id}>
              <button type="button" onClick={() => onSelectRoute(route)}>
                {route.number} {route.name ?? ""} ({route.mode})
              </button>
            </li>
          ))}
          {results.stops.map((stop) => (
            <li key={stop.id}>
              <button type="button" onClick={() => onSelectStop(stop)}>
                {stop.name}
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
