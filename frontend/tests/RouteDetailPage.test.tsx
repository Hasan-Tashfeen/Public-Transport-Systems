import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { RouteDetail } from "../src/types/api";

const { getRoute } = vi.hoisted(() => ({ getRoute: vi.fn() }));
vi.mock("../src/services/api", () => ({ getRoute }));
vi.mock("../src/components/MapView", () => ({
  default: () => <div data-testid="map" />,
}));

import RouteDetailPage from "../src/pages/RouteDetailPage";

const route: RouteDetail = {
  id: "r1",
  number: "G",
  name: "Green Line",
  mode: "brt",
  color: "#00933C",
  stops: [
    {
      stop_id: "s1",
      sequence: 0,
      arrival_time: null,
      departure_time: null,
      stop: {
        id: "s1",
        name: "Numaish",
        area: "Saddar, Karachi",
        lat: 24.87,
        lng: 67.03,
      },
    },
    {
      stop_id: "s2",
      sequence: 1,
      arrival_time: null,
      departure_time: null,
      stop: { id: "s2", name: "Board Office", area: null, lat: 24.91, lng: 67.02 },
    },
  ],
  waypoints: [],
  schedule: null,
};

describe("RouteDetailPage", () => {
  it("lists ordered stops and marks both terminals", async () => {
    getRoute.mockResolvedValue(route);
    render(
      <MemoryRouter initialEntries={["/routes/r1"]}>
        <Routes>
          <Route path="/routes/:id" element={<RouteDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByText(/Numaish/)).toBeTruthy();
    expect(screen.getByText(/Saddar, Karachi/)).toBeTruthy();
    expect(screen.getAllByText(/terminal/i)).toHaveLength(2);
  });
});
