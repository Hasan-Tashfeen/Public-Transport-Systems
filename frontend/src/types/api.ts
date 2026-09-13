export type TransportMode = "bus" | "tram" | "metro" | "rail";
export type ScheduleType = "fixed" | "frequency";

export interface Stop {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface RouteStop {
  stop_id: string;
  sequence: number;
  arrival_time: string | null;
  departure_time: string | null;
  stop: Stop;
}

export interface Waypoint {
  sequence: number;
  lat: number;
  lng: number;
}

export interface Schedule {
  type: ScheduleType;
  service_days: number[] | null;
  departures: string[] | null;
  headway_minutes: number | null;
  start_time: string | null;
  end_time: string | null;
}

export interface Route {
  id: string;
  number: string;
  name: string | null;
  mode: TransportMode;
  color: string;
}

export interface RouteDetail extends Route {
  stops: RouteStop[];
  waypoints: Waypoint[];
  schedule: Schedule | null;
}

export interface StopDetail extends Stop {
  routes: Route[];
}

export interface SearchResults {
  routes: Route[];
  stops: Stop[];
}

export interface RouteStopInput {
  stop_id: string;
  sequence: number;
  arrival_time?: string | null;
  departure_time?: string | null;
}

export interface WaypointInput {
  sequence: number;
  lat: number;
  lng: number;
}

export interface RouteInput {
  number: string;
  name: string | null;
  mode: TransportMode;
  color: string;
  stops: RouteStopInput[];
  waypoints: WaypointInput[];
  schedule: Schedule | null;
}
