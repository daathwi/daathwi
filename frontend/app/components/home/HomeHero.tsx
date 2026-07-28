"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { hasMediaSrc } from "../../../lib/media";

export type HeroSlide = {
  src: string;
  srcMobile: string;
  alt: string;
};

const SLIDE_MS = 7000;

function HeroSlideImage({
  src,
  alt,
  priority,
  sizes = "100vw",
}: {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
}) {
  if (!hasMediaSrc(src)) {
    return <div className="h-full w-full bg-surface-container-high" aria-hidden />;
  }

  if (src.startsWith("/") && !src.startsWith("//") && !src.includes("/uploads/")) {
    return (
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className="hero-slide-media object-cover object-center"
        sizes={sizes}
      />
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt}
      className="hero-slide-media h-full w-full object-cover object-center"
    />
  );
}

function HeroSlides({
  images,
  index,
  isCarousel,
  imageSrc,
  sizes,
}: {
  images: HeroSlide[];
  index: number;
  isCarousel: boolean;
  imageSrc: (slide: HeroSlide) => string;
  sizes?: string;
}) {
  const count = images.length;

  if (count === 0) {
    return (
      <div className="h-full w-full bg-gradient-to-br from-surface-container-low via-background to-surface-container-high" />
    );
  }

  if (!isCarousel) {
    return (
      <div className="hero-slide-active relative h-full w-full overflow-hidden">
        <HeroSlideImage
          src={imageSrc(images[0])}
          alt={images[0].alt}
          priority
          sizes={sizes}
        />
      </div>
    );
  }

  return (
    <>
      {images.map((image, i) => (
        <div
          key={`${imageSrc(image)}-${i}`}
          className={`absolute inset-0 overflow-hidden transition-opacity duration-[1400ms] ease-in-out ${
            i === index ? "hero-slide-active opacity-100" : "opacity-0"
          }`}
          aria-hidden={i !== index}
        >
          <HeroSlideImage
            src={imageSrc(image)}
            alt={image.alt}
            priority={i === 0}
            sizes={sizes}
          />
        </div>
      ))}
    </>
  );
}

