import Link from "next/link";
import { SearchForm } from "@/components/SearchForm";
export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="hero-copy">
          <p className="eyebrow">EUROPE, ONE TRAIN RIDE AWAY</p>
          <h1>
            Less rush.
            <br />
            More <em>journey.</em>
          </h1>
          <p className="intro">
            City breaks, scenic routes, and somewhere new.
            <br />
            Your next European adventure starts here.
          </p>
          <div className="journey-line" aria-hidden="true">
            <span>Berlin</span>
            <i />
            <span>Dresden</span>
          </div>
          <p className="hero-note">
            A window seat. A change of scenery. Endless possibilities.
          </p>
        </div>
        <SearchForm />
      </section>
      <section className="below">
        <span className="eyebrow">GO A LITTLE FURTHER</span>
        <h2>Great journeys start with a simple search.</h2>
        <p>
          Choose your cities. Bring your favourite people. Let the rails do the
          rest.
        </p>
        <Link href="/blog">
          Find a little inspiration <span aria-hidden="true">↗</span>
        </Link>
      </section>
    </>
  );
}
