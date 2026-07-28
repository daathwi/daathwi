"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";
import type { ApiGalleryItem, ApiGallerySeriesDetail } from "../../../../../lib/api";
import {
  deleteSeries,
  fetchGalleryAdmin,
  fetchSeriesDetailAdmin,
  mediaUrl,
  setSeriesItems,
  updateSeries,
} from "../../../../../lib/admin-api";
import { hasMediaSrc } from "../../../../../lib/media";
import { useAdminToast } from "../../../components/AdminToast";

export default function AdminSeriesEditPage() {
  const params = useParams<{ slug: string }>();
  const slug = params.slug;
  const router = useRouter();
  const { showToast } = useAdminToast();

  const [series, setSeries] = useState<ApiGallerySeriesDetail | null>(null);
  const [allItems, setAllItems] = useState<ApiGalleryItem[]>([]);
  const [selected, setSelected] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [published, setPublished] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [detail, gallery] = await Promise.all([
        fetchSeriesDetailAdmin(slug),
        fetchGalleryAdmin(),
      ]);
      setSeries(detail);
      setAllItems(gallery);
      setTitle(detail.title);
      setSubtitle(detail.subtitle || "");
      setDescription(detail.description || "");
      setPublished(detail.published);
      setSelected(detail.items.map((item) => item.id));
    } catch {
      showToast("Failed to load series", "error");
    } finally {
      setLoading(false);
    }
  }, [slug, showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const selectedSet = useMemo(() => new Set(selected), [selected]);

  function toggleItem(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id],
    );
  }

  function moveSelected(id: string, direction: -1 | 1) {
    setSelected((prev) => {
      const index = prev.indexOf(id);
      if (index < 0) return prev;
      const next = index + direction;
      if (next < 0 || next >= prev.length) return prev;
      const copy = [...prev];
      [copy[index], copy[next]] = [copy[next], copy[index]];
      return copy;
    });
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    if (!series) return;
    setSaving(true);
    try {
      await updateSeries(series.id, {
        title: title.trim(),
        subtitle: subtitle.trim(),
        description: description.trim(),
        published,
        cover_src: selected[0]
          ? allItems.find((item) => item.id === selected[0])?.src ?? series.cover_src
          : series.cover_src,
      });
      await setSeriesItems(series.id, selected);
      showToast("Series saved");
      await load();
    } catch {
      showToast("Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!series) return;
    if (!confirm(`Delete series “${series.title}”?`)) return;
    try {
      await deleteSeries(series.id);
      showToast("Series deleted");
      router.push("/admin/series");
    } catch {
      showToast("Delete failed", "error");
    }
  }

  if (loading || !series) {
    return (
      <div className="px-margin-desktop py-stack-lg">
        <p className="font-body-md text-on-surface-variant">Loading…</p>
      </div>
    );
  }

  const orderedSelected = selected
    .map((id) => allItems.find((item) => item.id === id))
    .filter(Boolean) as ApiGalleryItem[];

  return (
    <>
      <header className="border-b border-divider px-margin-desktop py-8">
        <nav className="mb-3 flex items-center gap-2 text-on-surface-variant">
          <Link href="/admin/series" className="font-label-caps text-label-caps hover:text-primary">
            Series
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="font-label-caps text-label-caps text-primary">{series.title}</span>
        </nav>
        <h2 className="font-headline-md text-headline-md text-primary">Edit series</h2>
        <p className="mt-2 font-body-md text-on-surface-variant">
          Group photos into this narrative. Order here is the public essay order.
        </p>
      </header>

      <form onSubmit={handleSave} className="px-margin-desktop py-stack-lg">
        <div className="grid max-w-container-max grid-cols-1 gap-10 lg:grid-cols-12">
          <div className="space-y-6 lg:col-span-5">
            <label className="block space-y-2">
              <span className="font-label-caps text-label-caps text-on-surface-variant">
                Title
              </span>
              <input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="admin-input"
                required
              />
            </label>
            <label className="block space-y-2">
              <span className="font-label-caps text-label-caps text-on-surface-variant">
                Subtitle
              </span>
              <input
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="admin-input"
              />
            </label>
            <label className="block space-y-2">
              <span className="font-label-caps text-label-caps text-on-surface-variant">
                Description
              </span>
              <textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="admin-input resize-none"
              />
            </label>
            <label className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="h-4 w-4"
              />
              <span className="font-label-caps text-label-caps text-on-surface-variant">
                Published on gallery
              </span>
            </label>

            <div className="flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded bg-primary px-8 py-3 font-label-caps text-label-caps text-on-primary disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save series"}
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="border border-divider px-6 py-3 font-label-caps text-label-caps text-on-surface-variant hover:border-error hover:text-error"
              >
                Delete
              </button>
            </div>

            {orderedSelected.length > 0 && (
              <div className="space-y-3 border border-divider p-4">
                <p className="font-label-caps text-label-caps text-on-surface-variant">
                  Essay order ({orderedSelected.length})
                </p>
                {orderedSelected.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <span className="w-6 font-label-caps text-[10px] text-on-surface-variant">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span className="min-w-0 flex-1 truncate font-body-md text-sm">
                      {item.title}
                    </span>
                    <button
                      type="button"
                      onClick={() => moveSelected(item.id, -1)}
                      className="text-on-surface-variant hover:text-primary"
                      aria-label="Move up"
                    >
                      <span className="material-symbols-outlined text-[18px]">arrow_upward</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => moveSelected(item.id, 1)}
                      className="text-on-surface-variant hover:text-primary"
                      aria-label="Move down"
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        arrow_downward
                      </span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-7">
            <div className="mb-4 flex items-end justify-between gap-4">
              <div>
                <h3 className="font-headline-sm text-headline-sm text-primary">
                  Assign photos
                </h3>
                <p className="mt-1 font-body-md text-sm text-on-surface-variant">
                  Select gallery photos for this series. First selected becomes the cover.
                </p>
              </div>
              <Link
                href="/admin/gallery/new"
                className="font-label-caps text-label-caps text-primary underline underline-offset-4"
              >
                Upload new
              </Link>
            </div>

            {allItems.length === 0 ? (
              <p className="font-body-md text-on-surface-variant">
                No gallery photos yet. Upload some first.
              </p>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {allItems.map((item) => {
                  const isOn = selectedSet.has(item.id);
                  const elsewhere =
                    item.series_id && item.series_id !== series.id ? item.series_id : null;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => toggleItem(item.id)}
                      className={`group relative overflow-hidden rounded border text-left transition-colors ${
                        isOn
                          ? "border-primary ring-1 ring-primary"
                          : "border-divider hover:border-divider-emphasis"
                      }`}
                    >
                      <div className="aspect-[4/5] bg-surface-container">
                        {hasMediaSrc(item.src) ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={mediaUrl(item.src)}
                            alt={item.alt}
                            className="h-full w-full object-cover"
                          />
                        ) : null}
                      </div>
                      <div className="space-y-1 p-3">
                        <p className="truncate font-body-md text-sm text-primary">
                          {item.title}
                        </p>
                        {elsewhere && (
                          <p className="font-label-caps text-[9px] text-on-surface-variant">
                            In another series
                          </p>
                        )}
                      </div>
                      <span
                        className={`absolute right-2 top-2 flex h-6 w-6 items-center justify-center rounded-full text-[14px] ${
                          isOn
                            ? "bg-primary text-on-primary"
                            : "bg-background/80 text-on-surface-variant"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {isOn ? "check" : "add"}
                        </span>
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </form>
    </>
  );
}
