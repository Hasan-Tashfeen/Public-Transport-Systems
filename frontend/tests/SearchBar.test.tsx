import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

const { search } = vi.hoisted(() => ({ search: vi.fn() }));
vi.mock("../src/services/api", () => ({ search }));

import SearchBar from "../src/components/SearchBar";

describe("SearchBar", () => {
  beforeEach(() => {
    search.mockReset();
  });

  it("returns selectable routes and stops", async () => {
    const onSelectRoute = vi.fn();
    search.mockResolvedValue({
      routes: [
        { id: "r1", number: "G", name: "Green Line", mode: "brt", color: "#00933C" },
      ],
      stops: [],
    });
    render(<SearchBar onSelectRoute={onSelectRoute} onSelectStop={() => undefined} />);
    fireEvent.change(screen.getByLabelText("search"), { target: { value: "green" } });
    const result = await screen.findByText(/Green Line/);
    fireEvent.click(result);
    expect(onSelectRoute).toHaveBeenCalledWith(
      expect.objectContaining({ number: "G" }),
    );
  });

  it("shows a friendly no-results message", async () => {
    search.mockResolvedValue({ routes: [], stops: [] });
    render(
      <SearchBar onSelectRoute={() => undefined} onSelectStop={() => undefined} />,
    );
    fireEvent.change(screen.getByLabelText("search"), { target: { value: "zzz" } });
    expect(await screen.findByText(/No results/)).toBeTruthy();
  });
});
