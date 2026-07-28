"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { ApiBlogPost } from "../../../lib/api";
import {
  createBlogPost,
  mediaUrl,
  updateBlogPost,
  type BlogPostPayload,
} from "../../../lib/admin-api";
import {
  buildArticlePayload,
  estimateReadTime,
  formatDisplayDate,
  slugify,
} from "../../../lib/blog-admin";
import { stripScripts, sanitizeBlogBodyHtml } from "../../../lib/rich-text-editor";
import MediaPicker from "./MediaPicker";
import RichTextEditor from "./RichTextEditor";
import { useAdminToast } from "./AdminToast";

const CATEGORIES = [
  "Street Stories",
  "Culture",
  "Craft",
  "Technique",
  "Personal",
];

type Props = {
  mode: "create" | "edit";
  initial?: ApiBlogPost;
};

export default function BlogEditor({ mode, initial }: Props) {
  const router = useRouter();
  const { showToast } = useAdminToast();

  const [title, setTitle] = useState(initial?.title ?? "");
  const [category, setCategory] = useState(initial?.category ?? "Street Stories");
  const [dateDisplay, setDateDisplay] = useState(
    initial?.date_display ?? formatDisplayDate(),
  );
  const [published, setPublished] = useState(initial?.published ?? false);
  const [featured, setFeatured] = useState(initial?.featured ?? false);
  const [imageSrc, setImageSrc] = useState(initial?.image ?? "");
  const [imageAlt, setImageAlt] = useState(initial?.alt ?? "");
  const [saving, setSaving] = useState(false);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [contentHtml, setContentHtml] = useState(() => {
    const article = initial?.article as { bodyHtml?: string } | undefined;
    return article?.bodyHtml ?? "";
  });

  function handleCoverSelect(item: { src: string; filename: string }) {
    setImageSrc(item.src);
    if (!imageAlt) {
      setImageAlt(title || item.filename.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
    }
    showToast("Cover image selected");
  }

  async function handleSave(publish: boolean) {
    if (!title.trim()) {
      showToast("Title is required", "error");
      return;
    }
    if (!imageSrc) {
      showToast("Cover image is required", "error");
      return;
    }

    const sanitizedHtml = sanitizeBlogBodyHtml(stripScripts(contentHtml));
    const plain = sanitizedHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (!plain) {
      showToast("Write something before saving", "error");
      return;
    }

    const excerpt = plain.slice(0, 220);
    const readTime = estimateReadTime(plain);
    const slug = initial?.slug ?? slugify(title);
    const id = initial?.id ?? slug;

    const payload: BlogPostPayload = {
      id,
      slug,
      title: title.trim(),
      excerpt,
      image: imageSrc,
      alt: imageAlt || title.trim(),
      category,
      date_display: dateDisplay,
      read_time: readTime,
      featured,
      aspect: "16/9",
      published: publish,
      article: buildArticlePayload({
        title: title.trim(),
        excerpt,
        category,
        image: imageSrc,
        alt: imageAlt || title.trim(),
        dateDisplay,
        readTime,
        contentHtml: sanitizedHtml,
      }),
    };

    setSaving(true);
    try {
      if (mode === "edit" && initial) {
        await updateBlogPost(initial.slug, payload);
        showToast(publish ? "Post published" : "Draft saved");
        if (payload.slug !== initial.slug) {
          router.push(`/admin/blog/${payload.slug}/edit`);
        }
      } else {
        await createBlogPost(payload);
        showToast(publish ? "Post published" : "Draft saved");
        router.push("/admin/blog");
      }
    } catch {
      showToast("Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  const excerptPreview =
    contentHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 160) ||
    "Excerpt will appear here…";

  return (
    <div className="min-h-screen bg-background">
      <MediaPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSelect={handleCoverSelect}
        title="Choose cover image"
      />

      <header className="sticky top-0 z-30 border-b border-divider bg-background/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-margin-mobile py-4 md:px-margin-desktop">
          <div className="flex items-center gap-4">
            <Link
              href="/admin/blog"
              className="text-on-surface-variant transition-colors hover:text-primary"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <p className="hidden font-label-caps text-label-caps text-on-surface-variant sm:block">
              {mode === "create" ? "New story" : "Edit story"}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave(false)}
              className="border border-divider-emphasis px-4 py-2 font-label-caps text-label-caps transition-all hover:bg-overlay-subtle disabled:opacity-50 md:px-6"
            >
              Save draft
            </button>
            <button
              type="button"
              disabled={saving}
              onClick={() => handleSave(true)}
              className="bg-primary px-4 py-2 font-label-caps text-label-caps text-on-primary transition-all hover:opacity-90 disabled:opacity-50 md:px-6"
            >
              {saving ? "Saving…" : "Publish"}
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-gutter px-margin-mobile py-stack-md md:px-margin-desktop lg:grid-cols-[minmax(0,1fr)_280px]">
        <main className="min-w-0">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            className="medium-title-input w-full border-0 bg-transparent py-2 font-display-lg text-display-lg-mobile outline-none placeholder:text-on-surface-variant/40 md:text-display-lg"
          />

          <div className="mb-8 mt-4">
            {imageSrc ? (
              <div className="group relative overflow-hidden rounded border border-divider bg-surface-container">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={mediaUrl(imageSrc)}
                  alt={imageAlt || title}
                  className="max-h-[420px] w-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 flex justify-end gap-2 bg-gradient-to-t from-black/60 to-transparent p-4 opacity-0 transition-opacity group-hover:opacity-100">
                  <button
                    type="button"
                    onClick={() => setPickerOpen(true)}
                    className="rounded bg-surface-container-lowest/90 px-3 py-1.5 font-label-caps text-[10px] text-on-surface backdrop-blur-sm"
                  >
                    Change cover
                  </button>
                  <button
                    type="button"
                    onClick={() => setImageSrc("")}
                    className="rounded bg-surface-container-lowest/90 px-3 py-1.5 font-label-caps text-[10px] text-error backdrop-blur-sm"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => setPickerOpen(true)}
                className="flex w-full items-center justify-center gap-2 rounded border border-dashed border-divider-strong py-8 font-label-caps text-label-caps text-on-surface-variant transition-colors hover:border-divider-emphasis hover:text-primary"
              >
                <span className="material-symbols-outlined text-xl">folder_open</span>
                Choose cover from Media
              </button>
            )}
          </div>

          <RichTextEditor
            initialHtml={contentHtml}
            onChange={setContentHtml}
            placeholder="Tell your story…"
          />

          <p className="mt-6 font-label-caps text-[10px] text-on-surface-variant/70">
            Tip: use the image button, drag & drop, or paste to add photos anywhere in your story.
          </p>
        </main>

        <aside className="space-y-stack-sm lg:sticky lg:top-24 lg:self-start">
          <div className="space-y-6 border border-divider bg-surface-container p-6">
            <h3 className="border-b border-divider pb-4 font-label-caps text-label-caps text-primary">
              Publishing
            </h3>
            <div className="flex items-center justify-between">
              <span className="font-label-caps text-[11px] text-on-surface-variant">
                Status: {published ? "Published" : "Draft"}
              </span>
              <label className="relative inline-flex cursor-pointer items-center">
                <input
                  type="checkbox"
                  checked={published}
                  onChange={(e) => setPublished(e.target.checked)}
                  className="peer sr-only"
                />
                <div className="peer h-6 w-11 rounded-full bg-surface-variant after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-outline-variant after:bg-surface-container-lowest after:transition-all peer-checked:bg-primary/20 peer-checked:after:translate-x-full" />
              </label>
            </div>
            <div className="space-y-2">
              <label className="block font-label-caps text-[11px] text-on-surface-variant">
                Publish date
              </label>
              <input
                value={dateDisplay}
                onChange={(e) => setDateDisplay(e.target.value)}
                className="admin-select font-label-caps text-sm"
              />
            </div>
            <div className="space-y-2">
              <label className="block font-label-caps text-[11px] text-on-surface-variant">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="admin-select font-label-caps text-sm"
              >
                {CATEGORIES.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </div>
            <label className="flex items-center justify-between">
              <span className="font-body-md text-body-md text-on-surface-variant">
                Featured on blog home
              </span>
              <input
                type="checkbox"
                checked={featured}
                onChange={(e) => setFeatured(e.target.checked)}
                className="accent-primary"
              />
            </label>
          </div>

          <div className="space-y-2 border border-divider bg-surface-container p-6">
            <h3 className="border-b border-divider pb-4 font-label-caps text-label-caps text-primary">
              SEO preview
            </h3>
            <p className="text-sm text-primary">{title || "Post title"} | daathwi.jpg</p>
            <p className="text-xs text-on-surface-variant">
              daathwi.jpg/blog/{slugify(title || "post-title")}
            </p>
            <p className="line-clamp-3 text-xs text-on-surface-variant">{excerptPreview}</p>
          </div>

          {mode === "edit" && initial && (
            <Link
              href={`/blog/${initial.slug}`}
              target="_blank"
              className="inline-flex items-center gap-2 font-label-caps text-label-caps text-primary hover:underline"
            >
              Preview live post
              <span className="material-symbols-outlined text-sm">open_in_new</span>
            </Link>
          )}
        </aside>
      </div>
    </div>
  );
}
