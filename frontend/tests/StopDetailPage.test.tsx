import { render, screen } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { describe, expect, it, vi } from "vitest";
import type { StopDetail } from "../src/types/api";

const { getStop } = vi.hoisted(() => ({ getStop: vi.fn() }));
vi.mock("../src/services/api", () => ({ getStop }));

import StopDetailPage from "../src/pages/StopDetailPage";

const stop: StopDetail = {
  id: "s1",
  name: "Board Office",
  area: "North Nazimabad, Karachi",
  lat: 24.91,
  lng: 67.02,
  routes: [
    { id: "r1", number: "G", name: "Green Line", mode: "brt", color: "#00933C" },
    { id: "r2", number: "O", name: "Orange Line", mode: "brt", color: "#FF6319" },
  ],
};

describe("StopDetailPage", () => {
  it("shows the area and serving routes with modes", async () => {
    getStop.mockResolvedValue(stop);
    render(
      <MemoryRouter initialEntries={["/stops/s1"]}>
        <Routes>
          <Route path="/stops/:id" element={<StopDetailPage />} />
        </Routes>
      </MemoryRouter>,
    );
    expect(await screen.findByText("Board Office")).toBeTruthy();
    expect(screen.getByText("North Nazimabad, Karachi")).toBeTruthy();
    expect(screen.getAllByText("BRT")).toHaveLength(2);
  });
});