function HeroProgress({
  images,
  index,
  count,
  isCarousel,
  onSelect,
  variant,
}: {
  images: HeroSlide[];
  index: number;
  count: number;
  isCarousel: boolean;
  onSelect: (i: number) => void;
  variant: "mobile" | "desktop";
}) {
  if (!isCarousel) return null;

  if (variant === "mobile") {
    return (
      <div className="absolute inset-x-0 bottom-4 z-20 flex items-center justify-center gap-2">
        {images.map((image, i) => (
          <button
            key={`hero-dot-${image.src}-${i}`}
            type="button"
            aria-label={`Show slide ${i + 1} of ${count}`}
            aria-current={i === index ? "true" : undefined}
            onClick={() => onSelect(i)}
            className={`rounded-full transition-all duration-300 ${
              i === index ? "h-2 w-7 bg-hero-fg" : "h-2 w-2 bg-hero-fg/40"
            }`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className="absolute inset-x-0 bottom-0 z-20 flex h-[3px]">
      {images.map((image, i) => (
        <button
          key={`hero-seg-${image.src}-${i}`}
          type="button"
          aria-label={`Show slide ${i + 1} of ${count}`}
          aria-current={i === index ? "true" : undefined}
          onClick={() => onSelect(i)}
          className="group flex-1 bg-hero-fg/15"
        >
          <span
            key={i === index ? `active-${index}` : `idle-${i}`}
            className={`block h-full origin-left ${
              i === index
                ? "hero-segment-active bg-hero-fg/90"
                : "w-0 bg-hero-fg/90 group-hover:w-full group-hover:bg-hero-fg/50"
            }`}
          />
        </button>
      ))}
    </div>
  );
}

type Props = {
  images: HeroSlide[];
  tagline: string;
};

export default function HomeHero({ images, tagline }: Props) {
  const count = images.length;
  const isCarousel = count >= 2;
  const [index, setIndex] = useState(0);

  const goTo = useCallback(
    (next: number) => {
      if (count === 0) return;
      setIndex((next + count) % count);
    },
    [count],
  );

  useEffect(() => {
    if (!isCarousel) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const timer = window.setInterval(() => {
      setIndex((current) => (current + 1) % count);
    }, SLIDE_MS);

    return () => window.clearInterval(timer);
  }, [isCarousel, count]);

  const current = images[index];
  const resolvedTagline =
    tagline ||
    "Street photography and visual stories from across India — captured by Daathwi Naagh.";

  return (
    <section className="w-full">
      {/* —— Mobile & tablet: stacked photo + copy —— */}
      <div className="lg:hidden">
        <div className="relative w-full overflow-hidden bg-surface-container md:bg-background md:px-margin-desktop md:py-8">
          <div className="relative mx-auto aspect-[9/16] w-full max-h-[min(62vh,720px)] overflow-hidden md:aspect-[4/5] md:max-h-[min(56vh,680px)] md:max-w-xl md:rounded-lg md:border md:border-divider md:shadow-sm">
            <HeroSlides
              images={images}
              index={index}
              isCarousel={isCarousel}
              imageSrc={(slide) => slide.srcMobile}
              sizes="(max-width: 768px) 100vw, 512px"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-black/15" />
            <HeroProgress
              images={images}
              index={index}
              count={count}
              isCarousel={isCarousel}
              onSelect={goTo}
              variant="mobile"
            />
          </div>
        </div>

        <div className="bg-background px-margin-mobile pb-stack-md pt-stack-md md:px-margin-desktop md:pb-stack-lg md:pt-stack-lg">
          <div className="mx-auto w-full max-w-container-max md:max-w-xl md:text-center lg:max-w-none lg:text-left">
            <span className="mb-3 block font-label-caps text-label-caps text-secondary">
              daathwi.jpg
            </span>
            <h1 className="mb-4 font-display-lg text-display-lg-mobile leading-[1.08] text-primary md:text-[2.5rem]">
              Street stories from{" "}
              <span className="italic text-secondary">across India.</span>
            </h1>
            <p className="mb-8 font-body-md text-body-md leading-relaxed text-on-surface-variant md:mx-auto md:max-w-md">
              {resolvedTagline}
            </p>
            <Link
              href="/gallery"
              className="motion-link-arrow inline-flex items-center gap-2 bg-primary px-8 py-3 font-label-caps text-label-caps text-on-primary transition-opacity hover:opacity-90"
            >
              View gallery
              <span className="motion-link-icon">→</span>
            </Link>
            {current?.alt && count > 0 && (
              <p className="mt-6 font-label-caps text-label-caps text-on-surface-variant/70 md:text-center">
                {current.alt}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* —— Desktop: full-bleed cinematic —— */}
      <div className="relative hidden h-[100svh] min-h-[560px] w-full overflow-hidden lg:block">
        <div className="absolute inset-0">
          <HeroSlides
            images={images}
            index={index}
            isCarousel={isCarousel}
            imageSrc={(slide) => slide.src}
            sizes="100vw"
          />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/75 via-black/30 to-black/10" />
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-black/35" />
        </div>

        <div className="relative z-10 flex h-full items-center px-margin-desktop pt-28">
          <div className="mx-auto w-full max-w-container-max">
            <div className="hero-reveal max-w-2xl">
              <h1 className="mb-6 font-display-lg text-display-lg leading-[1.05] tracking-tight text-hero-fg">
                Street stories from{" "}
                <span className="italic text-hero-fg/90">across India.</span>
              </h1>
              <p className="mb-10 max-w-lg font-body-lg text-body-lg leading-relaxed text-hero-fg/75">
                {resolvedTagline}
              </p>
              <Link
                href="/gallery"
                className="motion-link-arrow inline-flex items-center gap-3 font-label-caps text-label-caps tracking-[0.2em] text-hero-fg transition-colors hover:text-hero-fg/80"
              >
                View gallery
                <span className="motion-link-icon text-lg">→</span>
              </Link>
            </div>
          </div>
        </div>

        {current?.alt && count > 0 && (
          <p className="pointer-events-none absolute bottom-10 right-16 z-10 max-w-xs text-right font-label-caps text-label-caps leading-relaxed text-hero-fg/45">
            {current.alt}
          </p>
        )}

        <HeroProgress
          images={images}
          index={index}
          count={count}
          isCarousel={isCarousel}
          onSelect={goTo}
          variant="desktop"
        />
      </div>
    </section>
  );
}
