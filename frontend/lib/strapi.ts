const STRAPI_URL = process.env.NEXT_PUBLIC_STRAPI_URL || 'http://localhost:1337';

type StrapiResponse<T> = {
  data: T;
  meta: any;
};

export async function getPosts() {
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/posts?filters[publishedAt][$notNull]=true&populate[cover]=true&populate[category]=true&populate[tags]=true`,
      { next: { revalidate: 60 }, headers: { 'Strapi-Response-Format': 'v4' } }
    );
    if (!res.ok) return [];
    const json: StrapiResponse<any[]> = await res.json();
    // Normalize image URL to absolute if needed
    return (json.data || []).map((p) => normalizeMedia(p));
  } catch (e) {
    return [];
  }
}

export async function getPostBySlug(slug: string) {
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/posts?filters[slug][$eq]=${encodeURIComponent(slug)}&populate[cover]=true&populate[category]=true&populate[tags]=true`,
      { next: { revalidate: 60 }, headers: { 'Strapi-Response-Format': 'v4' } }
    );
    if (!res.ok) return null;
    const json: StrapiResponse<any[]> = await res.json();
    const item = (json.data || [])[0];
    return item ? normalizeMedia(item) : null;
  } catch (e) {
    return null;
  }
}

function normalizeMedia(entity: any) {
  const cdn = STRAPI_URL;
  const cover = entity?.attributes?.cover?.data?.attributes;
  if (cover && cover.url && cover.url.startsWith('/')) {
    const abs = cdn + cover.url;
    cover.url = `/api/proxy-image?url=${encodeURIComponent(abs)}`;
  }
  if (cover && cover.url && cover.url.startsWith('http')) {
    cover.url = `/api/proxy-image?url=${encodeURIComponent(cover.url)}`;
  }
  return entity;
}

export async function getCategories(limit = 6) {
  try {
    const res = await fetch(
      `${STRAPI_URL}/api/categories?sort=name:asc&pagination[pageSize]=${limit}`,
      { next: { revalidate: 60 }, headers: { 'Strapi-Response-Format': 'v4' } }
    );
    if (!res.ok) return [];
    const json: StrapiResponse<any[]> = await res.json();
    return json.data || [];
  } catch {
    return [];
  }
}

export async function getPostsByCategorySlug(slug: string, limit = 3) {
  try {
    // Resolve category by slug to its documentId (v5-friendly deep filter)
    const catRes = await fetch(
      `${STRAPI_URL}/api/categories?filters[slug][$eq]=${encodeURIComponent(slug)}&fields[0]=documentId&fields[1]=slug&fields[2]=name`,
      { next: { revalidate: 60 }, headers: { 'Strapi-Response-Format': 'v4' } }
    );
    if (!catRes.ok) return [];
    const catJson: StrapiResponse<any[]> = await catRes.json();
    const cat = (catJson.data || [])[0];
    const catId = cat?.id;
    if (!catId) return [];

    const postsUrl = `${STRAPI_URL}/api/posts?filters[category][id][$eq]=${encodeURIComponent(
      catId
    )}&populate[cover]=true&populate[category]=true&populate[tags]=true&sort=publishedAt:desc&pagination[pageSize]=${limit}`;
    const res = await fetch(postsUrl, {
      next: { revalidate: 60 },
      headers: { 'Strapi-Response-Format': 'v4' },
    });
    if (!res.ok) return [];
    const json: StrapiResponse<any[]> = await res.json();
    return (json.data || []).map(normalizeMedia);
  } catch {
    return [];
  }
}

export async function searchPosts(q: string) {
  if (!q) return [];
  try {
    const url = `${STRAPI_URL}/api/posts?filters[$or][0][title][$containsi]=${encodeURIComponent(
      q
    )}&filters[$or][1][content][$containsi]=${encodeURIComponent(
      q
    )}&populate[cover]=true&populate[category]=true&populate[tags]=true&sort=publishedAt:desc`;
    const res = await fetch(url, {
      next: { revalidate: 30 },
      headers: { 'Strapi-Response-Format': 'v4' },
    });
    if (!res.ok) return [];
    const json: StrapiResponse<any[]> = await res.json();
    return (json.data || []).map(normalizeMedia);
  } catch {
    return [];
  }
}