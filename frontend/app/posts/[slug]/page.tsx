import Image from 'next/image';
import Link from 'next/link';
import PostCard from '../../../components/PostCard';
import { getPostBySlug, getPostsByCategorySlug } from '../../../lib/strapi';
const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

interface PageProps { params: { slug: string } }

export default async function PostPage({ params }: PageProps) {
  const post = await getPostBySlug(params.slug);
  if (!post) {
    return <div className="article">Post not found.</div>;
  }

  const title = post.attributes.title;
  const categoryName = post.attributes.category?.data?.attributes?.name || 'Blog';
  const categorySlug = post.attributes.category?.data?.attributes?.slug || 'blog';
  const dateRaw = post.attributes.publishedAt;
  const date = dateRaw
    ? new Date(dateRaw).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : '';
  const similar = await getPostsByCategorySlug(categorySlug, 3);

  // Some Strapi richtext returns HTML entities (e.g., &lt;h2&gt;). Decode them so headings render.
  const decodeEntities = (html: string) =>
    (html || '')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

  const toAbsoluteUrl = (u: string) => {
    if (!u) return u;
    if (u.startsWith('http')) return u;
    if (u.startsWith('/uploads/')) return `${STRAPI_URL}${u}`;
    return u;
  };
  const toProxyUrl = (u: string) => `/api/proxy-image?url=${encodeURIComponent(toAbsoluteUrl(u))}`;

  const rewriteImageSrcs = (html: string) => {
    return (html || '').replace(/<img\s+([^>]*?)src=["']([^"']+)["']([^>]*)>/gi, (m, pre, src, post) => {
      const proxied = toProxyUrl(src);
      const hasClass = /class=/.test(pre + post);
      const cls = hasClass ? '' : ' class="article-inline-img"';
      const hasLoading = /loading=/.test(pre + post) ? '' : ' loading="lazy"';
      const hasAlt = /alt=/.test(pre + post) ? '' : ' alt=""';
      return `<img ${pre} src="${proxied}"${cls}${hasLoading}${hasAlt}${post}>`;
    });
  };

  // YouTube embed helpers
  const parseStartSeconds = (t: string | null) => {
    if (!t) return 0;
    if (/^\d+$/.test(t)) return parseInt(t, 10);
    const m = t.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?/);
    if (!m) return 0;
    const h = parseInt(m[1] || '0', 10);
    const mnt = parseInt(m[2] || '0', 10);
    const s = parseInt(m[3] || '0', 10);
    return h * 3600 + mnt * 60 + s;
  };
  const toYouTubeEmbed = (url: string) => {
    try {
      const u = new URL(url);
      let id = '';
      if (u.hostname.includes('youtu.be')) {
        id = u.pathname.split('/')[1] || '';
      } else if (u.hostname.includes('youtube.com')) {
        if (u.pathname.startsWith('/watch')) id = u.searchParams.get('v') || '';
        else if (u.pathname.startsWith('/shorts/')) id = u.pathname.split('/')[2] || '';
      }
      if (!id) return null;
      const start = parseStartSeconds(u.searchParams.get('t') || u.searchParams.get('start'));
      const base = `https://www.youtube.com/embed/${id}`;
      const qs = new URLSearchParams();
      if (start) qs.set('start', String(start));
      const query = qs.toString();
      return query ? `${base}?${query}` : base;
    } catch {
      return null;
    }
  };
  const rewriteYouTubeUrlsInHtml = (html: string) => {
    const pattern = /<p>\s*(https?:\/\/(?:www\.)?youtube\.com\/watch\?[^<\s]+|https?:\/\/youtu\.be\/[^<\s]+|https?:\/\/(?:www\.)?youtube\.com\/shorts\/[^<\s]+)\s*<\/p>/gi;
    return (html || '').replace(pattern, (_m: string, url: string) => {
      const embed = toYouTubeEmbed(url);
      if (!embed) return _m;
      return `<div class="article-video"><iframe src="${embed}" title="YouTube video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>`;
    });
  };

  // Inline markdown formatting: bold and italic
  const formatInline = (textEscaped: string) => {
    let s = textEscaped;
    // Bold: **text** or __text__
    s = s.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    s = s.replace(/__(.+?)__/g, '<strong>$1</strong>');
    // Italic: *text* avoiding **bold** overlap, and _text_
    s = s.replace(/(?<!\*)\*(?!\*)(.+?)(?<!\*)\*(?!\*)/g, '<em>$1</em>');
    s = s.replace(/_(.+?)_/g, '<em>$1</em>');
    return s;
  };

  // Minimal Markdown converter for headings and paragraphs, ignores images
  const escapeHtml = (s: string) =>
    s
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');

  const mdToHtml = (md: string) => {
    const lines = (md || '').split(/\r?\n/);
    const out: string[] = [];
    for (const rawLine of lines) {
      const line = rawLine.trimEnd();
      if (!line.trim()) { out.push(''); continue; }
      const m = line.match(/^(#{1,6})\s+(.*)$/);
      if (m) {
        const level = Math.min(m[1].length, 6);
        const text = formatInline(escapeHtml(m[2].trim()));
        out.push(`<h${level}>${text}</h${level}>`);
        continue;
      }
      // Markdown image ![alt](url)
      const imgMatch = line.match(/^!\[([^\]]*)\]\(([^\)]+)\)/);
      if (imgMatch) {
        const alt = escapeHtml(imgMatch[1] || '');
        const url = imgMatch[2].trim();
        const proxied = toProxyUrl(url);
        out.push(`<img src="${proxied}" alt="${alt}" class="article-inline-img" loading="lazy" />`);
        const rest = line.slice(imgMatch[0].length).trim();
        if (rest) {
          out.push(`<p>${formatInline(escapeHtml(rest))}</p>`);
        }
        continue;
      }
      // Bare image URL (absolute or /uploads/ relative)
      const bareImg =
        line.match(/^(https?:\/\/\S+\.(?:png|jpe?g|gif|webp|svg))$/i) ||
        line.match(/^\/(?:uploads)\/\S+\.(?:png|jpe?g|gif|webp|svg)$/i);
      if (bareImg) {
        const url = bareImg[0];
        const proxied = toProxyUrl(url);
        out.push(`<img src="${proxied}" alt="" class="article-inline-img" loading="lazy" />`);
        continue;
      }
      // Bare YouTube URL on its own line
      const yt = line.match(/^(https?:\/\/(?:www\.)?youtube\.com\/watch\?\S+|https?:\/\/youtu\.be\/\S+|https?:\/\/(?:www\.)?youtube\.com\/shorts\/\S+)/i);
      if (yt) {
        const embed = toYouTubeEmbed(yt[0]);
        if (embed) {
          out.push(`<div class="article-video"><iframe src="${embed}" title="YouTube video" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe></div>`);
        } else {
          out.push(`<p>${formatInline(escapeHtml(line))}</p>`);
        }
        continue;
      }
      out.push(`<p>${formatInline(escapeHtml(line))}</p>`);
    }
    return out.join('\n');
  };

  const rawContent = post.attributes.content || '';
  const looksLikeHtml = /<\s*[a-z!]/i.test(rawContent) || rawContent.includes('&lt;');
  const contentHtml = looksLikeHtml
    ? rewriteYouTubeUrlsInHtml(rewriteImageSrcs(decodeEntities(rawContent)))
    : mdToHtml(rawContent);

  return (
    <>
      <div className="breadcrumbs">
        <span>Start</span> • <Link href="/">Blog</Link> •{' '}
        <Link href={`/category/${categorySlug}`}>{categoryName}</Link> • <span>{title}</span>
      </div>
      <article className="article">
        <h2>{title}</h2>
        <div className="article-meta">
          <span>Author: Orange Flex</span>
          {date && <span>Date added: {date}</span>}
        </div>
        {post.attributes.cover?.data && (
          <Image
            className="article-cover"
            src={post.attributes.cover.data.attributes.url}
            alt={title}
            width={1200}
            height={700}
          />
        )}
        <div className="article-content" dangerouslySetInnerHTML={{ __html: contentHtml }} />
        {post.attributes.tags?.data?.length ? (
          <div className="tags">
            {post.attributes.tags.data.map((t: any) => (
              <span key={t.id} className="tag">{t.attributes.name}</span>
            ))}
          </div>
        ) : null}
      </article>
      {similar?.length ? (
        <section className="section section-similar">
          <div className="section-head">
            <h3 className="section-title">More similar blogs</h3>
          </div>
          <div className="cards">
            {similar
              .filter((s: any) => s?.attributes?.slug !== params.slug)
              .map((p: any) => (
                <PostCard key={p.id} post={p} />
              ))}
          </div>
        </section>
      ) : null}
    </>
  );
}