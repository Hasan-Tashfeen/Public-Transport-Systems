import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ScheduleView from "../src/components/ScheduleView";
import type { Schedule } from "../src/types/api";

describe("ScheduleView", () => {
  it("renders a frequency schedule as headway and operating hours", () => {
    const schedule: Schedule = {
      type: "frequency",
      service_days: null,
      departures: null,
      headway_minutes: 10,
      start_time: "06:00",
      end_time: "23:00",
    };
    render(<ScheduleView schedule={schedule} />);
    expect(screen.getByText(/every 10 minutes/i)).toBeTruthy();
    expect(screen.getByText(/Operating hours: 06:00/)).toBeTruthy();
  });

  it("renders a fixed timetable as departures and service days", () => {
    const schedule: Schedule = {
      type: "fixed",
      service_days: [0, 2],
      departures: ["08:00", "09:00"],
      headway_minutes: null,
      start_time: null,
      end_time: null,
    };
    render(<ScheduleView schedule={schedule} />);
    expect(screen.getByText(/Departures: 08:00, 09:00/)).toBeTruthy();
    expect(screen.getByText(/Mon, Wed/)).toBeTruthy();
  });

  it("shows a not-available state when there is no schedule", () => {
    render(<ScheduleView schedule={null} />);
    expect(screen.getByText(/Schedule not available/i)).toBeTruthy();
  });
});
