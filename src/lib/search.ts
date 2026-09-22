export const passengerCategories = [
  { key: "adult", label: "Adult", range: "26–59 years", age: 35 },
  { key: "senior", label: "Senior", range: "60+ years", age: 65 },
  { key: "youth", label: "Youth", range: "0–25 years", age: 12 },
] as const;
export type PassengerCounts = Record<
  (typeof passengerCategories)[number]["key"],
  number
>;
export function tomorrowDate(now = new Date()): string {
  const tomorrow = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate() + 1,
  );
  return `${tomorrow.getFullYear()}-${String(tomorrow.getMonth() + 1).padStart(2, "0")}-${String(tomorrow.getDate()).padStart(2, "0")}`;
}
export function buildSearchUrl(
  from: string,
  to: string,
  counts: PassengerCounts,
  now = new Date(),
): string {
  if (!from.trim() || !to.trim())
    throw new Error("Enter a departure and arrival city.");
  const ages = passengerCategories.flatMap(({ key, age }) => {
    const count = counts[key];
    if (!Number.isInteger(count) || count < 0 || count > 9)
      throw new Error("Choose between 0 and 9 passengers per category.");
    return Array<number>(count).fill(age);
  });
  if (!ages.length) throw new Error("Add at least one passenger.");
  const params = new URLSearchParams({
    departurePosTerm: from.trim(),
    arrivalPosTerm: to.trim(),
    departureDate: tomorrowDate(now),
    passengerAges: ages.join(","),
    locale: "en",
    currency: "EUR",
  });
  const linkId =
    process.env.NEXT_PUBLIC_OMIO_LINK_ID ||
    "da69db62-5653-42f8-9b17-84830c319d08";
  return `/links/${encodeURIComponent(linkId)}?${params}`;
}
