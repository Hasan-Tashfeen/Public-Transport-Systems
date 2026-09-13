import type { RouteDetail, Stop } from "../types/api";

export type LatLng = [number, number];

export function stopPositions(route: RouteDetail): LatLng[] {
  return [...route.stops]
    .sort((a, b) => a.sequence - b.sequence)
    .map((s) => [s.stop.lat, s.stop.lng] as LatLng);
}

export function waypointPositions(route: RouteDetail): LatLng[] {
  return [...route.waypoints]
    .sort((a, b) => a.sequence - b.sequence)
    .map((w) => [w.lat, w.lng] as LatLng);
}

export function routePath(route: RouteDetail): LatLng[] {
  const waypoints = waypointPositions(route);
  if (waypoints.length >= 2) {
    return waypoints;
  }
  return stopPositions(route);
}

export function uniqueStops(routes: RouteDetail[]): Stop[] {
  const seen = new Map<string, Stop>();
  for (const route of routes) {
    for (const rs of route.stops) {
      seen.set(rs.stop.id, rs.stop);
    }
  }
  return [...seen.values()];
}
