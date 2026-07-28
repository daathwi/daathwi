import {
  ensureBackendReady,
  isRetryableError,
  isRetryableStatus,
} from "./backend-ready";

const API_URL =
  process.env.API_URL ?? process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:8000";

export function getApiBaseUrl() {
  return API_URL.replace(/\/$/, "");
}

export class ApiError extends Error {
  status: number;

  constructor(status: number, message: string) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

let readyLock: Promise<boolean> | null = null;

async function ensureApiAwake() {
  if (!readyLock) {
    readyLock = ensureBackendReady().finally(() => {
      // Allow a later request to re-wait if the free tier spins down again.
      setTimeout(() => {
        readyLock = null;
      }, 60_000);
    });
  }
  return readyLock;
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const method = (init?.method ?? "GET").toUpperCase();
  const canRetryBody = method === "GET" || method === "HEAD";

  await ensureApiAwake();

  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(`${getApiBaseUrl()}${path}`, {
        ...init,
        headers: {
          "Content-Type": "application/json",
          ...init?.headers,
        },
        cache: init?.cache ?? "no-store",
      });

      if (!res.ok) {
        if (canRetryBody && isRetryableStatus(res.status) && attempt < 3) {
          await sleep(2_000 * attempt);
          continue;
        }
        const detail = await res.text().catch(() => res.statusText);
        throw new ApiError(res.status, detail || `API request failed: ${path}`);
      }

      if (res.status === 204) return undefined as T;
      return (await res.json()) as T;
    } catch (error) {
      lastError = error;
      if (error instanceof ApiError) throw error;
      if (canRetryBody && isRetryableError(error) && attempt < 3) {
        await sleep(2_000 * attempt);
        continue;
      }
      throw error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error(`API request failed: ${path}`);
}

export type ApiPhoto = {
  id: string;
  src: string;
  src_mobile: string | null;
  alt: string;
  permalink: string | null;
  slide_index: number;
  slide_count: number;
  sort_order: number;
};

export type ApiGalleryItem = {
  id: string;
  src: string;
  alt: string;
  category: "Street" | "Culture" | "Craft" | "Night" | "People";
  tag: string;
  title: string;
  description: string;
  offset: "none" | "down" | "up";
  aspect_ratio: string;
  permalink: string | null;
  sort_order: number;
  series_id: string | null;
};

export type ApiGallerySeries = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  cover_src: string | null;
  sort_order: number;
  published: boolean;
  item_count: number;
};

export type ApiGallerySeriesDetail = ApiGallerySeries & {
  items: ApiGalleryItem[];
};

export type ApiFeaturedItem = {
  id: string;
  src: string;
  alt: string;
  collection: string;
  title: string;
  subtitle: string;
  offset: boolean;
  permalink: string | null;
  sort_order: number;
};

export type ApiBlogPost = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  alt: string;
  category: string;
  date_display: string;
  read_time: string;
  featured: boolean;
  aspect: "16/9" | "square" | "4/3";
  grid_offset: boolean;
  article: Record<string, unknown> | null;
  sort_order: number;
  published: boolean;
};

export type ApiSiteSettings = {
  id: string;
  site_url: string;
  domain: string;
  tagline: string;
  contact_email: string;
  instagram_url: string;
  hero_fallback_url: string;
  nav_links: { href: string; label: string }[];
  licensing: {
    headline: string;
    description: string;
    email: string;
    inquiries: { label: string; subject: string }[];
  };
  instagram_proof: {
    handle: string;
    url: string;
    headline: string;
    description: string;
  };
  about: {
    hero_title: string;
    hero_quote: string;
    mission_title: string;
    mission_paragraphs: string[];
    stats: { value: string; label: string }[];
    toolkit: { title: string; items: string[] }[];
    profile_image: string;
    profile_alt: string;
    moodboard: { src: string; alt: string; className: string }[];
  };
  contact: {
    hero_title: string;
    hero_title_italic: string;
    hero_description_suffix: string;
    location: {
      city: string;
      country: string;
      detail: string;
      map_image: string;
      map_alt: string;
    };
    inquiry_options: { value: string; label: string }[];
    guidelines: { step: string; text: string }[];
    service_tags: string[];
  };
};

export type ApiContactInquiryPayload = {
  name: string;
  email: string;
  service: string;
  message: string;
};

export function fetchPhotos() {
  return apiFetch<ApiPhoto[]>("/api/v1/photos");
}

export function fetchGalleryItems() {
  return apiFetch<ApiGalleryItem[]>("/api/v1/gallery-items");
}

export function fetchGallerySeries() {
  return apiFetch<ApiGallerySeries[]>("/api/v1/gallery-series");
}

export function fetchGallerySeriesBySlug(slug: string) {
  return apiFetch<ApiGallerySeriesDetail>(`/api/v1/gallery-series/${slug}`);
}

export function fetchFeaturedItems() {
  return apiFetch<ApiFeaturedItem[]>("/api/v1/featured-items");
}

export function fetchBlogPosts() {
  return apiFetch<ApiBlogPost[]>("/api/v1/blog-posts");
}

export function fetchBlogPost(slug: string) {
  return apiFetch<ApiBlogPost>(`/api/v1/blog-posts/${slug}`);
}

export function fetchSiteSettings() {
  return apiFetch<ApiSiteSettings>("/api/v1/site");
}

export function submitContactInquiry(payload: ApiContactInquiryPayload) {
  return apiFetch<{ id: string }>("/api/v1/contact-inquiries", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function resolveMediaUrl(src: string) {
  const trimmed = src?.trim() ?? "";
  if (!trimmed) return "";
  if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) return trimmed;
  if (trimmed.startsWith("/uploads/")) return `${getApiBaseUrl()}${trimmed}`;
  if (/^[\w-]+\.(jpe?g|png|webp|gif)$/i.test(trimmed)) {
    return `${getApiBaseUrl()}/uploads/${trimmed}`;
  }
  return trimmed;
}
