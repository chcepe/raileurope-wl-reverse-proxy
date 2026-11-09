"use client";

import { useState, type FormEvent } from "react";
import {
  buildSearchUrl,
  passengerCategories,
  type PassengerCounts,
} from "@/lib/search";

const passengers: PassengerCounts = { adult: 1, senior: 0, youth: 0 };

export function SearchForm() {
  const [exploreStays, setExploreStays] = useState(false);

  function search(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const searchUrl = buildSearchUrl("Berlin", "Dresden", passengers);
    if (exploreStays) {
      window.open(searchUrl, "_blank", "noopener,noreferrer");
      window.location.assign("https://www.booking.com/searchresults.html?ss=Dresden");
      return;
    }
    window.location.assign(searchUrl);
  }

  return (
    <form
      className="search-card"
      onSubmit={search}
      aria-labelledby="search-title"
    >
      <div className="search-card-top">
        <h2 id="search-title">Train tickets</h2>
        <dl className="locations">
          <div>
            <dt>From</dt>
            <dd>Berlin</dd>
          </div>
          <div>
            <dt>To</dt>
            <dd>Dresden</dd>
          </div>
        </dl>
      </div>
      <div className="search-card-body">
        <dl className="journey-details">
          <div>
            <dt>Depart</dt>
            <dd>Tomorrow</dd>
          </div>
          <div>
            <dt>Journey</dt>
            <dd>One way</dd>
          </div>
        </dl>
        <dl className="passengers" aria-label="Passengers">
          {passengerCategories.map(({ key, label, range }) => (
            <div key={key}>
              <dt>
                {label} <span>({range})</span>
              </dt>
              <dd>{passengers[key]}</dd>
            </div>
          ))}
        </dl>
        <p className="demo-note">Preset demo journey · 1 adult, age 35</p>
        <button className="search-button" type="submit">
          <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              cx="10"
              cy="10"
              r="6.5"
              stroke="currentColor"
              strokeWidth="3"
            />
            <path d="m15 15 6 6" stroke="currentColor" strokeWidth="3" />
          </svg>
          Search
        </button>
        <label>
          <input
            type="checkbox"
            checked={exploreStays}
            onChange={(event) => setExploreStays(event.target.checked)}
          />
          Explore places to stay
        </label>
        <p className="card-footnote">Tomorrow’s date is set when you search.</p>
      </div>
    </form>
  );
}
