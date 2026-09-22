import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSearchUrl, tomorrowDate } from "../src/lib/search";
test("tomorrow uses local calendar across month, year, and DST boundaries", () => {
  for (const [year, month, day, expected] of [
    [2026, 0, 31, "2026-02-01"],
    [2026, 11, 31, "2027-01-01"],
    [2026, 2, 29, "2026-03-30"],
  ] as const) {
    assert.equal(tomorrowDate(new Date(year, month, day, 23, 59)), expected);
  }
});
test("search serializes mixed passengers and encodes city names", () => {
  const url = new URL(
    buildSearchUrl(
      " Berlin ",
      "Frankfurt & Main",
      { adult: 2, senior: 1, youth: 1 },
      new Date(2026, 8, 22),
    ),
    "http://localhost:3000",
  );
  assert.equal(url.searchParams.get("passengerAges"), "35,35,65,12");
  assert.equal(url.searchParams.get("departureDate"), "2026-09-23");
  assert.equal(url.searchParams.get("departurePosTerm"), "Berlin");
  assert.equal(url.searchParams.get("arrivalPosTerm"), "Frankfurt & Main");
});
test("rejects empty locations, zero passengers, and invalid counts", () => {
  assert.throws(() =>
    buildSearchUrl(" ", "Dresden", { adult: 1, senior: 0, youth: 0 }),
  );
  for (const count of [0, -1, 1.5, 10])
    assert.throws(() =>
      buildSearchUrl("Berlin", "Dresden", {
        adult: count,
        senior: 0,
        youth: 0,
      }),
    );
});
