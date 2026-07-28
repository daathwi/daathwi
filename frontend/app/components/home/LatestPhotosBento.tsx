"use client";

import Link from "next/link";
import type { GalleryItem } from "../../../lib/types";
import { hasMediaSrc } from "../../../lib/media";
import MotionReveal from "../MotionReveal";

function cellLayout(index: number, total: number): string {
  if (total === 1) {
    return "col-span-12 min-h-[360px]";
  }
  if (total === 2) {
    return index === 0
      ? "col-span-12 min-h-[280px] md:col-span-7 md:min-h-[400px]"
      : "col-span-12 min-h-[280px] md:col-span-5 md:min-h-[400px]";
  }

  const layouts = [
    "col-span-12 h-full min-h-[280px] md:col-span-8 md:row-span-2 md:min-h-0",
    "col-span-12 h-full min-h-[200px] md:col-span-4",
    "col-span-12 h-full min-h-[200px] md:col-span-4",
    "col-span-12 h-full min-h-[200px] md:col-span-5",
    "col-span-12 h-full min-h-[200px] md:col-span-7",
  ];

  return layouts[index] ?? "col-span-12 min-h-[200px] md:col-span-4";
}

function BentoImage({ src, alt }: { src: string; alt: string }) {
  if (!hasMediaSrc(src)) {
    return <div className="h-full w-full bg-surface-container" aria-hidden />;
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
    />
  );
}

function BentoCell({ item }: { item: GalleryItem }) {
  const inner = (
    <article className="bento-card group relative h-full min-h-[inherit] overflow-hidden rounded-lg border border-divider bg-surface-container">
      <BentoImage src={item.src} alt={item.title || item.alt} />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
      <div className="absolute inset-0 flex flex-col justify-end p-6 md:p-8">
        <span className="mb-2 font-label-caps text-label-caps uppercase text-hero-fg/75">
          {item.tag}
        </span>
        <h3 className="font-headline-sm text-headline-sm text-hero-fg">{item.title}</h3>
        {item.description && (
          <p className="mt-2 line-clamp-2 max-w-md font-body-md text-body-md text-hero-fg/70 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
            {item.description}
          </p>
        )}
      </div>
    </article>
  );

  if (item.permalink) {
    return (
      <a href={item.permalink} target="_blank" rel="noreferrer" className="block h-full">
        {inner}
      </a>
    );
  }

  return (
    <Link href="/gallery" className="block h-full">
      {inner}
    </Link>
  );
}

export default function LatestPhotosBento({ items }: { items: GalleryItem[] }) {
  const frames = items.slice(0, 3);
  const useTwoRowGrid = frames.length >= 3;

  return (
    <div
      className={`grid grid-cols-12 gap-gutter${
        useTwoRowGrid ? " md:grid-rows-2 md:min-h-[440px]" : ""
      }`}
    >
      {frames.map((item, index) => (
        <MotionReveal
          key={item.id}
          variant="scale-in"
          delay={index * 80}
          className={cellLayout(index, frames.length)}
        >
          <BentoCell item={item} />
        </MotionReveal>
      ))}
    </div>
  );
}
