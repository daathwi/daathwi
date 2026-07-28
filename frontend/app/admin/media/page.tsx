"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  deleteMedia,
  fetchMediaLibrary,
  formatBytes,
  mediaUrl,
  uploadMedia,
  type MediaLibraryItem,
} from "@/lib/admin-api";

function isImage(filename: string) {
  return /\.(jpe?g|png|gif|webp|avif)$/i.test(filename);
}

function formatDate(ts?: number | null) {
  if (!ts) return "—";
  return new Date(ts * 1000).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function AdminMediaPage() {
  const [items, setItems] = useState<MediaLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await fetchMediaLibrary();
      setItems(data.filter((i) => isImage(i.filename)));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load media");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.filename.toLowerCase().includes(q));
  }, [items, query]);

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) {
      setError("Only image files are supported.");
      return;
    }
    setUploading(true);
    setError("");
    try {
      for (const file of list) {
        await uploadMedia(file);
      }
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(item: MediaLibraryItem) {
    if (!window.confirm(`Delete ${item.filename}? This removes the file from disk.`)) return;
    setBusy(item.filename);
    setError("");
    try {
      await deleteMedia(item.filename);
      setItems((prev) => prev.filter((i) => i.filename !== item.filename));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Delete failed");
    } finally {
      setBusy(null);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex flex-wrap items-end justify-between gap-4 border-b border-divider bg-background/80 px-margin-desktop py-8 backdrop-blur-xl">
        <div>
          <h2 className="font-headline-md text-headline-md text-primary">Media</h2>
          <p className="mt-2 max-w-xl font-body-md text-on-surface-variant">
            Upload once here. Gallery, hero, blog, and about screens pick from this library.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search filename…"
            className="admin-input min-w-[12rem]"
          />
          <input
            ref={inputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => {
              if (e.target.files) void handleFiles(e.target.files);
              e.target.value = "";
            }}
          />
          <button
            type="button"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
            className="bg-primary px-6 py-3 font-label-caps text-label-caps text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Upload"}
          </button>
        </div>
      </header>

      <div className="space-y-gutter px-margin-desktop py-stack-md">
        {error ? (
          <p className="rounded border border-red-200 bg-red-50 px-4 py-3 font-body-md text-sm text-red-700">
            {error}
          </p>
        ) : null}

        <div
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files?.length) void handleFiles(e.dataTransfer.files);
          }}
          className={`rounded-lg border border-dashed px-6 py-10 text-center transition ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-divider-strong bg-surface-container"
          }`}
        >
          <p className="font-body-md text-on-surface-variant">
            Drag and drop images here, or use Upload. Newest files appear first.
          </p>
        </div>

        {loading ? (
          <p className="font-body-md text-on-surface-variant">Loading media…</p>
        ) : filtered.length === 0 ? (
          <p className="rounded-lg border border-divider bg-surface-container px-6 py-12 text-center font-body-md text-on-surface-variant">
            {query ? "No files match your search." : "No media yet. Upload your first images."}
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((item) => (
              <article
                key={item.src}
                className="overflow-hidden rounded-lg border border-divider bg-surface-container"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mediaUrl(item.src)}
                  alt={item.filename}
                  className="aspect-square w-full object-cover"
                />
                <div className="space-y-2 p-3">
                  <p className="truncate font-body-md text-sm text-primary">{item.filename}</p>
                  <p className="font-label-caps text-[10px] text-on-surface-variant">
                    {formatBytes(item.size_bytes)} · {formatDate(item.modified_at)}
                  </p>
                  <div className="flex gap-2 pt-1">
                    <a
                      href={mediaUrl(item.src)}
                      target="_blank"
                      rel="noreferrer"
                      className="border border-divider px-3 py-1.5 font-label-caps text-[10px] text-on-surface-variant hover:text-primary"
                    >
                      Open
                    </a>
                    <button
                      type="button"
                      disabled={busy === item.filename}
                      onClick={() => void handleDelete(item)}
                      className="border border-red-200 px-3 py-1.5 font-label-caps text-[10px] text-red-600 disabled:opacity-50"
                    >
                      {busy === item.filename ? "…" : "Delete"}
                    </button>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
