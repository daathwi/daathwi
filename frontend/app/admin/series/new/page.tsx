"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { createSeries } from "../../../../lib/admin-api";
import { useAdminToast } from "../../components/AdminToast";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 80);
}

export default function AdminSeriesNewPage() {
  const router = useRouter();
  const { showToast } = useAdminToast();
  const [title, setTitle] = useState("");
  const [slug, setSlug] = useState("");
  const [slugTouched, setSlugTouched] = useState(false);
  const [subtitle, setSubtitle] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      showToast("Title is required", "error");
      return;
    }
    const resolvedSlug = slug.trim() || slugify(title);
    if (!resolvedSlug) {
      showToast("Slug is required", "error");
      return;
    }

    setSaving(true);
    try {
      const id = `${resolvedSlug}-${Date.now()}`.slice(0, 64);
      const created = await createSeries({
        id,
        slug: resolvedSlug,
        title: title.trim(),
        subtitle: subtitle.trim(),
        description: description.trim(),
        published: true,
        sort_order: 0,
      });
      showToast("Series created");
      router.push(`/admin/series/${created.slug}/edit`);
    } catch {
      showToast("Could not create series", "error");
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      <header className="border-b border-divider px-margin-desktop py-8">
        <nav className="mb-3 flex items-center gap-2 text-on-surface-variant">
          <Link href="/admin/series" className="font-label-caps text-label-caps hover:text-primary">
            Series
          </Link>
          <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          <span className="font-label-caps text-label-caps text-primary">New</span>
        </nav>
        <h2 className="font-headline-md text-headline-md text-primary">New photo series</h2>
        <p className="mt-2 max-w-xl font-body-md text-on-surface-variant">
          Start with a title and story — then assign photos on the next screen.
        </p>
      </header>

      <form onSubmit={handleSubmit} className="max-w-2xl space-y-6 px-margin-desktop py-stack-lg">
        <label className="block space-y-2">
          <span className="font-label-caps text-label-caps text-on-surface-variant">Title</span>
          <input
            value={title}
            onChange={(e) => {
              setTitle(e.target.value);
              if (!slugTouched) setSlug(slugify(e.target.value));
            }}
            className="admin-input"
            placeholder="Life on the Streets of Old Delhi"
            required
          />
        </label>

        <label className="block space-y-2">
          <span className="font-label-caps text-label-caps text-on-surface-variant">Slug</span>
          <input
            value={slug}
            onChange={(e) => {
              setSlugTouched(true);
              setSlug(slugify(e.target.value));
            }}
            className="admin-input"
            placeholder="old-delhi-streets"
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
            placeholder="Side light, chai steam, and everyday motion"
          />
        </label>

        <label className="block space-y-2">
          <span className="font-label-caps text-label-caps text-on-surface-variant">
            Description
          </span>
          <textarea
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="admin-input resize-none"
            placeholder="A short intro for this visual narrative…"
          />
        </label>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-primary px-8 py-3 font-label-caps text-label-caps text-on-primary disabled:opacity-50"
          >
            {saving ? "Creating…" : "Create series"}
          </button>
          <Link
            href="/admin/series"
            className="border border-divider px-6 py-3 font-label-caps text-label-caps text-on-surface-variant"
          >
            Cancel
          </Link>
        </div>
      </form>
    </>
  );
}
