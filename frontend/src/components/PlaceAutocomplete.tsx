import { useEffect, useId, useState } from "react";
import type { KeyboardEvent } from "react";
import { searchPlaces } from "../services/api";
import type { PlaceSuggestion } from "../types/api";

interface PlaceAutocompleteProps {
  value: string;
  onValueChange: (value: string) => void;
  onSelect: (place: PlaceSuggestion) => void;
  label?: string;
}

const MIN_QUERY_LENGTH = 2;
const DEBOUNCE_MS = 250;

export default function PlaceAutocomplete({
  value,
  onValueChange,
  onSelect,
  label = "Stop name",
}: PlaceAutocompleteProps) {
  const listId = useId();
  const [suggestions, setSuggestions] = useState<PlaceSuggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    const query = value.trim();
    if (query.length < MIN_QUERY_LENGTH) {
      setSuggestions([]);
      setOpen(false);
      setSearched(false);
      return;
    }
    let cancelled = false;
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const places = await searchPlaces(query);
        if (!cancelled) {
          setSuggestions(places);
          setSearched(true);
          setOpen(true);
          setActiveIndex(-1);
        }
      } catch {
        if (!cancelled) {
          setSuggestions([]);
          setSearched(true);
          setOpen(true);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }, DEBOUNCE_MS);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [value]);

  function choose(place: PlaceSuggestion) {
    onSelect(place);
    onValueChange(place.name);
    setOpen(false);
    setSuggestions([]);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (!open || suggestions.length === 0) {
      return;
    }
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((index) => Math.min(index + 1, suggestions.length - 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((index) => Math.max(index - 1, 0));
    } else if (event.key === "Enter" && activeIndex >= 0) {
      event.preventDefault();
      choose(suggestions[activeIndex]);
    } else if (event.key === "Escape") {
      setOpen(false);
    }
  }

  return (
    <div className="autocomplete">
      <div className="field">
        <label htmlFor={`${listId}-input`}>{label}</label>
        <input
          id={`${listId}-input`}
          role="combobox"
          aria-expanded={open}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={
            activeIndex >= 0 ? `${listId}-option-${activeIndex}` : undefined
          }
          value={value}
          placeholder="Search a Karachi place (e.g. Sea View)"
          autoComplete="off"
          onChange={(event) => onValueChange(event.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
      {open && (
        <ul
          className="suggestions"
          id={listId}
          role="listbox"
          aria-label="place suggestions"
        >
          {suggestions.map((place, index) => (
            <li
              key={`${place.name}-${place.lat}-${place.lng}`}
              id={`${listId}-option-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              onMouseDown={(event) => {
                event.preventDefault();
                choose(place);
              }}
            >
              <span className="suggestion-name">{place.name}</span>
              {place.area && <span className="suggestion-area">{place.area}</span>}
            </li>
          ))}
          {loading && (
            <li className="muted" aria-disabled="true">
              Searching…
            </li>
          )}
          {searched && !loading && suggestions.length === 0 && (
            <li className="muted" aria-disabled="true">
              No matching places — enter the location manually.
            </li>
          )}
        </ul>
      )}
    </div>
  );
}
