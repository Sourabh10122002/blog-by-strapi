import Image from 'next/image';
import Link from 'next/link';

type Post = any;

export default function PostCard({ post }: { post: Post }) {
  const cover = post?.attributes?.cover?.data?.attributes;
  const title = post?.attributes?.title;
  const slug = post?.attributes?.slug;
  const dateRaw = post?.attributes?.publishedAt;
  const date = dateRaw
    ? new Date(dateRaw).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : 'Draft';

  return (
    <article className="card">
      {cover?.url && (
        <Image className="card-img" src={cover.url} alt={title} width={800} height={450} />
      )}
      <div className="card-overlay">
        <div className="card-meta">{date}</div>
        <h3 className="card-title">{title}</h3>
      </div>
      <Link className="card-cta" href={`/posts/${slug}`} aria-label={`Read ${title}`}>
        ➜
      </Link>
    </article>
  );
}