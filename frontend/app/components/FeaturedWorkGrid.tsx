"use client";

import Image from "next/image";
import Link from "next/link";
import type { FeaturedItem } from "../../lib/types";
import { hasMediaSrc } from "../../lib/media";
import MotionReveal from "./MotionReveal";

function isAppLocalSrc(src: string) {
  return src.startsWith("/") && !src.startsWith("//") && !src.startsWith("/uploads/");
}

function FeaturedImage({ src, alt }: { src: string; alt: string }) {
  if (!hasMediaSrc(src)) {
    return <div className="h-full w-full bg-surface-container" aria-hidden />;
  }

  if (isAppLocalSrc(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-transform duration-700 group-hover:scale-105"
        sizes="(max-width: 768px) 100vw, 33vw"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
    />
  );
}

export default function FeaturedWorkGrid({ items }: { items: FeaturedItem[] }) {
  return (
    <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3">
      {items.map((item, index) => {
        const inner = (
          <>
            <div className="relative h-full w-full overflow-hidden">
              <FeaturedImage src={item.src} alt={item.alt} />
            </div>
            <div className="absolute inset-0 flex flex-col justify-end bg-gradient-to-t from-black/80 via-transparent to-transparent p-8 opacity-0 transition-opacity duration-500 group-hover:opacity-100">
              <span className="mb-2 font-label-caps text-label-caps uppercase text-secondary">
                {item.collection}
              </span>
              <h3 className="font-headline-sm text-headline-sm">{item.title}</h3>
              <p className="mt-2 text-label-caps opacity-80">{item.subtitle}</p>
            </div>
          </>
        );

        const className = `group relative aspect-[4/5] overflow-hidden matted-frame${
          item.offset ? " lg:translate-y-12" : ""
        }`;

        const card =
          item.permalink ? (
            <a
              href={item.permalink}
              target="_blank"
              rel="noreferrer"
              className={className}
            >
              {inner}
            </a>
          ) : (
            <div className={className}>{inner}</div>
          );

        return (
          <MotionReveal key={item.id} variant="scale-in" delay={index * 90}>
            {card}
          </MotionReveal>
        );
      })}
    </div>
  );
}

export function FeaturedWorkHeader() {
  return (
    <MotionReveal className="mb-stack-md flex items-end justify-between">
      <div>
        <span className="mb-2 block font-label-caps text-label-caps text-secondary">
          STORIES
        </span>
        <h2 className="font-display-lg text-headline-md">Featured essays</h2>
      </div>
      <Link
        href="/gallery"
        className="motion-link-arrow border-b border-divider-strong pb-1 font-label-caps text-label-caps transition-colors hover:border-primary"
      >
        Full gallery
        <span className="motion-link-icon material-symbols-outlined ml-1 inline-block align-middle text-[14px]">
          arrow_forward
        </span>
      </Link>
    </MotionReveal>
  );
}
