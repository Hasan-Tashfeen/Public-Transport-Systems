import type { TransportMode } from "../types/api";

export const KARACHI_CENTER: [number, number] = [24.8607, 67.0011];
export const KARACHI_ZOOM = 12;
export const KARACHI_BOUNDS: [[number, number], [number, number]] = [
  [24.7, 66.75],
  [25.2, 67.45],
];

export const MODES: TransportMode[] = ["brt", "bus", "minibus"];

export const MODE_LABELS: Record<TransportMode, string> = {
  brt: "BRT",
  bus: "Bus",
  minibus: "Minibus",
};

// MTA-derived mode colors (BRT green, bus blue, minibus orange).
export const MODE_COLORS: Record<TransportMode, string> = {
  brt: "#00933C",
  bus: "#0039A6",
  minibus: "#FF6319",
};

export const CITY_NAME = "Karachi";
