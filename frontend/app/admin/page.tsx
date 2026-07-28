import Link from "next/link";
import {
  fetchAdminOverview,
  formatBytes,
  mediaUrl,
} from "../../lib/admin-api";
import { hasMediaSrc } from "../../lib/media";

export const dynamic = "force-dynamic";

function formatCount(n: number) {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

export default async function AdminDashboardPage() {
  const overview = await fetchAdminOverview();
  const hasLatestPhoto = hasMediaSrc(overview.latest_photo_src);
  const storagePct = Math.min(
    100,
    (overview.storage_bytes / overview.storage_limit_bytes) * 100
  );

  return (
    <>
      <header className="flex flex-col gap-6 px-margin-desktop pb-stack-md pt-16 md:flex-row md:items-end md:justify-between">
        <div>
          <h2 className="font-headline-md text-headline-md text-primary">
            Site maintenance
          </h2>
          <p className="mt-2 max-w-xl font-body-md text-on-surface-variant">
            Keep hero photos, gallery, journal posts, and site copy in sync with the
            live portfolio.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/admin/photos/new"
            className="rounded bg-primary px-6 py-3 font-label-caps text-label-caps text-on-primary transition-all hover:opacity-90"
          >
            Upload Hero
          </Link>
          <Link
            href="/admin/gallery/new"
            className="rounded border border-divider-emphasis px-6 py-3 font-label-caps text-label-caps text-primary transition-all hover:bg-overlay-subtle"
          >
            Add Gallery Photo
          </Link>
          <Link
            href="/admin/blog/new"
            className="rounded border border-divider-emphasis px-6 py-3 font-label-caps text-label-caps text-primary transition-all hover:bg-overlay-subtle"
          >
            Write Post
          </Link>
          <Link
            href="/admin/settings"
            className="rounded border border-divider-emphasis px-6 py-3 font-label-caps text-label-caps text-primary transition-all hover:bg-overlay-subtle"
          >
            Edit Site Copy
          </Link>
        </div>
      </header>

      <section className="grid grid-cols-12 gap-gutter px-margin-desktop">
        <div className="bento-card col-span-12 flex h-48 flex-col justify-between border border-divider bg-surface-container-low p-8 md:col-span-4">
          <div className="flex items-start justify-between">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
              Homepage media
            </span>
            <span className="material-symbols-outlined text-primary">photo_camera</span>
          </div>
          <div>
            <div className="font-display-lg text-[48px] leading-none text-primary">
              {formatCount(overview.counts.assets)}
            </div>
            <div className="mt-2 font-label-caps text-[10px] text-on-surface-variant">
              {overview.counts.photos} hero · {overview.counts.gallery} gallery
            </div>
          </div>
        </div>

        <div className="bento-card col-span-12 flex h-48 flex-col justify-between border border-divider bg-surface-container-low p-8 md:col-span-4">
          <div className="flex items-start justify-between">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
              Journal posts
            </span>
            <span className="material-symbols-outlined text-primary">edit_note</span>
          </div>
          <div>
            <div className="font-display-lg text-[48px] leading-none text-primary">
              {overview.counts.blog_posts}
            </div>
            <div className="mt-2 font-label-caps text-[10px] text-on-surface-variant">
              Latest posts on home &amp; /blog
            </div>
          </div>
        </div>

        <div className="bento-card col-span-12 flex h-48 flex-col justify-between border border-divider bg-surface-container-low p-8 md:col-span-4">
          <div className="flex items-start justify-between">
            <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">
              Inquiries
            </span>
            <span className="material-symbols-outlined text-primary">mail</span>
          </div>
          <div>
            <div className="font-display-lg text-[48px] leading-none text-primary">
              {overview.counts.inquiries}
            </div>
            <div className="mt-2 font-label-caps text-[10px] text-on-surface-variant">
              Contact form submissions
            </div>
          </div>
        </div>

        <div className="relative col-span-12 h-[400px] overflow-hidden border border-divider bg-surface-container md:col-span-8">
          {hasLatestPhoto && (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={mediaUrl(overview.latest_photo_src!)}
                alt=""
                className="absolute inset-0 h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/35 to-black/10" />
            </>
          )}
          <div className="relative z-10 flex h-full flex-col justify-between p-8">
            <div>
              <span
                className={`mb-4 inline-block px-3 py-1 font-label-caps text-[10px] tracking-widest ${
                  hasLatestPhoto
                    ? "bg-surface-container-lowest/90 text-on-surface backdrop-blur-sm"
                    : "bg-inverse-surface text-inverse-on-surface"
                }`}
              >
                LATEST HERO
              </span>
              <h3
                className={`max-w-sm font-headline-sm text-headline-sm ${
                  hasLatestPhoto ? "text-hero-fg" : "text-on-surface"
                }`}
              >
                {overview.latest_photo_alt ?? "Upload a hero photo for the home carousel"}
              </h3>
            </div>
            <Link
              href="/admin/photos"
              className={`group flex items-center gap-2 font-label-caps text-label-caps ${
                hasLatestPhoto ? "text-hero-fg" : "text-primary"
              }`}
            >
              Manage hero photos
              <span className="material-symbols-outlined transition-transform group-hover:translate-x-1">
                arrow_forward
              </span>
            </Link>
          </div>
        </div>

        <div className="col-span-12 flex h-[400px] flex-col overflow-hidden border border-divider bg-surface-container-low p-8 md:col-span-4">
          <h3 className="mb-8 font-label-caps text-label-caps uppercase text-primary">
            Recent activity
          </h3>
          <div className="space-y-6 overflow-y-auto pr-2">
            {overview.latest_blog_title && (
              <div className="flex gap-4 border-b border-divider pb-6">
                <span className="material-symbols-outlined mt-1 text-on-surface-variant">
                  article
                </span>
                <div>
                  <p className="text-sm font-medium text-on-surface">Latest journal post</p>
                  <p className="mt-1 font-label-caps text-[10px] uppercase text-on-surface-variant">
                    {overview.latest_blog_title}
                  </p>
                  {overview.latest_blog_slug && (
                    <Link
                      href={`/admin/blog/${overview.latest_blog_slug}/edit`}
                      className="mt-2 inline-block font-label-caps text-[10px] text-primary underline underline-offset-4"
                    >
                      Edit post
                    </Link>
                  )}
                </div>
              </div>
            )}
            {overview.recent_inquiries.map((item) => (
              <div key={item.id} className="flex gap-4 border-b border-divider pb-6">
                <span className="material-symbols-outlined mt-1 text-on-surface-variant">
                  rate_review
                </span>
                <div>
                  <p className="text-sm font-medium text-on-surface">
                    Inquiry from {item.name}
                  </p>
                  <p className="mt-1 font-label-caps text-[10px] uppercase text-on-surface-variant">
                    {item.service} · {new Date(item.created_at).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
            {overview.recent_inquiries.length === 0 && !overview.latest_blog_title && (
              <p className="font-body-md text-on-surface-variant">No recent activity yet.</p>
            )}
          </div>
        </div>
      </section>

      <section className="grid grid-cols-12 gap-gutter px-margin-desktop py-stack-lg">
        <div className="col-span-12 flex flex-col items-center justify-between gap-8 border border-divider bg-surface-container-low p-8 md:flex-row">
          <div className="w-full flex-1">
            <div className="mb-4 flex items-center justify-between">
              <h4 className="font-label-caps text-label-caps text-primary">STORAGE</h4>
              <span className="text-xs text-on-surface-variant">
                {formatBytes(overview.storage_bytes)} / {formatBytes(overview.storage_limit_bytes)}
              </span>
            </div>
            <div className="h-1 w-full overflow-hidden rounded-full bg-surface-container-highest">
              <div className="h-full bg-primary" style={{ width: `${storagePct}%` }} />
            </div>
          </div>
          <div className="flex w-full gap-8 border-divider-strong md:w-auto md:border-l md:pl-8">
            <div className="text-center">
              <p className="font-display-lg text-2xl leading-none text-primary">
                {overview.counts.photos}
              </p>
              <p className="mt-2 font-label-caps text-[10px] text-on-surface-variant">
                HERO
              </p>
            </div>
            <div className="text-center">
              <p className="font-display-lg text-2xl leading-none text-primary">
                {overview.counts.gallery}
              </p>
              <p className="mt-2 font-label-caps text-[10px] text-on-surface-variant">
                GALLERY
              </p>
            </div>
            <div className="text-center">
              <p className="font-display-lg text-2xl leading-none text-primary">
                {overview.counts.blog_posts}
              </p>
              <p className="mt-2 font-label-caps text-[10px] text-on-surface-variant">
                POSTS
              </p>
            </div>
            {overview.counts.featured > 0 && (
              <div className="text-center">
                <p className="font-display-lg text-2xl leading-none text-primary">
                  {overview.counts.featured}
                </p>
                <p className="mt-2 font-label-caps text-[10px] text-on-surface-variant">
                  FEATURED
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="col-span-12 grid gap-4 border border-divider bg-surface-container-low p-8 md:grid-cols-3">
          <MaintenanceLink
            href="/admin/series"
            title="Photo series"
            body="Visual essays that structure the public gallery — streets, craft, night."
          />
          <MaintenanceLink
            href="/admin/gallery"
            title="Gallery photos"
            body="Upload frames and assign them to a series from the upload form."
          />
          <MaintenanceLink
            href="/admin/settings"
            title="Site copy"
            body="Tagline, about, contact, and navigation — everything text-based."
          />
        </div>
      </section>

      <footer className="mt-auto flex w-full flex-col items-center justify-between border-t border-divider px-margin-desktop py-10 text-on-surface-variant opacity-60 md:flex-row">
        <p className="font-label-caps text-[10px] uppercase">
          © {new Date().getFullYear()} daathwi.jpg. All Rights Reserved.
        </p>
      </footer>
    </>
  );
}

function MaintenanceLink({
  href,
  title,
  body,
}: {
  href: string;
  title: string;
  body: string;
}) {
  return (
    <Link href={href} className="group block space-y-2 transition-colors hover:text-primary">
      <h4 className="font-label-caps text-label-caps text-primary group-hover:underline group-hover:underline-offset-4">
        {title}
      </h4>
      <p className="font-body-md text-sm text-on-surface-variant">{body}</p>
    </Link>
  );
}
