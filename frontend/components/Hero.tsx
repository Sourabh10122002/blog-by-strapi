import SearchBar from './SearchBar';

export default function Hero({ initialQuery = '' }: { initialQuery?: string }) {
  return (
    <section className="hero">
      <div style={{ color: '#8e9095', textAlign: 'left' }}>Start • Blog</div>
      <h1>Blog</h1>
      <p>
        Want to read something for coffee? Here you’ll find tips, inspirations,
        curiosities, technological innovations and other life accessories.
      </p>
      <SearchBar initialQuery={initialQuery} />
    </section>
  );
}