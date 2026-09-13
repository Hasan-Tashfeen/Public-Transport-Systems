import type { TransportMode } from "../types/api";

interface ModeFilterProps {
  modes: TransportMode[];
  selected: TransportMode | null;
  onChange: (mode: TransportMode | null) => void;
}

export default function ModeFilter({
  modes,
  selected,
  onChange,
}: ModeFilterProps) {
  return (
    <div role="group" aria-label="mode filter" className="mode-filter">
      <button
        type="button"
        className={selected === null ? "active" : ""}
        onClick={() => onChange(null)}
      >
        All
      </button>
      {modes.map((mode) => (
        <button
          key={mode}
          type="button"
          className={selected === mode ? "active" : ""}
          onClick={() => onChange(mode)}
        >
          {mode}
        </button>
      ))}
    </div>
  );
}
