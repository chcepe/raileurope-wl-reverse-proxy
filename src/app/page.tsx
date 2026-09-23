import { SearchForm } from "@/components/SearchForm";

export default function Home() {
  return (
    <section className="hero">
      <SearchForm />
      <div className="hero-copy">
        <h1>The easiest way to book European train tickets and passes</h1>
        <p>Compare and save on train travel across 35 countries</p>
        <span className="hero-label">
          Rail Europe × Omio · Integration preview
        </span>
      </div>
    </section>
  );
}
