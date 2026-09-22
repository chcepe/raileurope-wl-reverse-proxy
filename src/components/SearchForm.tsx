"use client";
import { useEffect, useState, type FormEvent } from "react";
import {
  buildSearchUrl,
  passengerCategories,
  tomorrowDate,
  type PassengerCounts,
} from "@/lib/search";
export function SearchForm() {
  const [from, setFrom] = useState("Berlin");
  const [to, setTo] = useState("Dresden");
  const [counts, setCounts] = useState<PassengerCounts>({
    adult: 1,
    senior: 0,
    youth: 0,
  });
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  // Browser-local calendar date; refresh when a tab left open overnight regains focus.
  useEffect(() => {
    const refresh = () => setDate(tomorrowDate());
    refresh();
    window.addEventListener("focus", refresh);
    const interval = window.setInterval(refresh, 60_000);
    return () => {
      window.removeEventListener("focus", refresh);
      window.clearInterval(interval);
    };
  }, []);
  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    try {
      const url = buildSearchUrl(from, to, counts);
      setError("");
      setSubmitting(true);
      window.location.assign(url);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Check your search details.",
      );
    }
  }
  return (
    <form
      className="search-card"
      onSubmit={submit}
      aria-labelledby="search-title"
    >
      <div className="card-heading">
        <span className="eyebrow">LET’S GET YOU THERE</span>
        <h2 id="search-title">Where to next?</h2>
      </div>
      <div className="locations">
        <label>
          From
          <input
            name="from"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            required
            placeholder="Departure city"
            autoComplete="off"
          />
        </label>
        <label>
          To
          <input
            name="to"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            required
            placeholder="Arrival city"
            autoComplete="off"
          />
        </label>
      </div>
      <div className="departure">
        <span aria-hidden="true">▦</span>
        <div>
          <span className="field-label">Departure · One way</span>
          <strong>
            Tomorrow{" "}
            {date && (
              <time dateTime={date}>
                {new Date(`${date}T12:00:00`).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                })}
              </time>
            )}
          </strong>
        </div>
      </div>
      <fieldset>
        <legend>Who’s travelling?</legend>
        {passengerCategories.map(({ key, label, range }) => (
          <div className="passenger" key={key}>
            <div>
              <strong>{label}</strong>
              <span>{range}</span>
            </div>
            <div className="counter">
              <button
                type="button"
                aria-label={`Remove ${label.toLowerCase()}`}
                disabled={counts[key] === 0}
                onClick={() =>
                  setCounts((current) => ({
                    ...current,
                    [key]: current[key] - 1,
                  }))
                }
              >
                −
              </button>
              <output aria-label={`${label} count`} aria-live="polite">
                {counts[key]}
              </output>
              <button
                type="button"
                aria-label={`Add ${label.toLowerCase()}`}
                disabled={counts[key] === 9}
                onClick={() =>
                  setCounts((current) => ({
                    ...current,
                    [key]: current[key] + 1,
                  }))
                }
              >
                +
              </button>
            </div>
          </div>
        ))}
      </fieldset>
      <p className="demo-note">Demo ages: adult 35 · senior 65 · youth 12</p>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button className="search-button" type="submit" disabled={submitting}>
        {submitting ? "Finding your journey…" : "Search trains"}
        <span aria-hidden="true">↗</span>
      </button>
      <p className="card-footnote">Powered by Omio</p>
    </form>
  );
}
