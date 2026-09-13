import { fireEvent, render, screen } from "@testing-library/react";
import { useState } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { PlaceSuggestion } from "../src/types/api";

const { searchPlaces } = vi.hoisted(() => ({ searchPlaces: vi.fn() }));
vi.mock("../src/services/api", () => ({ searchPlaces }));

import PlaceAutocomplete from "../src/components/PlaceAutocomplete";

function Harness({
  initialValue = "",
  onSelect = () => undefined,
}: {
  initialValue?: string;
  onSelect?: (place: PlaceSuggestion) => void;
}) {
  const [value, setValue] = useState(initialValue);
  return (
    <PlaceAutocomplete value={value} onValueChange={setValue} onSelect={onSelect} />
  );
}

describe("PlaceAutocomplete", () => {
  beforeEach(() => {
    searchPlaces.mockReset();
  });

  it("suggests real Karachi places with their area", async () => {
    searchPlaces.mockResolvedValue([
      { name: "Sea View", area: "Clifton, Karachi", lat: 24.8, lng: 67.03 },
    ]);
    render(<Harness />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "sea" } });
    expect(await screen.findByText("Sea View")).toBeTruthy();
    expect(screen.getByText("Clifton, Karachi")).toBeTruthy();
  });

  it("calls onSelect with the chosen place", async () => {
    const onSelect = vi.fn();
    searchPlaces.mockResolvedValue([
      { name: "Sea View", area: null, lat: 24.8, lng: 67.03 },
    ]);
    render(<Harness onSelect={onSelect} />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "sea" } });
    const option = await screen.findByText("Sea View");
    fireEvent.mouseDown(option);
    expect(onSelect).toHaveBeenCalledWith(
      expect.objectContaining({ name: "Sea View", lat: 24.8, lng: 67.03 }),
    );
  });

  it("shows a manual-entry fallback when there are no matches", async () => {
    searchPlaces.mockResolvedValue([]);
    render(<Harness />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "zzz" } });
    expect(await screen.findByText(/enter the location manually/i)).toBeTruthy();
  });

  it("does not search for fewer than two characters", () => {
    render(<Harness />);
    fireEvent.change(screen.getByRole("combobox"), { target: { value: "s" } });
    expect(searchPlaces).not.toHaveBeenCalled();
  });
});
