import type {
  RouteInput,
  RouteStopInput,
  Schedule,
  TransportMode,
  WaypointInput,
} from "../types/api";

export interface RouteDraft {
  number: string;
  name: string | null;
  mode: TransportMode;
  color: string;
}

export function reorderSequences<T extends { sequence: number }>(items: T[]): T[] {
  return [...items]
    .sort((a, b) => a.sequence - b.sequence)
    .map((item, index) => ({ ...item, sequence: index }));
}

export function buildRouteInput(
  draft: RouteDraft,
  stops: RouteStopInput[],
  waypoints: WaypointInput[],
  schedule: Schedule | null,
): RouteInput {
  return {
    number: draft.number,
    name: draft.name,
    mode: draft.mode,
    color: draft.color,
    stops: reorderSequences(stops),
    waypoints: reorderSequences(waypoints),
    schedule,
  };
}

export const MODES: TransportMode[] = ["bus", "tram", "metro", "rail"];

export function modeColor(mode: TransportMode): string {
  switch (mode) {
    case "bus":
      return "#e11d48";
    case "tram":
      return "#7c3aed";
    case "metro":
      return "#2563eb";
    case "rail":
      return "#059669";
  }
}
