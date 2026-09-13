import type {
  PlaceSuggestion,
  RouteDetail,
  RouteInput,
  SearchResults,
  Stop,
  StopDetail,
  TransportMode,
} from "../types/api";

const BASE = import.meta.env.VITE_API_BASE ?? "/api";

function plannerToken(): string {
  return import.meta.env.VITE_PLANNER_TOKEN ?? "dev-token";
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  if (!response.ok) {
    throw new Error(`API ${response.status}: ${await response.text()}`);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json() as Promise<T>;
}

export function listRoutes(mode?: TransportMode): Promise<RouteDetail[]> {
  const query = mode ? `?mode=${mode}` : "";
  return request<RouteDetail[]>(`/routes${query}`);
}

export function getRoute(id: string): Promise<RouteDetail> {
  return request<RouteDetail>(`/routes/${id}`);
}

export function createRoute(data: RouteInput): Promise<RouteDetail> {
  return request<RouteDetail>("/routes", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${plannerToken()}` },
  });
}

export function updateRoute(id: string, data: RouteInput): Promise<RouteDetail> {
  return request<RouteDetail>(`/routes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${plannerToken()}` },
  });
}

export function deleteRoute(id: string): Promise<void> {
  return request<void>(`/routes/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${plannerToken()}` },
  });
}

export function listStops(): Promise<Stop[]> {
  return request<Stop[]>("/stops");
}

export function getStop(id: string): Promise<StopDetail> {
  return request<StopDetail>(`/stops/${id}`);
}

export function createStop(data: {
  name: string;
  area?: string | null;
  lat: number;
  lng: number;
}): Promise<Stop> {
  return request<Stop>("/stops", {
    method: "POST",
    body: JSON.stringify(data),
    headers: { Authorization: `Bearer ${plannerToken()}` },
  });
}

export function search(query: string): Promise<SearchResults> {
  return request<SearchResults>(`/search?q=${encodeURIComponent(query)}`);
}

export function searchPlaces(query: string, limit = 5): Promise<PlaceSuggestion[]> {
  return request<PlaceSuggestion[]>(
    `/places?q=${encodeURIComponent(query)}&limit=${limit}`,
  );
}
