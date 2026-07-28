"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { ApiGallerySeries } from "../../../lib/api";
import { deleteSeries, fetchSeriesAdmin, mediaUrl } from "../../../lib/admin-api";
import { hasMediaSrc } from "../../../lib/media";
import { useAdminToast } from "../components/AdminToast";

export default function AdminSeriesPage() {
  const { showToast } = useAdminToast();
  const [series, setSeries] = useState<ApiGallerySeries[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setSeries(await fetchSeriesAdmin());
    } catch {
      showToast("Failed to load series", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string, title: string) {
    if (!confirm(`Delete series “${title}”? Photos stay in the gallery, ungrouped.`)) {
      return;
    }
    try {
      await deleteSeries(id);
      showToast("Series deleted");
      await load();
    } catch {
      showToast("Delete failed", "error");
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex flex-col gap-4 border-b border-divider bg-background/80 px-margin-desktop py-8 backdrop-blur-xl sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-headline-md text-headline-md text-primary">Photo Series</h2>
          <p className="mt-2 max-w-xl font-body-md text-on-surface-variant">
            Visual narratives for the gallery — essays like Old Delhi streets, monuments at
            night, or craft &amp; culture.
          </p>
        </div>
        <Link
          href="/admin/series/new"
          className="flex items-center gap-2 rounded bg-primary px-6 py-3 font-label-caps text-label-caps text-on-primary transition-opacity hover:opacity-90"
        >
          <span className="material-symbols-outlined text-sm">add</span>
          New Series
        </Link>
      </header>

      <section className="px-margin-desktop py-stack-lg">
        {loading ? (
          <p className="font-body-md text-on-surface-variant">Loading…</p>
        ) : series.length === 0 ? (
          <div className="border border-divider bg-surface-container-low px-8 py-stack-lg text-center">
            <p className="font-body-md text-on-surface-variant">
              No series yet.{" "}
              <Link href="/admin/series/new" className="text-primary hover:underline">
                Create your first essay
              </Link>
              .
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {series.map((entry) => (
              <article
                key={entry.id}
                className="flex flex-col gap-4 border border-divider bg-surface-container-low p-6 sm:flex-row sm:items-center"
              >
                <div className="h-24 w-full shrink-0 overflow-hidden rounded border border-divider bg-surface-container sm:h-20 sm:w-28">
                  {hasMediaSrc(entry.cover_src) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={mediaUrl(entry.cover_src!)}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined">collections</span>
                    </div>
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="font-headline-sm text-headline-sm text-primary">
                      {entry.title}
                    </h3>
                    {!entry.published && (
                      <span className="border border-divider px-2 py-0.5 font-label-caps text-[9px] text-on-surface-variant">
                        Draft
                      </span>
                    )}
                  </div>
                  {entry.subtitle && (
                    <p className="mt-1 font-body-md text-sm text-on-surface-variant">
                      {entry.subtitle}
                    </p>
                  )}
                  <p className="mt-2 font-label-caps text-[10px] text-on-surface-variant">
                    {entry.item_count} photo{entry.item_count === 1 ? "" : "s"} · /{entry.slug}
                  </p>
                </div>
                <div className="flex shrink-0 gap-3">
                  <Link
                    href={`/admin/series/${entry.slug}/edit`}
                    className="border border-divider-strong px-4 py-2 font-label-caps text-label-caps text-primary hover:border-primary"
                  >
                    Edit
                  </Link>
                  <button
                    type="button"
                    onClick={() => handleDelete(entry.id, entry.title)}
                    className="border border-divider px-4 py-2 font-label-caps text-label-caps text-on-surface-variant hover:border-error hover:text-error"
                  >
                    Delete
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </>
  );
}
