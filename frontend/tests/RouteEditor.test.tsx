import { describe, expect, it } from "vitest";
import { buildRouteInput, reorderSequences } from "../src/services/editor";
import type { Schedule } from "../src/types/api";

describe("reorderSequences", () => {
  it("sorts and renumbers items", () => {
    const items = [
      { sequence: 2, lat: 0, lng: 0 },
      { sequence: 0, lat: 1, lng: 1 },
      { sequence: 1, lat: 2, lng: 2 },
    ];
    expect(reorderSequences(items).map((i) => i.sequence)).toEqual([0, 1, 2]);
  });
});

describe("buildRouteInput", () => {
  it("builds a payload with reordered stops and schedule", () => {
    const schedule: Schedule = {
      type: "fixed",
      departures: ["08:00"],
      service_days: [1],
      headway_minutes: null,
      start_time: null,
      end_time: null,
    };

    const payload = buildRouteInput(
      { number: "7", name: null, mode: "bus", color: "#ff0000" },
      [
        { stop_id: "a", sequence: 1 },
        { stop_id: "b", sequence: 0 },
      ],
      [],
      schedule,
    );

    expect(payload.stops.map((s) => s.stop_id)).toEqual(["b", "a"]);
    expect(payload.schedule?.type).toBe("fixed");
  });
});
