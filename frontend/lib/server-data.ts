import { coalesceMediaSrc, hasMediaSrc } from "./media";
import { resolveBodyHtmlMedia } from "./rich-text-editor";
import type { BlogArticle } from "./types";
import type {
  AboutContent,
  BentoPhoto,
  BlogPost,
  ContactContent,
  FeaturedItem,
  GalleryItem,
  GallerySeries,
  InstagramProofContent,
  LicensingContent,
  NavLink,
  SiteSettings,
} from "./types";
import {
  fetchBlogPost,
  fetchBlogPosts,
  fetchFeaturedItems,
  fetchGalleryItems,
  fetchGallerySeries,
  fetchPhotos,
  fetchSiteSettings,
  resolveMediaUrl,
  type ApiBlogPost,
  type ApiGallerySeries,
  type ApiSiteSettings,
} from "./api";

function mapPhoto(row: {
  id: string;
  src: string;
  src_mobile: string | null;
  alt: string;
  permalink: string | null;
  slide_index: number;
  slide_count: number;
}): BentoPhoto {
  const src = resolveMediaUrl(coalesceMediaSrc(row.src));
  const srcMobile = resolveMediaUrl(coalesceMediaSrc(row.src_mobile, row.src));
  return {
    id: row.id,
    src,
    srcMobile: hasMediaSrc(srcMobile) ? srcMobile : src,
    alt: row.alt,
    permalink: row.permalink ?? "",
    slideIndex: row.slide_index,
    slideCount: row.slide_count,
  };
}

function mapGalleryItem(row: {
  id: string;
  src: string;
  alt: string;
  category: GalleryItem["category"];
  tag: string;
  title: string;
  description: string;
  aspect_ratio?: string;
  offset: GalleryItem["offset"];
  permalink: string | null;
  series_id?: string | null;
}): GalleryItem {
  return {
    id: row.id,
    src: resolveMediaUrl(row.src),
    alt: row.alt,
    category: row.category,
    tag: row.tag,
    title: row.title,
    description: row.description,
    aspectRatio: row.aspect_ratio ?? "4/5",
    offset: row.offset,
    permalink: row.permalink ?? undefined,
    seriesId: row.series_id ?? null,
  };
}

function mapFeaturedItem(row: {
  id: string;
  src: string;
  alt: string;
  collection: string;
  title: string;
  subtitle: string;
  offset: boolean;
  permalink: string | null;
}): FeaturedItem {
  return {
    id: row.id,
    src: resolveMediaUrl(row.src),
    alt: row.alt,
    collection: row.collection,
    title: row.title,
    subtitle: row.subtitle,
    offset: row.offset,
    permalink: row.permalink ?? undefined,
  };
}

export function mapBlogPost(row: ApiBlogPost): BlogPost {
  return {
    id: row.id,
    slug: row.slug,
    date: row.date_display,
    category: row.category,
    title: row.title,
    excerpt: row.excerpt,
    image: resolveMediaUrl(row.image),
    alt: row.alt,
    featured: row.featured,
    aspect: row.aspect,
    gridOffset: row.grid_offset,
  };
}

function mapSiteSettings(row: ApiSiteSettings): SiteSettings {
  return {
    siteUrl: row.site_url,
    domain: row.domain,
    tagline: row.tagline,
    contactEmail: row.contact_email,
    instagramUrl: row.instagram_url,
    heroFallbackUrl: resolveMediaUrl(coalesceMediaSrc(row.hero_fallback_url)),
    navLinks: row.nav_links,
    licensing: row.licensing,
    instagramProof: row.instagram_proof,
    about: {
      heroTitle: row.about.hero_title,
      heroQuote: row.about.hero_quote,
      missionTitle: row.about.mission_title,
      missionParagraphs: row.about.mission_paragraphs,
      stats: row.about.stats,
      toolkit: row.about.toolkit,
      profileImage: resolveMediaUrl(row.about.profile_image),
      profileAlt: row.about.profile_alt,
      moodboard: row.about.moodboard
        .map((image: { src: string; alt: string; className?: string }) => ({
          src: resolveMediaUrl(image.src),
          alt: image.alt,
          className: image.className ?? "",
        }))
        .filter((image) => hasMediaSrc(image.src)),
    },
    contact: {
      heroTitle: row.contact.hero_title,
      heroTitleItalic: row.contact.hero_title_italic,
      heroDescriptionSuffix: row.contact.hero_description_suffix,
      location: {
        city: row.contact.location.city,
        country: row.contact.location.country,
        detail: row.contact.location.detail,
        mapImage: resolveMediaUrl(row.contact.location.map_image),
        mapAlt: row.contact.location.map_alt,
      },
      inquiryOptions: row.contact.inquiry_options,
      guidelines: row.contact.guidelines,
      serviceTags: row.contact.service_tags,
    },
  };
}

export async function getSiteSettings(): Promise<SiteSettings> {
  const row = await fetchSiteSettings();
  return mapSiteSettings(row);
}

export async function getPhotos(): Promise<BentoPhoto[]> {
  const rows = await fetchPhotos();
  return rows.map(mapPhoto).filter((photo) => hasMediaSrc(photo.src));
}

/** Public /gallery page — separate from hero carousel photos. */
export async function getGalleryItems(): Promise<GalleryItem[]> {
  const rows = await fetchGalleryItems();
  return rows.map(mapGalleryItem).filter((item) => hasMediaSrc(item.src));
}

