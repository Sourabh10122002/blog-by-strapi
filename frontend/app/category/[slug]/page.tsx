import PostCard from '../../../components/PostCard';
import { getPostsByCategorySlug } from '../../../lib/strapi';

export default async function CategoryPage({ params }: { params: { slug: string } }) {
  const posts = await getPostsByCategorySlug(params.slug, 12);
  return (
    <div>
      <section className="hero" style={{ paddingBottom: 0 }}>
        <h1>{params.slug}</h1>
      </section>
      <section className="section">
        <div className="cards">
          {posts.map((p) => (
            <PostCard key={p.id} post={p} />
          ))}
        </div>
      </section>
    </div>
  );
}