import type { Schedule, ScheduleType } from "../types/api";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function ScheduleView({ schedule }: { schedule: Schedule | null }) {
  if (!schedule) {
    return <p className="muted">Schedule not available</p>;
  }

  if (schedule.type === "frequency") {
    return (
      <div className="schedule">
        <p>Runs every {schedule.headway_minutes} minutes</p>
        <p>
          Operating hours: {schedule.start_time} – {schedule.end_time}
        </p>
      </div>
    );
  }

  return (
    <div className="schedule">
      <p>Departures: {(schedule.departures ?? []).join(", ")}</p>
      <p>
        Service days: {(schedule.service_days ?? []).map((d) => DAYS[d]).join(", ")}
      </p>
    </div>
  );
}

interface ScheduleFormProps {
  value: Schedule | null;
  onChange: (schedule: Schedule | null) => void;
}

export function ScheduleForm({ value, onChange }: ScheduleFormProps) {
  function setType(type: ScheduleType | "none") {
    if (type === "none") {
      onChange(null);
    } else if (type === "fixed") {
      onChange({
        type: "fixed",
        departures: value?.departures ?? [],
        service_days: value?.service_days ?? [],
        headway_minutes: null,
        start_time: null,
        end_time: null,
      });
    } else {
      onChange({
        type: "frequency",
        headway_minutes: value?.headway_minutes ?? 10,
        start_time: value?.start_time ?? "06:00",
        end_time: value?.end_time ?? "23:00",
        departures: null,
        service_days: null,
      });
    }
  }

  const currentType: ScheduleType | "none" = value ? value.type : "none";

  return (
    <div className="schedule-form">
      <label>
        Schedule
        <select
          value={currentType}
          onChange={(event) => setType(event.target.value as ScheduleType | "none")}
        >
          <option value="none">None</option>
          <option value="fixed">Fixed timetable</option>
          <option value="frequency">Frequency</option>
        </select>
      </label>

      {value?.type === "fixed" && (
        <>
          <label>
            Departures (comma-separated HH:MM)
            <input
              value={(value.departures ?? []).join(", ")}
              onChange={(event) =>
                onChange({
                  ...value,
                  departures: event.target.value
                    .split(",")
                    .map((s) => s.trim())
                    .filter(Boolean),
                })
              }
            />
          </label>
          <label>
            Service days (comma-separated 0-6)
            <input
              value={(value.service_days ?? []).join(", ")}
              onChange={(event) =>
                onChange({
                  ...value,
                  service_days: event.target.value
                    .split(",")
                    .map((s) => Number(s.trim()))
                    .filter((n) => !Number.isNaN(n)),
                })
              }
            />
          </label>
        </>
      )}

      {value?.type === "frequency" && (
        <>
          <label>
            Headway (minutes)
            <input
              type="number"
              value={value.headway_minutes ?? 10}
              onChange={(event) =>
                onChange({
                  ...value,
                  headway_minutes: Number(event.target.value),
                })
              }
            />
          </label>
          <label>
            Start time
            <input
              value={value.start_time ?? "06:00"}
              onChange={(event) =>
                onChange({ ...value, start_time: event.target.value })
              }
            />
          </label>
          <label>
            End time
            <input
              value={value.end_time ?? "23:00"}
              onChange={(event) => onChange({ ...value, end_time: event.target.value })}
            />
          </label>
        </>
      )}
    </div>
  );
}
