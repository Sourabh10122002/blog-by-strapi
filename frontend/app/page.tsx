import Hero from '../components/Hero';
import PostCard from '../components/PostCard';
import { getCategories, getPostsByCategorySlug, searchPosts } from '../lib/strapi';

export default async function HomePage({ searchParams }: { searchParams?: { q?: string } }) {
  const q = searchParams?.q?.trim();
  const isSearch = !!q;

  let categories: any[] = [];
  let grouped: Record<string, any[]> = {};
  let results: any[] = [];

  if (isSearch) {
    results = await searchPosts(q!);
  } else {
    categories = await getCategories(4);
    // Pull a few posts for each category
    for (const cat of categories) {
      const slug = cat.attributes.slug;
      grouped[slug] = await getPostsByCategorySlug(slug, 3);
    }
  }

  return (
    <div>
      <Hero initialQuery={q || ''} />

      {isSearch ? (
        <section className="section">
          <div className="section-head">
            <h2 className="section-title">Search results</h2>
            <div style={{ color: '#8e9095' }}>{results.length} found</div>
          </div>
          <div className="cards">
            {results.map((p) => (
              <PostCard key={p.id} post={p} />
            ))}
          </div>
        </section>
      ) : (
        <>
          {categories.map((cat) => {
            const slug = cat.attributes.slug;
            const name = cat.attributes.name;
            const items = grouped[slug] || [];
            return (
              <section key={slug} className="section">
                <div className="section-head">
                  <h2 className="section-title">{name}</h2>
                  <a className="more-btn" href={`/category/${slug}`}>More</a>
                </div>
                <div className="cards">
                  {items.map((p: any) => (
                    <PostCard key={p.id} post={p} />
                  ))}
                </div>
              </section>
            );
          })}
        </>
      )}
    </div>
  );
}