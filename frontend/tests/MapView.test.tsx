import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ModeFilter from "../src/components/ModeFilter";
import { routePath } from "../src/services/geo";
import type { RouteDetail } from "../src/types/api";

function makeRoute(overrides: Partial<RouteDetail> = {}): RouteDetail {
  return {
    id: "r1",
    number: "7",
    name: null,
    mode: "bus",
    color: "#ff0000",
    stops: [
      {
        stop_id: "s2",
        sequence: 0,
        arrival_time: null,
        departure_time: null,
        stop: { id: "s2", name: "B", area: null, lat: 0, lng: 0 },
      },
      {
        stop_id: "s1",
        sequence: 1,
        arrival_time: null,
        departure_time: null,
        stop: { id: "s1", name: "A", area: null, lat: 1, lng: 1 },
      },
    ],
    waypoints: [],
    schedule: null,
    ...overrides,
  };
}

describe("routePath", () => {
  it("uses ordered stop positions when no waypoints exist", () => {
    expect(routePath(makeRoute())).toEqual([
      [0, 0],
      [1, 1],
    ]);
  });

  it("prefers waypoints when present", () => {
    const route = makeRoute({
      waypoints: [
        { sequence: 0, lat: 5, lng: 5 },
        { sequence: 1, lat: 6, lng: 6 },
      ],
    });
    expect(routePath(route)).toEqual([
      [5, 5],
      [6, 6],
    ]);
  });
});

describe("ModeFilter", () => {
  it("calls onChange when a Karachi mode is selected", () => {
    const onChange = vi.fn();
    render(<ModeFilter modes={["brt", "bus"]} selected={null} onChange={onChange} />);
    fireEvent.click(screen.getByRole("button", { name: "Bus" }));
    expect(onChange).toHaveBeenCalledWith("bus");
  });

  it("marks the selected mode as active", () => {
    render(
      <ModeFilter modes={["brt", "bus"]} selected="brt" onChange={() => undefined} />,
    );
    expect(screen.getByRole("button", { name: "BRT" }).className).toContain("active");
  });
});
