import { MODE_COLORS, MODE_LABELS } from "../constants/karachi";
import type { TransportMode } from "../types/api";

interface ModeFilterProps {
  modes: TransportMode[];
  selected: TransportMode | null;
  onChange: (mode: TransportMode | null) => void;
}

export default function ModeFilter({ modes, selected, onChange }: ModeFilterProps) {
  return (
    <div role="group" aria-label="mode filter" className="mode-filter">
      <button
        type="button"
        aria-pressed={selected === null}
        className={selected === null ? "active" : ""}
        onClick={() => onChange(null)}
      >
        All
      </button>
      {modes.map((mode) => (
        <button
          key={mode}
          type="button"
          aria-pressed={selected === mode}
          className={selected === mode ? "active" : ""}
          onClick={() => onChange(mode)}
        >
          <span
            className="swatch"
            style={{ background: MODE_COLORS[mode] }}
            aria-hidden="true"
          />
          {MODE_LABELS[mode]}
        </button>
      ))}
    </div>
  );
}
