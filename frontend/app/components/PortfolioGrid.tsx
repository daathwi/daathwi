"use client";

import Image from "next/image";
import type { BentoPhoto } from "../../lib/types";
import { hasMediaSrc } from "../../lib/media";

function isAppLocalSrc(src: string) {
  return src.startsWith("/") && !src.startsWith("//") && !src.startsWith("/uploads/");
}

function PortfolioImage({ src, alt }: { src: string; alt: string }) {
  if (!hasMediaSrc(src)) {
    return <div className="h-full w-full bg-surface-container" aria-hidden />;
  }

  if (isAppLocalSrc(src)) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-custom"
        sizes="(max-width: 768px) 100vw, 50vw"
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} className="h-full w-full object-cover transition-custom" />
  );
}

export default function PortfolioGrid({ photos }: { photos: BentoPhoto[] }) {
  if (photos.length === 0) {
    return (
      <section className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
        <div className="border border-divider bg-surface-container-low px-8 py-stack-lg text-center">
          <p className="font-body-md text-on-surface-variant">
            No photos yet. Upload hero photos from the admin panel.
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
      <div className="grid grid-cols-1 gap-gutter sm:grid-cols-2 lg:grid-cols-3">
        {photos.map((photo) => {
          const content = (
            <div className="gallery-item group relative aspect-[4/5] overflow-hidden">
              <div className="relative h-full w-full">
                <PortfolioImage src={photo.src} alt={photo.alt} />
              </div>
              <div className="gallery-overlay absolute inset-0 flex flex-col justify-end bg-background/40 p-stack-sm opacity-0 transition-custom">
                <h3 className="font-headline-sm text-headline-sm text-white">{photo.alt}</h3>
              </div>
            </div>
          );

          if (photo.permalink) {
            return (
              <a
                key={photo.id}
                href={photo.permalink}
                target="_blank"
                rel="noreferrer"
                className="block"
              >
                {content}
              </a>
            );
          }

          return <div key={photo.id}>{content}</div>;
        })}
      </div>
    </section>
  );
}
