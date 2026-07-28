"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  fetchMediaLibrary,
  formatBytes,
  mediaUrl,
  uploadMedia,
  type MediaLibraryItem,
} from "@/lib/admin-api";

type Props = {
  open: boolean;
  onClose: () => void;
  onSelect: (item: MediaLibraryItem) => void;
  title?: string;
  allowUpload?: boolean;
};

function isImage(filename: string) {
  return /\.(jpe?g|png|gif|webp|avif)$/i.test(filename);
}

export default function MediaPicker({
  open,
  onClose,
  onSelect,
  title = "Choose from Media",
  allowUpload = true,
}: Props) {
  const [items, setItems] = useState<MediaLibraryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
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
    if (!open) return;
    setSelected(null);
    setQuery("");
    void load();
  }, [open, load]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter((i) => i.filename.toLowerCase().includes(q));
  }, [items, query]);

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files).filter((f) => f.type.startsWith("image/"));
    if (!list.length) return;
    setUploading(true);
    setError("");
    try {
      let last: MediaLibraryItem | null = null;
      for (const file of list) {
        const uploaded = await uploadMedia(file);
        last = {
          filename: uploaded.filename,
          src: uploaded.src,
          size_bytes: file.size,
          modified_at: Date.now() / 1000,
        };
      }
      await load();
      if (last) setSelected(last.src);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  }

  if (!open) return null;

  const selectedItem = items.find((i) => i.src === selected) ?? null;

  return (
    <div
      className="fixed inset-0 z-[80] flex items-end justify-center bg-black/55 p-0 sm:items-center sm:p-6"
      onClick={onClose}
      role="presentation"
    >
      <div
        className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-t-2xl border border-divider bg-surface-container shadow-2xl sm:rounded-lg"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        <div className="flex items-center justify-between gap-3 border-b border-divider px-4 py-3 sm:px-5">
          <div>
            <p className="font-label-caps text-[10px] text-on-surface-variant">Media library</p>
            <h2 className="mt-0.5 font-headline-sm text-headline-sm text-primary">{title}</h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="border border-divider px-3 py-1.5 font-label-caps text-[10px] text-on-surface-variant hover:text-primary"
          >
            Close
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-3 border-b border-divider px-4 py-3 sm:px-5">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by filename…"
            className="admin-input min-w-[12rem] flex-1"
          />
          {allowUpload ? (
            <>
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
                className="bg-primary px-4 py-2 font-label-caps text-[10px] text-on-primary disabled:opacity-50"
              >
                {uploading ? "Uploading…" : "Upload new"}
              </button>
            </>
          ) : null}
        </div>

        {error ? (
          <p className="border-b border-red-200 bg-red-50 px-4 py-2 font-body-md text-sm text-red-700 sm:px-5">
            {error}
          </p>
        ) : null}

        <div
          className={`min-h-0 flex-1 overflow-y-auto p-4 sm:p-5 ${dragOver ? "bg-primary/5" : ""}`}
          onDragOver={(e) => {
            if (!allowUpload) return;
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            if (!allowUpload) return;
            e.preventDefault();
            setDragOver(false);
            if (e.dataTransfer.files?.length) void handleFiles(e.dataTransfer.files);
          }}
        >
          {loading ? (
            <p className="py-16 text-center font-body-md text-on-surface-variant">Loading…</p>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <p className="font-body-md text-on-surface-variant">
                {query ? "No matches." : "Library is empty. Upload images in Media first."}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
              {filtered.map((item) => {
                const active = selected === item.src;
                return (
                  <button
                    key={item.src}
                    type="button"
                    onClick={() => setSelected(item.src)}
                    onDoubleClick={() => {
                      onSelect(item);
                      onClose();
                    }}
                    className={`overflow-hidden rounded border text-left transition ${
                      active
                        ? "border-primary ring-2 ring-primary/25"
                        : "border-divider hover:border-divider-emphasis"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={mediaUrl(item.src)}
                      alt={item.filename}
                      className="aspect-square w-full object-cover"
                    />
                    <div className="space-y-0.5 p-2">
                      <p className="truncate font-body-md text-[11px] text-primary">
                        {item.filename}
                      </p>
                      <p className="font-label-caps text-[10px] text-on-surface-variant">
                        {formatBytes(item.size_bytes)}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-divider px-4 py-3 sm:px-5">
          <p className="truncate font-body-md text-xs text-on-surface-variant">
            {selectedItem ? selectedItem.filename : "Select an image"}
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="border border-divider px-4 py-2 font-label-caps text-[10px] text-on-surface-variant"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={!selectedItem}
              onClick={() => {
                if (!selectedItem) return;
                onSelect(selectedItem);
                onClose();
              }}
              className="bg-primary px-4 py-2 font-label-caps text-[10px] text-on-primary disabled:opacity-40"
            >
              Use selected
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