/** Published photo essays with their photos, plus any ungrouped items. */
export async function getGallerySeriesGrouped(): Promise<{
  series: GallerySeries[];
  ungrouped: GalleryItem[];
}> {
  const [seriesRows, items] = await Promise.all([
    fetchGallerySeries(),
    getGalleryItems(),
  ]);

  const published = seriesRows
    .filter((row) => row.published)
    .sort((a, b) => a.sort_order - b.sort_order || a.title.localeCompare(b.title));

  const series = published
    .map((row) =>
      mapGallerySeries(
        row,
        items.filter((item) => item.seriesId === row.id),
      ),
    )
    .filter((entry) => entry.items.length > 0);

  const ungrouped = items.filter((item) => !item.seriesId);

  return { series, ungrouped };
}

function mapGallerySeries(row: ApiGallerySeries, items: GalleryItem[]): GallerySeries {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    coverSrc: row.cover_src ? resolveMediaUrl(row.cover_src) : null,
    sortOrder: row.sort_order,
    published: row.published,
    itemCount: row.item_count,
    items,
  };
}

export async function getGallerySeriesBySlug(
  slug: string,
): Promise<GallerySeries | null> {
  const { series } = await getGallerySeriesGrouped();
  return series.find((entry) => entry.slug === slug) ?? null;
}

/** Newest published series — by most recent photo in each essay, then sort_order. */
export async function getLatestGallerySeries(limit = 3): Promise<GallerySeries[]> {
  const { series } = await getGallerySeriesGrouped();
  return [...series]
    .sort((a, b) => {
      const aKey = Math.max(0, ...a.items.map((item) => galleryRecencyKey(item.id)));
      const bKey = Math.max(0, ...b.items.map((item) => galleryRecencyKey(item.id)));
      if (bKey !== aKey) return bKey - aKey;
      return a.sortOrder - b.sortOrder;
    })
    .slice(0, Math.max(0, limit));
}

/** Most recently added gallery items — max `limit`, newest first. */
export async function getLatestGalleryItems(limit = 3): Promise<GalleryItem[]> {
  const items = await getGalleryItems();
  return [...items]
    .sort((a, b) => galleryRecencyKey(b.id) - galleryRecencyKey(a.id))
    .slice(0, Math.max(0, limit));
}

/** IDs are `{slug}-{Date.now()}` from admin upload — use the trailing timestamp. */
function galleryRecencyKey(id: string): number {
  const match = id.match(/(\d{10,})$/);
  return match ? Number(match[1]) : 0;
}

export async function getFeaturedItems(): Promise<FeaturedItem[]> {
  const rows = await fetchFeaturedItems();
  return rows.map(mapFeaturedItem).filter((item) => hasMediaSrc(item.src));
}

export async function getBlogPosts(): Promise<BlogPost[]> {
  const rows = await fetchBlogPosts();
  return rows
    .filter((row) => row.published)
    .map(mapBlogPost)
    .filter((post) => hasMediaSrc(post.image));
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | undefined> {
  try {
    const row = await fetchBlogPost(slug);
    if (!row.published) return undefined;
    return mapBlogPost(row);
  } catch {
    return undefined;
  }
}

function resolveBlogArticle(article: BlogArticle): BlogArticle {
  const bodyHtml = article.bodyHtml
    ? resolveBodyHtmlMedia(article.bodyHtml)
    : undefined;

  return {
    ...article,
    heroImage: resolveMediaUrl(article.heroImage),
    bodyHtml,
    figure: article.figure && hasMediaSrc(article.figure.src)
      ? { ...article.figure, src: resolveMediaUrl(article.figure.src) }
      : undefined,
    gallery: article.gallery
      .map((image) => ({ ...image, src: resolveMediaUrl(image.src) }))
      .filter((image) => hasMediaSrc(image.src)),
    author: {
      ...article.author,
      avatar: resolveMediaUrl(article.author.avatar),
    },
  };
}

export async function getBlogArticleBySlug(slug: string): Promise<BlogArticle | undefined> {
  try {
    const row = await fetchBlogPost(slug);
    if (!row.published || !row.article) return undefined;
    return resolveBlogArticle(row.article as unknown as BlogArticle);
  } catch {
    return undefined;
  }
}

export async function getAllBlogSlugs(): Promise<string[]> {
  const posts = await getBlogPosts();
  return posts.map((p) => p.slug);
}

export async function getHeroImages(): Promise<
  { src: string; srcMobile: string; alt: string }[]
> {
  const [photos, site] = await Promise.all([getPhotos(), getSiteSettings()]);
  const fromPhotos = photos
    .filter((p) => hasMediaSrc(p.src))
    .map((p) => ({
      src: p.src,
      srcMobile: hasMediaSrc(p.srcMobile) ? p.srcMobile : p.src,
      alt: p.alt,
    }));
  if (fromPhotos.length > 0) return fromPhotos;
  if (hasMediaSrc(site.heroFallbackUrl)) {
    return [{ src: site.heroFallbackUrl, srcMobile: site.heroFallbackUrl, alt: "Hero photograph" }];
  }
  return [];
}

export async function getHeroImage(): Promise<string | null> {
  const images = await getHeroImages();
  return images[0]?.src ?? null;
}

export async function getBlogFeatured(): Promise<BlogPost | null> {
  const posts = await getBlogPosts();
  return posts.find((p) => p.featured) ?? null;
}

export async function getBlogGridPosts(): Promise<BlogPost[]> {
  const posts = await getBlogPosts();
  return posts.filter((p) => !p.featured);
}

export type {
  AboutContent,
  ContactContent,
  InstagramProofContent,
  LicensingContent,
  NavLink,
  SiteSettings,
};
