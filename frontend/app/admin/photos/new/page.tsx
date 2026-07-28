"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  createPhotoFromSrc,
  mediaSrcToFile,
  uploadMedia,
} from "../../../../lib/admin-api";
import HeroCropModal from "../../components/HeroCropModal";
import MediaPicker from "../../components/MediaPicker";
import { useAdminToast } from "../../components/AdminToast";

const CATEGORIES = ["Street", "Culture", "Craft", "Night", "People"];

export default function AdminPhotoUploadPage() {
  const router = useRouter();
  const { showToast } = useAdminToast();
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [cropFile, setCropFile] = useState<File | null>(null);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [uploading, setUploading] = useState(false);

  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");
  const [description, setDescription] = useState("");
  const [camera, setCamera] = useState("");
  const [lens, setLens] = useState("");
  const [aperture, setAperture] = useState("");
  const [shutter, setShutter] = useState("");
  const [iso, setIso] = useState("");

  async function handleMediaSelect(item: { src: string; filename: string }) {
    try {
      const file = await mediaSrcToFile(item.src, item.filename);
      setPendingFile(file);
      if (!title) {
        setTitle(item.filename.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
      }
    } catch {
      showToast("Could not load selected media", "error");
    }
  }

  function addTag() {
    const value = tagInput.trim().toUpperCase();
    if (!value || tags.includes(value)) return;
    setTags((prev) => [...prev, value]);
    setTagInput("");
  }

  async function handleCropConfirm(webFile: File, mobileFile: File, alt: string) {
    setUploading(true);
    try {
      const [web, mobile] = await Promise.all([
        uploadMedia(webFile),
        uploadMedia(mobileFile),
      ]);
      const id =
        title.replace(/\W+/g, "-").slice(0, 48).toLowerCase() || `hero-${Date.now()}`;
      await createPhotoFromSrc({
        id: `${id}-${Date.now()}`,
        src: web.src,
        src_mobile: mobile.src,
        alt: alt || title,
        meta: {
          title,
          category,
          tags,
          description,
          exif: { camera, lens, aperture, shutter, iso },
        },
      });
      showToast("Photo published");
      setPendingFile(null);
      router.push("/admin/photos");
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
        title="Choose hero source"
      />

      {cropFile && (
        <HeroCropModal
          file={cropFile}
          onCancel={() => setCropFile(null)}
          onConfirm={async (web, mobile, alt) => {
            await handleCropConfirm(web, mobile, alt || description || title);
            setCropFile(null);
          }}
        />
      )}

      <header className="mb-stack-lg flex items-end justify-between px-margin-desktop pt-16">
        <div>
          <h2 className="mb-2 font-headline-md text-headline-md text-primary">Upload Hero Photo</h2>
          <nav className="flex items-center gap-2 text-on-surface-variant">
            <Link href="/admin/photos" className="font-label-caps text-label-caps hover:text-primary">
              Hero Photos
            </Link>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
            <span className="font-label-caps text-label-caps text-primary">Add New Asset</span>
          </nav>
        </div>
        <div className="flex gap-4">
          <Link
            href="/admin/photos"
            className="border border-divider-strong px-6 py-3 font-label-caps text-label-caps transition-colors hover:border-divider-focus"
          >
            Cancel
          </Link>
          <button
            type="button"
            disabled={uploading}
            onClick={() => {
              if (!title.trim()) {
                showToast("Photo title is required", "error");
                return;
              }
              if (!pendingFile) {
                setPickerOpen(true);
                return;
              }
              setCropFile(pendingFile);
            }}
            className="bg-primary px-8 py-3 font-label-caps text-label-caps text-on-primary transition-opacity hover:opacity-90 disabled:opacity-50"
          >
            {uploading ? "Uploading…" : "Crop & Publish"}
          </button>
        </div>
      </header>

      <form
        className="grid max-w-container-max grid-cols-12 gap-gutter px-margin-desktop pb-stack-lg"
        onSubmit={(e) => e.preventDefault()}
      >
        <div className="col-span-12 space-y-stack-md lg:col-span-8">
          <section className="flex min-h-[400px] flex-col items-center justify-center rounded-lg border border-dashed border-divider-strong bg-surface-container p-stack-sm">
            <span className="material-symbols-outlined mb-4 text-[48px] text-on-surface-variant">
              folder_open
            </span>
            <h3 className="mb-2 font-headline-sm text-headline-sm text-primary">
              Choose from Media library
            </h3>
            <p className="mx-auto max-w-sm text-center font-body-md text-on-surface-variant">
              Upload originals in Media, then pick a source here. Web and mobile crops are
              created next.
            </p>
            {pendingFile && (
              <p className="mt-4 font-label-caps text-label-caps text-primary">
                Selected: {pendingFile.name}
              </p>
            )}
            <button
              type="button"
              onClick={() => setPickerOpen(true)}
              className="mt-8 border border-divider-emphasis px-6 py-2 font-label-caps text-label-caps transition-all hover:bg-primary hover:text-on-primary"
            >
              {pendingFile ? "Replace from Media" : "Browse Media"}
            </button>
          </section>

          <section className="rounded-lg border border-divider bg-surface-container p-stack-md">
            <h4 className="mb-8 flex items-center gap-2 font-label-caps text-label-caps text-primary">
              <span className="material-symbols-outlined text-[18px]">info</span>
              General Details
            </h4>
            <div className="space-y-6">
              <div>
                <label className="mb-2 block font-label-caps text-label-caps text-on-surface-variant">
                  Photo Title
                </label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., The Serenity of Fjords"
                  className="w-full border-0 border-b border-divider-strong bg-transparent py-2 font-headline-sm text-headline-sm text-primary outline-none focus:border-divider-intense"
                />
              </div>
              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                <div>
                  <label className="mb-2 block font-label-caps text-label-caps text-on-surface-variant">
                    Category
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="admin-select"
                  >
                    <option value="">Select Category</option>
                    {CATEGORIES.map((item) => (
                      <option key={item} value={item}>
                        {item}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="mb-2 block font-label-caps text-label-caps text-on-surface-variant">
                    Tags
                  </label>
                  <input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder="Add tags, press Enter…"
                    className="admin-select"
                  />
                  <div className="mt-3 flex flex-wrap gap-2">
                    {tags.map((tag) => (
                      <span
                        key={tag}
                        className="flex items-center gap-2 border border-divider bg-surface-container-high px-2 py-1 font-label-caps text-[10px] text-on-surface-variant"
                      >
                        {tag}
                        <button
                          type="button"
                          onClick={() => setTags((prev) => prev.filter((t) => t !== tag))}
                        >
                          <span className="material-symbols-outlined text-[12px]">close</span>
                        </button>
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div>
                <label className="mb-2 block font-label-caps text-label-caps text-on-surface-variant">
                  Description / SEO Alt Text
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  placeholder="Describe the scene for search engines and accessibility…"
                  className="admin-textarea"
                />
              </div>
            </div>
          </section>
        </div>

        <div className="col-span-12 space-y-gutter lg:col-span-4">
          <section className="rounded-lg border border-divider bg-surface-container p-stack-md">
            <h4 className="mb-8 flex items-center gap-2 font-label-caps text-label-caps text-primary">
              <span className="material-symbols-outlined text-[18px]">camera</span>
              Technical EXIF
            </h4>
            <div className="space-y-6">
              {[
                ["Camera Body", camera, setCamera, "Sony A7R IV"],
                ["Lens", lens, setLens, "35mm f/1.4 GM"],
                ["Aperture", aperture, setAperture, "f/2.8"],
                ["Shutter Speed", shutter, setShutter, "1/500s"],
                ["ISO", iso, setIso, "100"],
              ].map(([label, value, setter, placeholder]) => (
                <div key={label as string}>
                  <label className="mb-2 block font-label-caps text-[10px] text-on-surface-variant">
                    {label as string}
                  </label>
                  <input
                    value={value as string}
                    onChange={(e) => (setter as (v: string) => void)(e.target.value)}
                    placeholder={placeholder as string}
                    className="admin-input"
                  />
                </div>
              ))}
            </div>
          </section>
        </div>
      </form>
    </>
  );
}
