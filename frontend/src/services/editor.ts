import { MODE_COLORS, MODES } from "../constants/karachi";
import type {
  RouteInput,
  RouteStopInput,
  Schedule,
  TransportMode,
  WaypointInput,
} from "../types/api";

export { MODES };

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

export function modeColor(mode: TransportMode): string {
  return MODE_COLORS[mode];
}
