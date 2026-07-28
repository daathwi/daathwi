"use client";

import Link from "next/link";
import type { GallerySeries } from "../../lib/types";
import { hasMediaSrc } from "../../lib/media";
import MotionReveal from "./MotionReveal";

type Props = {
  series: GallerySeries[];
  ungroupedCount?: number;
  /** Skip outer page margins when already inside a padded container. */
  embedded?: boolean;
};

export default function SeriesIndex({
  series,
  ungroupedCount = 0,
  embedded = false,
}: Props) {
  const shellClass = embedded
    ? ""
    : "mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop";

  if (series.length === 0 && ungroupedCount === 0) {
    return (
      <section className={shellClass}>
        <div className="border border-divider bg-surface-container-low px-8 py-stack-lg text-center">
          <p className="font-body-md text-on-surface-variant">
            No photo series yet. Create one from the admin panel.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className={shellClass}>
      <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
        {series.map((entry, index) => {
          const cover =
            entry.coverSrc ||
            entry.items.find((item) => hasMediaSrc(item.src))?.src ||
            "";
          const count = entry.items.length || entry.itemCount;

          return (
            <MotionReveal key={entry.id} variant="scale-in" delay={index * 80}>
              <Link
                href={`/gallery/${entry.slug}`}
                className="group block overflow-hidden rounded-lg border border-divider bg-surface-container"
              >
                <div className="relative aspect-[4/5] overflow-hidden bg-surface-container-low">
                  {hasMediaSrc(cover) ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={cover}
                      alt={entry.title}
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-on-surface-variant">
                      <span className="material-symbols-outlined text-[40px]">
                        collections
                      </span>
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                    <span className="mb-2 block font-label-caps text-label-caps text-hero-fg/70">
                      {count} frame{count === 1 ? "" : "s"}
                    </span>
                    <h2 className="font-headline-sm text-headline-sm text-hero-fg">
                      {entry.title}
                    </h2>
                    {entry.subtitle && (
                      <p className="mt-2 line-clamp-2 font-body-md text-sm text-hero-fg/70">
                        {entry.subtitle}
                      </p>
                    )}
                    <span className="mt-4 inline-flex items-center gap-1 font-label-caps text-label-caps text-hero-fg/85 transition-transform group-hover:translate-x-1">
                      Open series
                      <span className="material-symbols-outlined text-[16px]">
                        arrow_forward
                      </span>
                    </span>
                  </div>
                </div>
              </Link>
            </MotionReveal>
          );
        })}

        {ungroupedCount > 0 && (
          <MotionReveal variant="scale-in" delay={series.length * 80}>
            <Link
              href="/gallery/other"
              className="group block overflow-hidden rounded-lg border border-divider bg-surface-container-low"
            >
              <div className="relative flex aspect-[4/5] flex-col justify-end p-6 md:p-8">
                <span className="mb-2 block font-label-caps text-label-caps text-on-surface-variant">
                  {ungroupedCount} frame{ungroupedCount === 1 ? "" : "s"}
                </span>
                <h2 className="font-headline-sm text-headline-sm text-primary">
                  Other frames
                </h2>
                <p className="mt-2 font-body-md text-sm text-on-surface-variant">
                  Photos not yet assigned to a series.
                </p>
                <span className="mt-4 inline-flex items-center gap-1 font-label-caps text-label-caps text-primary transition-transform group-hover:translate-x-1">
                  Open gallery
                  <span className="material-symbols-outlined text-[16px]">
                    arrow_forward
                  </span>
                </span>
              </div>
            </Link>
          </MotionReveal>
        )}
      </div>
    </section>
  );
}
