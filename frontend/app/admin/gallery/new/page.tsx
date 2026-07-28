"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { ApiGalleryItem, ApiGallerySeries } from "../../../../lib/api";
import {
  DEFAULT_GALLERY_ASPECT,
  GALLERY_ASPECT_RATIOS,
  type GalleryAspectRatio,
} from "../../../../lib/aspect-ratios";
import {
  createGalleryItemFromSrc,
  fetchSeriesAdmin,
  mediaSrcToFile,
  uploadMedia,
} from "../../../../lib/admin-api";
import AspectCropEditor, {
  type AspectCropEditorHandle,
} from "../../components/AspectCropEditor";
import MediaPicker from "../../components/MediaPicker";
import { useAdminToast } from "../../components/AdminToast";

const CATEGORIES: ApiGalleryItem["category"][] = [
  "Street",
  "Culture",
  "Craft",
  "Night",
  "People",
];

export default function AdminGalleryUploadPage() {
  const router = useRouter();
  const { showToast } = useAdminToast();
  const cropRef = useRef<AspectCropEditorHandle>(null);

  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [alt, setAlt] = useState("");
  const [category, setCategory] = useState<ApiGalleryItem["category"]>("Street");
  const [tag, setTag] = useState("");
  const [description, setDescription] = useState("");
  const [aspectRatio, setAspectRatio] = useState<GalleryAspectRatio>(DEFAULT_GALLERY_ASPECT);
  const [seriesList, setSeriesList] = useState<ApiGallerySeries[]>([]);
  const [seriesId, setSeriesId] = useState("");

  useEffect(() => {
    fetchSeriesAdmin()
      .then(setSeriesList)
      .catch(() => undefined);
  }, []);

  async function handleMediaSelect(item: { src: string; filename: string }) {
    try {
      const file = await mediaSrcToFile(item.src, item.filename);
      setPendingFile(file);
      const baseName = item.filename.replace(/\.[^.]+$/, "").replace(/[-_]/g, " ");
      if (!title) setTitle(baseName);
      if (!alt) setAlt(baseName);
      if (!tag) setTag(category.toUpperCase());
    } catch {
      showToast("Could not load selected media", "error");
    }
  }

  async function handlePublish() {
    if (!title.trim()) {
      showToast("Title is required", "error");
      return;
    }
    if (!pendingFile) {
      setPickerOpen(true);
      return;
    }

    setUploading(true);
    try {
      const croppedFile = await cropRef.current?.crop();
      if (!croppedFile) {
        showToast("Could not crop image", "error");
        return;
      }

      const uploaded = await uploadMedia(croppedFile);
      const id =
        title.replace(/\W+/g, "-").slice(0, 48).toLowerCase() || `gallery-${Date.now()}`;
      await createGalleryItemFromSrc({
        id: `${id}-${Date.now()}`,
        src: uploaded.src,
        title: title.trim(),
        alt: alt.trim() || title.trim(),
        category,
        tag: tag.trim() || category.toUpperCase(),
        description: description.trim() || alt.trim() || title.trim(),
        aspect_ratio: aspectRatio,
        series_id: seriesId || null,
      });
      showToast("Added to gallery");
      setPendingFile(null);
      router.push(seriesId ? "/admin/series" : "/admin/gallery");
    } catch {
      showToast("Upload failed", "error");
    } finally {
      setUploading(false);
    }
  }

  return (
    <>
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={(item) => void handleMediaSelect(item)}
        title="Choose gallery photo"
      />

      <header className="mb-stack-lg flex flex-col gap-6 px-margin-desktop pt-16 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="mb-2 font-headline-md text-headline-md text-primary">Add Gallery Photo</h2>
          <nav className="flex items-center gap-2 text-on-surface-variant">
            <Link href="/admin/gallery" className="font-label-caps text-label-caps hover:text-primary">
              Gallery
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="font-label-caps text-label-caps text-primary">New Photo</span>
          </nav>
          <p className="mt-3 max-w-xl font-body-md text-on-surface-variant">
            Pick a photo from Media, choose an aspect ratio, drag to position, then publish.
          </p>
        </div>
        <div className="flex shrink-0 gap-4">
          <Link
            href="/admin/gallery"
            className="border border-divider-strong px-6 py-3 font-label-caps text-label-caps transition-colors hover:border-divider-focus"
          >
            Cancel
          </Link>
          <button
            type="button"
            disabled={uploading}
            onClick={handlePublish}
            className="bg-primary px-8 py-3 font-label-caps text-label-caps text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {uploading ? "Publishing…" : "Publish to Gallery"}
          </button>
        </div>
      </header>

      <form
        className="grid max-w-container-max grid-cols-12 gap-gutter px-margin-desktop pb-stack-lg"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="col-span-12 space-y-gutter lg:col-span-8">
          <section className="rounded-lg border border-divider bg-surface-container p-stack-md">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
              <div>
                <h4 className="flex items-center gap-2 font-label-caps text-label-caps text-primary">
                  <span className="material-symbols-outlined text-[18px]">crop</span>
                  Crop &amp; Position
                </h4>
                <p className="mt-1 font-body-md text-sm text-on-surface-variant">
                  The frame stays fixed — change ratio in the sidebar, drag image to reposition.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="border border-divider-emphasis px-4 py-2 font-label-caps text-label-caps transition-colors hover:bg-overlay-subtle"
              >
                {pendingFile ? "Replace from Media" : "Choose from Media"}
              </button>
            </div>

            <AspectCropEditor
              ref={cropRef}
              file={pendingFile}
              aspectRatio={aspectRatio}
            />

            {pendingFile && (
              <p className="mt-3 truncate font-label-caps text-[10px] text-on-surface-variant">
                {pendingFile.name}
              </p>
            )}
          </section>

          <section className="rounded-lg border border-divider bg-surface-container p-stack-md">
            <h4 className="mb-8 flex items-center gap-2 font-label-caps text-label-caps text-primary">
              <span className="material-symbols-outlined text-[18px]">info</span>
              Photo Details
            </h4>
            <div className="space-y-6">
              <div>
                <label className="mb-2 block font-label-caps text-label-caps text-on-surface-variant">
                  Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Golden Hour in Lisbon"
                  className="w-full border-0 border-b border-divider-strong bg-transparent py-2 font-headline-sm text-headline-sm text-primary outline-none focus:border-divider-intense"
                  required
                />
              </div>

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block font-label-caps text-label-caps text-on-surface-variant">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => {
                      const next = e.target.value as ApiGalleryItem["category"];
                      setCategory(next);
                      if (!tag || tag === category.toUpperCase()) setTag(next.toUpperCase());
                    }}
                    className="admin-select"
                  >
                    {CATEGORIES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block font-label-caps text-label-caps text-on-surface-variant">
                    Photo series
                  </label>
                  <select
                    value={seriesId}
                    onChange={(e) => setSeriesId(e.target.value)}
                    className="admin-select"
                  >
                    <option value="">Ungrouped</option>
                    {seriesList.map((entry) => (
                      <option key={entry.id} value={entry.id}>
                        {entry.title}
                      </option>
                    ))}
                  </select>
                  {seriesList.length === 0 && (
                    <p className="mt-2 font-body-md text-xs text-on-surface-variant">
                      <Link href="/admin/series/new" className="text-primary underline">
                        Create a series
                      </Link>{" "}
                      to group this photo into an essay.
                    </p>
                  )}
                </div>
              </div>

              <div>
                <label className="mb-2 block font-label-caps text-label-caps text-on-surface-variant">
                  Tag
                </label>
                <input
                  value={tag}
                  onChange={(e) => setTag(e.target.value)}
                  placeholder="e.g. STREET"
                  className="admin-input"
                />
              </div>

              <div>
                <label className="mb-2 block font-label-caps text-label-caps text-on-surface-variant">
                  Alt text
                </label>
                <input
                  value={alt}
                  onChange={(e) => setAlt(e.target.value)}
                  placeholder="Describe the image for accessibility"
                  className="admin-input"
                />
              </div>

              <div>
                <label className="mb-2 block font-label-caps text-label-caps text-on-surface-variant">
                  Description
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Optional caption or context shown on hover…"
                  className="admin-textarea"
                />
              </div>
            </div>
          </section>
        </div>

        <aside className="col-span-12 space-y-gutter lg:col-span-4">
          <section className="rounded-lg border border-divider bg-surface-container p-stack-md">
            <h4 className="mb-2 flex items-center gap-2 font-label-caps text-label-caps text-primary">
              <span className="material-symbols-outlined text-[18px]">aspect_ratio</span>
              Gallery Aspect Ratio
            </h4>
            <p className="mb-6 font-body-md text-sm text-on-surface-variant">
              Switches the crop window inside the fixed frame. Your position is saved per ratio.
            </p>

            <div className="grid grid-cols-2 gap-3">
              {GALLERY_ASPECT_RATIOS.map((item) => {
                const active = aspectRatio === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setAspectRatio(item.id)}
                    className={`flex flex-col items-center gap-3 rounded border p-4 transition-colors ${
                      active
                        ? "border-primary bg-primary/5"
                        : "border-divider-strong bg-surface-container-low hover:border-divider-emphasis"
                    }`}
                  >
                    <div
                      className={`flex items-center justify-center rounded border bg-surface-container-highest ${
                        active ? "border-primary" : "border-divider"
                      }`}
                      style={{
                        width: item.ratio >= 1 ? 56 : Math.round(56 * item.ratio),
                        height: item.ratio >= 1 ? Math.round(56 / item.ratio) : 56,
                      }}
                    >
                      <span
                        className={`material-symbols-outlined text-[18px] ${
                          active ? "text-primary" : "text-on-surface-variant"
                        }`}
                      >
                        {item.ratio > 1
                          ? "crop_landscape"
                          : item.ratio < 1
                            ? "crop_portrait"
                            : "crop_square"}
                      </span>
                    </div>
                    <span
                      className={`font-label-caps text-[11px] tracking-wider ${
                        active ? "text-primary" : "text-on-surface-variant"
                      }`}
                    >
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="rounded-lg border border-divider bg-surface-container-low p-stack-md">
            <h4 className="mb-4 font-label-caps text-label-caps text-primary">Tips</h4>
            <ul className="space-y-3 font-body-md text-sm text-on-surface-variant">
              <li className="flex gap-2">
                <span className="material-symbols-outlined shrink-0 text-[16px] text-primary">
                  folder_open
                </span>
                Upload originals in{" "}
                <Link href="/admin/media" className="text-primary underline">
                  Media
                </Link>
                , then pick them here.
              </li>
              <li className="flex gap-2">
                <span className="material-symbols-outlined shrink-0 text-[16px] text-primary">
                  pan_tool_alt
                </span>
                Click and drag inside the crop area to reposition the photo.
              </li>
              <li className="flex gap-2">
                <span className="material-symbols-outlined shrink-0 text-[16px] text-primary">
                  zoom_in
                </span>
                Use the zoom slider or scroll wheel to fine-tune framing.
              </li>
            </ul>
          </section>
        </aside>
      </form>
    </>
  );
}
