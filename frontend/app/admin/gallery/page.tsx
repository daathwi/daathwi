"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ApiGalleryItem, ApiGallerySeries } from "../../../lib/api";
import {
  deleteGalleryItem,
  fetchGalleryAdmin,
  fetchSeriesAdmin,
  mediaUrl,
} from "../../../lib/admin-api";
import { aspectRatioLabel } from "../../../lib/aspect-ratios";
import { hasMediaSrc } from "../../../lib/media";
import { useAdminToast } from "../components/AdminToast";

export default function AdminGalleryPage() {
  const { showToast } = useAdminToast();
  const [items, setItems] = useState<ApiGalleryItem[]>([]);
  const [series, setSeries] = useState<ApiGallerySeries[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [gallery, essays] = await Promise.all([
        fetchGalleryAdmin(),
        fetchSeriesAdmin(),
      ]);
      setItems(gallery);
      setSeries(essays);
    } catch {
      showToast("Failed to load gallery", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this gallery photo?")) return;
    try {
      await deleteGalleryItem(id);
      showToast("Gallery photo deleted");
      await load();
    } catch {
      showToast("Delete failed", "error");
    }
  }

  const seriesById = useMemo(() => {
    const map = new Map(series.map((entry) => [entry.id, entry]));
    return map;
  }, [series]);

  const groups = useMemo(() => {
    const ordered = series.map((entry) => ({
      id: entry.id,
      title: entry.title,
      items: items.filter((item) => item.series_id === entry.id),
    }));
    const ungrouped = items.filter((item) => !item.series_id);
    return { ordered, ungrouped };
  }, [items, series]);

  return (
    <>
      <header className="sticky top-0 z-40 flex flex-col gap-4 border-b border-divider bg-background/80 px-margin-desktop py-8 backdrop-blur-xl sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-headline-md text-headline-md text-primary">Gallery</h2>
          <p className="mt-2 max-w-xl font-body-md text-on-surface-variant">
            All portfolio photos. Group them into{" "}
            <Link href="/admin/series" className="text-primary underline underline-offset-4">
              photo series
            </Link>{" "}
            for the public gallery essays.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/series/new"
            className="flex items-center gap-2 rounded border border-divider-emphasis px-6 py-3 font-label-caps text-label-caps text-primary transition-opacity hover:bg-overlay-subtle"
          >
            New Series
          </Link>
          <Link
            href="/admin/gallery/new"
            className="flex items-center gap-2 rounded bg-primary px-6 py-3 font-label-caps text-label-caps text-on-primary transition-opacity hover:opacity-90"
          >
            <span className="material-symbols-outlined text-sm">add</span>
            Add Photo
          </Link>
        </div>
      </header>

      <section className="space-y-stack-lg px-margin-desktop py-stack-lg">
        {loading ? (
          <p className="font-body-md text-on-surface-variant">Loading…</p>
        ) : items.length === 0 ? (
          <div className="border border-divider bg-surface-container-low px-8 py-stack-lg text-center">
            <p className="font-body-md text-on-surface-variant">
              No gallery photos yet.{" "}
              <Link href="/admin/gallery/new" className="text-primary hover:underline">
                Upload one
              </Link>
              .
            </p>
          </div>
        ) : (
          <>
            {groups.ordered.map((group) =>
              group.items.length === 0 ? null : (
                <div key={group.id}>
                  <div className="mb-4 flex items-end justify-between gap-4">
                    <h3 className="font-headline-sm text-headline-sm text-primary">
                      {group.title}
                    </h3>
                    <Link
                      href={`/admin/series/${seriesById.get(group.id)?.slug}/edit`}
                      className="font-label-caps text-[11px] text-on-surface-variant hover:text-primary"
                    >
                      Edit series →
                    </Link>
                  </div>
                  <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {group.items.map((item) => (
                      <GalleryCard
                        key={item.id}
                        item={item}
                        seriesTitle={group.title}
                        onDelete={() => handleDelete(item.id)}
                      />
                    ))}
                  </div>
                </div>
              ),
            )}

            {groups.ungrouped.length > 0 && (
              <div>
                <h3 className="mb-4 font-headline-sm text-headline-sm text-primary">
                  Ungrouped
                </h3>
                <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {groups.ungrouped.map((item) => (
                    <GalleryCard
                      key={item.id}
                      item={item}
                      onDelete={() => handleDelete(item.id)}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </section>
    </>
  );
}

function GalleryCard({
  item,
  seriesTitle,
  onDelete,
}: {
  item: ApiGalleryItem;
  seriesTitle?: string;
  onDelete: () => void;
}) {
  const src = mediaUrl(item.src);

  return (
    <div className="group flex flex-col gap-3">
      <div
        className="relative w-full overflow-hidden rounded border border-divider bg-surface-container-low"
        style={{ aspectRatio: item.aspect_ratio ?? "4/5" }}
      >
        {hasMediaSrc(src) ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={src} alt={item.alt} className="h-full w-full object-cover" />
        ) : (
          <div className="h-full w-full bg-surface-container" aria-hidden />
        )}
        <span className="absolute left-2 top-2 bg-background/85 px-2 py-0.5 font-label-caps text-[9px] text-on-surface-variant backdrop-blur-sm">
          {item.category}
        </span>
        <span className="absolute right-2 top-2 bg-background/85 px-2 py-0.5 font-label-caps text-[9px] text-on-surface-variant backdrop-blur-sm">
          {aspectRatioLabel(item.aspect_ratio ?? "4/5")}
        </span>
      </div>
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <h3 className="truncate font-body-md font-medium text-primary">{item.title}</h3>
          <p className="mt-1 font-label-caps text-[10px] text-on-surface-variant">
            {seriesTitle || item.tag}
          </p>
        </div>
        <button
          type="button"
          onClick={onDelete}
          className="shrink-0 rounded-full border border-divider-strong p-1.5 text-on-surface-variant transition-colors hover:border-error hover:text-error"
          aria-label="Delete gallery photo"
        >
          <span className="material-symbols-outlined text-[18px]">delete</span>
        </button>
      </div>
    </div>
  );
}
