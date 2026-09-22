import Link from "next/link";
export default function Blog() {
  return (
    <article className="content-page">
      <p className="eyebrow">THE TRAVEL JOURNAL · DEMO CONTENT</p>
      <h1>
        A day in Dresden,
        <br />a journey to remember.
      </h1>
      <p className="intro">
        Some of the best city breaks start at the station.
      </p>
      <h2>Take the scenic route</h2>
      <p>
        Leave Berlin behind and spend tomorrow discovering Dresden. Bring a
        book, find a window seat, and make the journey part of your day.
      </p>
      <h2>Arrive ready to explore</h2>
      <p>
        Wander through the old town, pause for coffee, and follow the Elbe for a
        different view of the city. Keep your plans light and leave room for
        discovery.
      </p>
      <Link className="text-link" href="/">
        Plan your train journey ↗
      </Link>
    </article>
  );
}
