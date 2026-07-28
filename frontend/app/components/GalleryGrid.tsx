"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { GalleryItem } from "../../lib/types";
import { hasMediaSrc } from "../../lib/media";
import MotionReveal from "./MotionReveal";

function GalleryImage({ src, alt }: { src: string; alt: string }) {
  if (!hasMediaSrc(src)) {
    return <div className="h-full w-full bg-surface-container" aria-hidden />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover transition-custom"
    />
  );
}

function GalleryLightbox({
  items,
  index,
  onClose,
  onPrev,
  onNext,
}: {
  items: GalleryItem[];
  index: number;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
}) {
  const item = items[index];
  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex flex-col bg-black/92"
      role="dialog"
      aria-modal="true"
      aria-label={item.title || item.alt}
    >
      <div className="flex items-center justify-between gap-4 px-4 py-4 md:px-8">
        <div className="min-w-0">
          <p className="truncate font-label-caps text-[10px] tracking-[0.2em] text-white/50">
            {item.tag} · {String(index + 1).padStart(2, "0")} /{" "}
            {String(items.length).padStart(2, "0")}
          </p>
          <h2 className="truncate font-headline-sm text-body-lg text-white">
            {item.title || item.alt}
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close lightbox"
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded border border-white/20 text-white transition-colors hover:bg-white/10"
        >
          <span className="material-symbols-outlined text-[22px]">close</span>
        </button>
      </div>

      <div className="relative flex min-h-0 flex-1 items-center justify-center px-4 pb-8 md:px-16">
        {items.length > 1 && (
          <>
            <button
              type="button"
              onClick={onPrev}
              aria-label="Previous photo"
              className="absolute left-2 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-white/10 md:left-6"
            >
              <span className="material-symbols-outlined">chevron_left</span>
            </button>
            <button
              type="button"
              onClick={onNext}
              aria-label="Next photo"
              className="absolute right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-white/10 md:right-6"
            >
              <span className="material-symbols-outlined">chevron_right</span>
            </button>
          </>
        )}

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.src}
          alt={item.alt}
          className="max-h-full max-w-full object-contain"
        />
      </div>

      {(item.description || item.permalink) && (
        <div className="flex flex-col gap-3 border-t border-white/10 px-4 py-4 md:flex-row md:items-center md:justify-between md:px-8">
          {item.description ? (
            <p className="max-w-2xl font-body-md text-sm text-white/65">
              {item.description}
            </p>
          ) : (
            <span />
          )}
          {item.permalink && (
            <a
              href={item.permalink}
              target="_blank"
              rel="noreferrer"
              className="shrink-0 font-label-caps text-[11px] tracking-widest text-white/80 underline underline-offset-4 hover:text-white"
            >
              Open original →
            </a>
          )}
        </div>
      )}
    </div>
  );
}

export default function GalleryGrid({ items }: { items: GalleryItem[] }) {
  const categories = useMemo(() => {
    const set = new Set(items.map((item) => item.category).filter(Boolean));
    return ["All", ...Array.from(set).sort()];
  }, [items]);

  const [active, setActive] = useState("All");
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  const filtered = useMemo(
    () =>
      active === "All" ? items : items.filter((item) => item.category === active),
    [active, items],
  );

  const closeLightbox = useCallback(() => setLightboxIndex(null), []);
  const showPrev = useCallback(() => {
    setLightboxIndex((i) =>
      i === null ? null : (i - 1 + filtered.length) % filtered.length,
    );
  }, [filtered.length]);
  const showNext = useCallback(() => {
    setLightboxIndex((i) => (i === null ? null : (i + 1) % filtered.length));
  }, [filtered.length]);

  useEffect(() => {
    setLightboxIndex(null);
  }, [active]);

  useEffect(() => {
    if (lightboxIndex === null) return;

    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeLightbox();
      if (e.key === "ArrowLeft") showPrev();
      if (e.key === "ArrowRight") showNext();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKey);
    };
  }, [lightboxIndex, closeLightbox, showPrev, showNext]);

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
        <div className="border border-divider bg-surface-container-low px-8 py-stack-lg text-center">
          <p className="font-body-md text-on-surface-variant">
            No gallery photos yet. Upload from the admin panel.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
      {categories.length > 2 && (
        <div className="mb-stack-md flex flex-wrap gap-2">
          {categories.map((category) => {
            const isActive = active === category;
            return (
              <button
                key={category}
                type="button"
                onClick={() => setActive(category)}
                className={`border px-4 py-2 font-label-caps text-[11px] tracking-widest transition-colors ${
                  isActive
                    ? "border-primary bg-primary text-on-primary"
                    : "border-divider text-on-surface-variant hover:border-divider-emphasis hover:text-primary"
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="border border-divider bg-surface-container-low px-8 py-stack-md text-center">
          <p className="font-body-md text-on-surface-variant">
            No photos in this category yet.
          </p>
        </div>
      ) : (
        <div className="columns-1 gap-gutter md:columns-3">
          {filtered.map((item, index) => (
            <div key={item.id} className="mb-gutter break-inside-avoid">
              <MotionReveal variant="fade-up" delay={(index % 6) * 70}>
                <button
                  type="button"
                  onClick={() => setLightboxIndex(index)}
                  className="gallery-item group relative block w-full overflow-hidden text-left"
                  style={{ aspectRatio: item.aspectRatio }}
                  aria-label={`View ${item.title || item.alt}`}
                >
                  <GalleryImage src={item.src} alt={item.title || item.alt} />
                  <div className="gallery-overlay absolute inset-0 flex flex-col justify-end bg-background/40 p-stack-sm opacity-0 transition-custom">
                    <span className="mb-1 font-label-caps text-label-caps uppercase text-hero-fg/80">
                      {item.tag}
                    </span>
                    <h3 className="font-headline-sm text-headline-sm text-hero-fg">
                      {item.title}
                    </h3>
                  </div>
                </button>
              </MotionReveal>
            </div>
          ))}
        </div>
      )}

      {lightboxIndex !== null && (
        <GalleryLightbox
          items={filtered}
          index={lightboxIndex}
          onClose={closeLightbox}
          onPrev={showPrev}
          onNext={showNext}
        />
      )}
    </section>
  );
}
