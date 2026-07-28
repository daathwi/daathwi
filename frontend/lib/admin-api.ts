import {
  ApiBlogPost,
  ApiGalleryItem,
  ApiGallerySeries,
  ApiGallerySeriesDetail,
  ApiPhoto,
  ApiSiteSettings,
  ApiError,
  getApiBaseUrl,
  resolveMediaUrl,
} from "./api";
import {
  ensureBackendReady,
  isRetryableError,
  isRetryableStatus,
} from "./backend-ready";

export type AdminOverview = {
  counts: {
    photos: number;
    gallery: number;
    featured: number;
    assets: number;
    blog_posts: number;
    inquiries: number;
  };
  storage_bytes: number;
  storage_limit_bytes: number;
  latest_photo_src: string | null;
  latest_photo_alt: string | null;
  recent_inquiries: {
    id: string;
    name: string;
    email: string;
    service: string;
    message: string;
    created_at: string;
  }[];
  latest_blog_title: string | null;
  latest_blog_slug: string | null;
};

let readyLock: Promise<boolean> | null = null;

async function ensureApiAwake() {
  if (!readyLock) {
    readyLock = ensureBackendReady().finally(() => {
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

async function adminFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const method = (init?.method ?? "GET").toUpperCase();
  const canRetryBody = method === "GET" || method === "HEAD";
  const headers = new Headers(init?.headers);
  if (!(init?.body instanceof FormData) && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  await ensureApiAwake();

  let lastError: unknown;

  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const res = await fetch(`${getApiBaseUrl()}${path}`, {
        ...init,
        headers,
        cache: "no-store",
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

export function fetchAdminOverview() {
  return adminFetch<AdminOverview>("/api/v1/admin/overview");
}

export type MediaLibraryItem = {
  filename: string;
  src: string;
  size_bytes: number;
  modified_at?: number | null;
};

export function fetchMediaLibrary() {
  return adminFetch<MediaLibraryItem[]>("/api/v1/uploads");
}

export function uploadMedia(file: File) {
  return uploadFile(file);
}

export function deleteMedia(filename: string) {
  return adminFetch<{ message: string }>(
    `/api/v1/uploads/${encodeURIComponent(filename)}`,
    { method: "DELETE" },
  );
}

export async function mediaSrcToFile(src: string, filename?: string) {
  const url = resolveMediaUrl(src);
  const res = await fetch(url);
  if (!res.ok) throw new Error("Could not load media file");
  const blob = await res.blob();
  const name = filename || src.split("/").pop() || "image.jpg";
  return new File([blob], name, { type: blob.type || "image/jpeg" });
}

export function uploadFile(file: File) {
  const body = new FormData();
  body.append("file", file);
  return adminFetch<{ src: string; filename: string }>("/api/v1/uploads", {
    method: "POST",
    body,
  });
}

export function createPhotoFromSrc(payload: {
  id: string;
  src: string;
  src_mobile?: string | null;
  alt: string;
  meta?: Record<string, unknown> | null;
  sort_order?: number;
}) {
  return adminFetch<ApiPhoto>("/api/v1/photos", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      src_mobile: payload.src_mobile ?? null,
      meta: payload.meta ?? null,
      sort_order: payload.sort_order ?? 0,
    }),
  });
}

export function createGalleryItemFromSrc(payload: {
  id: string;
  src: string;
  alt: string;
  category: ApiGalleryItem["category"];
  tag: string;
  title: string;
  description: string;
  aspect_ratio: string;
  series_id?: string | null;
  sort_order?: number;
}) {
  return adminFetch<ApiGalleryItem>("/api/v1/gallery-items", {
    method: "POST",
    body: JSON.stringify({
      ...payload,
      series_id: payload.series_id ?? null,
      sort_order: payload.sort_order ?? 0,
    }),
  });
}

export function uploadPhoto(
  fileWeb: File,
  fileMobile: File,
  photoId: string,
  alt: string,
  meta?: Record<string, unknown>,
) {
  const body = new FormData();
  body.append("file", fileWeb);
  body.append("file_mobile", fileMobile);
  body.append("photo_id", photoId);
  body.append("alt", alt);
  if (meta) body.append("meta", JSON.stringify(meta));
  return adminFetch<ApiPhoto>("/api/v1/photos/upload", { method: "POST", body });
}

export function deletePhoto(photoId: string) {
  return adminFetch<{ message: string }>(`/api/v1/photos/${photoId}`, {
    method: "DELETE",
  });
}

export function deleteBlogPost(slug: string) {
  return adminFetch<{ message: string }>(`/api/v1/blog-posts/${slug}`, {
    method: "DELETE",
  });
}

export function fetchPhotosAdmin() {
  return adminFetch<ApiPhoto[]>("/api/v1/photos");
}

export function fetchGalleryAdmin() {
  return adminFetch<ApiGalleryItem[]>("/api/v1/gallery-items");
}

export function fetchSeriesAdmin() {
  return adminFetch<ApiGallerySeries[]>("/api/v1/gallery-series");
}

export function fetchSeriesDetailAdmin(slug: string) {
  return adminFetch<ApiGallerySeriesDetail>(`/api/v1/gallery-series/${slug}`);
}

export type SeriesPayload = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  description?: string;
  cover_src?: string | null;
  sort_order?: number;
  published?: boolean;
};

export function createSeries(payload: SeriesPayload) {
  return adminFetch<ApiGallerySeries>("/api/v1/gallery-series", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateSeries(seriesId: string, payload: Partial<SeriesPayload>) {
  return adminFetch<ApiGallerySeries>(`/api/v1/gallery-series/${seriesId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function setSeriesItems(seriesId: string, itemIds: string[]) {
  return adminFetch<ApiGallerySeriesDetail>(`/api/v1/gallery-series/${seriesId}/items`, {
    method: "PUT",
    body: JSON.stringify({ item_ids: itemIds }),
  });
}

export function deleteSeries(seriesId: string) {
  return adminFetch<{ message: string }>(`/api/v1/gallery-series/${seriesId}`, {
    method: "DELETE",
  });
}

export function updateGalleryItem(
  itemId: string,
  payload: Partial<{
    series_id: string | null;
    category: ApiGalleryItem["category"];
    tag: string;
    title: string;
    description: string;
    sort_order: number;
  }>,
) {
  return adminFetch<ApiGalleryItem>(`/api/v1/gallery-items/${itemId}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function uploadGalleryItem(
  file: File,
  itemId: string,
  fields: {
    alt: string;
    category: ApiGalleryItem["category"];
    tag: string;
    title: string;
    description: string;
    aspect_ratio: string;
    series_id?: string | null;
  },
) {
  const body = new FormData();
  body.append("file", file);
  body.append("item_id", itemId);
  body.append("alt", fields.alt);
  body.append("category", fields.category);
  body.append("tag", fields.tag);
  body.append("title", fields.title);
  body.append("description", fields.description);
  body.append("aspect_ratio", fields.aspect_ratio);
  if (fields.series_id) body.append("series_id", fields.series_id);
  return adminFetch<ApiGalleryItem>("/api/v1/gallery-items/upload", {
    method: "POST",
    body,
  });
}

export function deleteGalleryItem(itemId: string) {
  return adminFetch<{ message: string }>(`/api/v1/gallery-items/${itemId}`, {
    method: "DELETE",
  });
}

export function fetchBlogAdmin() {
  return adminFetch<ApiBlogPost[]>("/api/v1/blog-posts");
}

export function fetchBlogPostAdmin(slug: string) {
  return adminFetch<ApiBlogPost>(`/api/v1/blog-posts/${slug}`);
}

export type BlogPostPayload = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  alt: string;
  category: string;
  date_display: string;
  read_time?: string;
  featured?: boolean;
  aspect?: "16/9" | "square" | "4/3";
  grid_offset?: boolean;
  article?: Record<string, unknown> | null;
  sort_order?: number;
  published?: boolean;
};

export function createBlogPost(payload: BlogPostPayload) {
  return adminFetch<ApiBlogPost>("/api/v1/blog-posts", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function updateBlogPost(slug: string, payload: Partial<BlogPostPayload>) {
  return adminFetch<ApiBlogPost>(`/api/v1/blog-posts/${slug}`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function fetchSiteAdmin() {
  return adminFetch<ApiSiteSettings>("/api/v1/site");
}

export function updateSiteAdmin(payload: Partial<ApiSiteSettings>) {
  return adminFetch<ApiSiteSettings>("/api/v1/site", {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 ** 2) return `${(bytes / 1024).toFixed(1)} KB`;
  if (bytes < 1024 ** 3) return `${(bytes / 1024 ** 2).toFixed(1)} MB`;
  return `${(bytes / 1024 ** 3).toFixed(1)} GB`;
}

export function mediaUrl(src: string) {
  return resolveMediaUrl(src);
}
