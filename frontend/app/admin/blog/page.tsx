"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { ApiBlogPost } from "../../../lib/api";
import { deleteBlogPost, fetchBlogAdmin, mediaUrl } from "../../../lib/admin-api";
import { hasMediaSrc } from "../../../lib/media";
import { useAdminToast } from "../components/AdminToast";

type Filter = "all" | "published" | "drafts";

const PAGE_SIZE = 10;

export default function AdminBlogPage() {
  const { showToast } = useAdminToast();
  const [posts, setPosts] = useState<ApiBlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPosts(await fetchBlogAdmin());
    } catch {
      showToast("Failed to load blog posts", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  const filtered = useMemo(() => {
    return posts.filter((post) => {
      if (filter === "published" && !post.published) return false;
      if (filter === "drafts" && post.published) return false;
      if (!search.trim()) return true;
      const q = search.toLowerCase();
      return (
        post.title.toLowerCase().includes(q) || post.slug.toLowerCase().includes(q)
      );
    });
  }, [posts, filter, search]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [filter, search]);

  const stats = useMemo(
    () => ({
      total: posts.length,
      published: posts.filter((p) => p.published).length,
      drafts: posts.filter((p) => !p.published).length,
      featured: posts.filter((p) => p.featured).length,
    }),
    [posts],
  );

  const kpiCards = [
    {
      label: "Total Posts",
      value: stats.total,
      icon: "library_books",
      hint: "All blog entries",
    },
    {
      label: "Published",
      value: stats.published,
      icon: "check_circle",
      hint: "Live on site",
    },
    {
      label: "Drafts",
      value: stats.drafts,
      icon: "draft",
      hint: "Unpublished work",
    },
    {
      label: "Featured",
      value: stats.featured,
      icon: "grade",
      hint: "Blog home spotlight",
    },
  ] as const;

  async function handleDelete(slug: string) {
    if (!confirm("Delete this blog post?")) return;
    try {
      await deleteBlogPost(slug);
      showToast("Post deleted");
      await load();
    } catch {
      showToast("Delete failed", "error");
    }
  }

  return (
    <div className="flex min-h-full flex-1 flex-col">
      <header className="mb-stack-lg flex items-end justify-between px-margin-desktop pt-16">
        <div>
          <h2 className="font-headline-md text-headline-md text-primary">Blog Manager</h2>
          <p className="mt-2 max-w-xl font-body-md text-on-surface-variant opacity-70">
            Curate your thoughts, stories, and editorial pieces. Maintain a consistent voice
            for your photography brand.
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="flex items-center gap-2 rounded bg-primary px-6 py-3 font-label-caps text-label-caps uppercase tracking-widest text-background transition-opacity hover:opacity-90"
        >
          <span className="material-symbols-outlined text-[20px]">add</span>
          Create New Post
        </Link>
      </header>

      <section className="mb-stack-md grid grid-cols-12 gap-gutter px-margin-desktop">
        {kpiCards.map((stat) => (
          <div
            key={stat.label}
            className="bento-card col-span-12 flex h-56 flex-col justify-between border border-divider bg-surface-container-low p-8 md:col-span-3"
          >
            <div className="flex items-start justify-between">
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
                {stat.label}
              </span>
              <span className="material-symbols-outlined text-primary">{stat.icon}</span>
            </div>
            <div>
              <div className="font-display-lg text-[48px] leading-none text-primary">
                {stat.value}
              </div>
              <div className="mt-2 font-label-caps text-[10px] text-on-surface-variant">
                {stat.hint}
              </div>
            </div>
          </div>
        ))}
      </section>

      <section className="glass-panel mx-margin-desktop mb-stack-lg flex min-h-[calc(100vh-18rem)] flex-1 flex-col overflow-x-auto rounded-lg">
        <div className="flex shrink-0 flex-col justify-between gap-4 border-b border-divider bg-overlay-subtle px-8 py-6 md:flex-row md:items-center">
          <div className="flex flex-wrap gap-6">
            {(
              [
                ["all", "All Posts"],
                ["published", "Published"],
                ["drafts", "Drafts"],
              ] as const
            ).map(([id, label]) => (
              <button
                key={id}
                type="button"
                onClick={() => setFilter(id)}
                className={`pb-1 font-label-caps text-label-caps transition-colors ${
                  filter === id
                    ? "border-b-2 border-primary text-primary"
                    : "text-on-surface-variant hover:text-primary"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
          <div className="relative">
            <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant opacity-50">
              search
            </span>
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search posts…"
              className="w-full rounded border border-divider-strong bg-surface-container-low py-2 pl-10 pr-4 font-label-caps text-[11px] transition-colors focus:border-divider-focus focus:outline-none md:w-64"
            />
          </div>
        </div>

        {loading ? (
          <p className="flex flex-1 items-center px-8 py-16 font-body-md text-on-surface-variant">
            Loading…
          </p>
        ) : pageItems.length === 0 ? (
          <p className="flex flex-1 items-center px-8 py-16 font-body-md text-on-surface-variant">
            No posts match this filter.
          </p>
        ) : (
          <div className="flex-1 overflow-x-auto">
            <table className="w-full border-collapse text-left">
            <thead>
              <tr className="border-b border-divider font-label-caps text-[10px] uppercase tracking-[0.2em] text-on-surface-variant">
                <th className="px-8 py-5 font-semibold">Post Title</th>
                <th className="px-8 py-5 font-semibold">Status</th>
                <th className="px-8 py-5 font-semibold">Category</th>
                <th className="px-8 py-5 text-right font-semibold">Published Date</th>
                <th className="px-8 py-5 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="font-body-md text-[14px]">
              {pageItems.map((post) => (
                <tr key={post.id} className="table-row-hover group border-b border-divider">
                  <td className="px-8 py-6">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 shrink-0 overflow-hidden rounded bg-surface-container-highest">
                        {hasMediaSrc(post.image) && (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={mediaUrl(post.image)}
                            alt={post.alt}
                            className="h-full w-full object-cover grayscale transition-all duration-500 group-hover:grayscale-0"
                          />
                        )}
                      </div>
                      <div>
                        <p className="font-medium text-primary">{post.title}</p>
                        <p className="mt-1 text-[11px] uppercase tracking-tighter text-on-surface-variant opacity-40">
                          slug: {post.slug}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-8 py-6">
                    <span
                      className={`rounded-full border px-3 py-1 font-label-caps text-[10px] uppercase tracking-widest ${
                        post.published
                          ? "border-divider-strong bg-surface-container-high text-primary"
                          : "border-divider bg-surface-container-lowest text-on-surface-variant"
                      }`}
                    >
                      {post.published ? "Published" : "Draft"}
                    </span>
                  </td>
                  <td className="px-8 py-6">
                    <span className="font-label-caps text-[11px] uppercase text-on-surface-variant">
                      {post.category}
                    </span>
                  </td>
                  <td className="px-8 py-6 text-right font-label-caps text-[11px] text-on-surface-variant">
                    {post.published ? post.date_display : "Pending"}
                  </td>
                  <td className="px-8 py-6 text-right">
                    <div className="flex justify-end gap-3">
                      <Link
                        href={`/admin/blog/${post.slug}/edit`}
                        className="text-on-surface-variant transition-colors hover:text-primary"
                        title="Edit"
                      >
                        <span className="material-symbols-outlined">edit</span>
                      </Link>
                      {post.published && (
                        <Link
                          href={`/blog/${post.slug}`}
                          target="_blank"
                          className="text-on-surface-variant transition-colors hover:text-primary"
                          title="Preview"
                        >
                          <span className="material-symbols-outlined">visibility</span>
                        </Link>
                      )}
                      <button
                        type="button"
                        onClick={() => handleDelete(post.slug)}
                        className="text-on-surface-variant transition-colors hover:text-error"
                        title="Delete"
                      >
                        <span className="material-symbols-outlined">delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        )}

        <div className="mt-auto flex shrink-0 items-center justify-between bg-surface-container-lowest px-8 py-6">
          <p className="font-label-caps text-[10px] text-on-surface-variant opacity-60">
            Showing {pageItems.length} of {filtered.length} articles
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="flex h-8 w-8 items-center justify-center rounded border border-divider-strong text-on-surface-variant transition-colors hover:border-divider-focus disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_left</span>
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .slice(0, 5)
              .map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setPage(n)}
                  className={`flex h-8 w-8 items-center justify-center rounded border font-label-caps text-[10px] transition-colors ${
                    page === n
                      ? "border-divider-focus text-primary"
                      : "border-divider-strong text-on-surface-variant hover:border-divider-focus"
                  }`}
                >
                  {n}
                </button>
              ))}
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="flex h-8 w-8 items-center justify-center rounded border border-divider-strong text-on-surface-variant transition-colors hover:border-divider-focus disabled:opacity-40"
            >
              <span className="material-symbols-outlined text-[16px]">chevron_right</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
