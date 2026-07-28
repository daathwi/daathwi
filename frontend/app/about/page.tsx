import Link from "next/link";
import Footer from "../components/Footer";
import Header from "../components/Header";
import MotionReveal from "../components/MotionReveal";
import { getSiteSettings } from "../../lib/server-data";
import { hasMediaSrc } from "../../lib/media";

export const metadata = {
  title: "About | daathwi.jpg",
  description:
    "The story behind daathwi.jpg — why Daathwi Naagh photographs Indian streets, and what the work is about.",
};

export const dynamic = "force-dynamic";

function StoryPhoto({
  src,
  alt,
  className,
}: {
  src: string;
  alt: string;
  className?: string;
}) {
  return (
    <div className={`overflow-hidden bg-surface-container ${className ?? ""}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={alt} className="h-full w-full object-cover" />
    </div>
  );
}

export default async function AboutPage() {
  const site = await getSiteSettings();
  const { about } = site;

  const storyPhotos: { src: string; alt: string }[] = [];
  if (hasMediaSrc(about.profileImage)) {
    storyPhotos.push({ src: about.profileImage, alt: about.profileAlt || "Daathwi Naagh" });
  }
  for (const image of about.moodboard) {
    if (storyPhotos.length >= 3) break;
    if (hasMediaSrc(image.src)) {
      storyPhotos.push({ src: image.src, alt: image.alt || about.profileAlt || "Daathwi Naagh" });
    }
  }

  const paragraphs = about.missionParagraphs.filter(Boolean);
  const whyParagraph = paragraphs[0];
  const whatParagraphs = paragraphs.slice(1);

  return (
    <>
      <Header />

      <main className="pb-stack-lg pt-40">
        {/* Opening */}
        <section className="mx-auto mb-stack-md max-w-container-max px-margin-mobile md:px-margin-desktop">
          <MotionReveal className="max-w-3xl">
            <span className="mb-3 block font-label-caps text-label-caps text-secondary">
              About
            </span>
            <h1 className="mb-6 font-display-lg text-display-lg-mobile md:text-display-lg">
              {about.heroTitle}
            </h1>
            {about.heroQuote && (
              <p className="max-w-2xl font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
                {about.heroQuote.replace(/^["“]|["”]$/g, "")}
              </p>
            )}
          </MotionReveal>
        </section>

        {/* 2–3 photos of me */}
        <section className="mx-auto mb-stack-lg max-w-container-max px-margin-mobile md:px-margin-desktop">
          {storyPhotos.length > 0 ? (
            <div
              className={`grid gap-gutter ${
                storyPhotos.length === 1
                  ? "md:grid-cols-2"
                  : storyPhotos.length === 2
                    ? "md:grid-cols-2"
                    : "grid-cols-1 md:grid-cols-12"
              }`}
            >
              {storyPhotos.length === 3 ? (
                <>
                  <MotionReveal className="md:col-span-7" variant="scale-in">
                    <StoryPhoto
                      src={storyPhotos[0].src}
                      alt={storyPhotos[0].alt}
                      className="aspect-[4/5] md:aspect-[5/6]"
                    />
                  </MotionReveal>
                  <div className="grid gap-gutter md:col-span-5">
                    <MotionReveal delay={80} variant="scale-in">
                      <StoryPhoto
                        src={storyPhotos[1].src}
                        alt={storyPhotos[1].alt}
                        className="aspect-[4/5]"
                      />
                    </MotionReveal>
                    <MotionReveal delay={140} variant="scale-in">
                      <StoryPhoto
                        src={storyPhotos[2].src}
                        alt={storyPhotos[2].alt}
                        className="aspect-[4/5]"
                      />
                    </MotionReveal>
                  </div>
                </>
              ) : (
                storyPhotos.map((photo, index) => (
                  <MotionReveal key={photo.src} delay={index * 80} variant="scale-in">
                    <StoryPhoto
                      src={photo.src}
                      alt={photo.alt}
                      className={
                        storyPhotos.length === 1
                          ? "aspect-[4/5] md:col-span-1"
                          : "aspect-[4/5]"
                      }
                    />
                  </MotionReveal>
                ))
              )}
            </div>
          ) : (
            <div className="border border-dashed border-divider bg-surface-container-low px-8 py-16 text-center">
              <p className="font-body-md text-on-surface-variant">
                Add 2–3 photos of you in Admin → Settings → About to complete this page.
              </p>
            </div>
          )}
        </section>

        {/* Why */}
        <section className="border-y border-divider bg-surface-container-lowest py-stack-lg">
          <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
            <div className="grid grid-cols-1 gap-gutter md:grid-cols-12">
              <MotionReveal className="md:col-span-4">
                <span className="mb-3 block font-label-caps text-label-caps text-secondary">
                  Why
                </span>
                <h2 className="font-headline-md text-headline-md leading-tight">
                  {about.missionTitle}
                </h2>
              </MotionReveal>
              <MotionReveal className="md:col-span-7 md:col-start-6" delay={80}>
                {whyParagraph ? (
                  <p className="font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
                    {whyParagraph}
                  </p>
                ) : (
                  <p className="font-body-md text-on-surface-variant">
                    Add your story in Admin → Settings → About.
                  </p>
                )}
              </MotionReveal>
            </div>
          </div>
        </section>

        {/* What */}
        {whatParagraphs.length > 0 && (
          <section className="bg-background py-stack-lg">
            <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
              <div className="grid grid-cols-1 gap-gutter md:grid-cols-12">
                <MotionReveal className="md:col-span-4">
                  <span className="mb-3 block font-label-caps text-label-caps text-secondary">
                    What
                  </span>
                  <h2 className="font-headline-md text-headline-md leading-tight">
                    The work you see here.
                  </h2>
                </MotionReveal>
                <MotionReveal className="md:col-span-7 md:col-start-6 space-y-6" delay={80}>
                  {whatParagraphs.map((paragraph) => (
                    <p
                      key={paragraph.slice(0, 48)}
                      className="font-body-lg text-body-lg leading-relaxed text-on-surface-variant"
                    >
                      {paragraph}
                    </p>
                  ))}
                </MotionReveal>
              </div>
            </div>
          </section>
        )}

        {/* Soft close */}
        <section className="border-t border-divider bg-background py-stack-lg">
          <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
            <MotionReveal className="max-w-2xl">
              <h2 className="mb-4 font-headline-sm text-headline-sm text-primary">
                If a frame stays with you
              </h2>
              <p className="mb-8 font-body-md leading-relaxed text-on-surface-variant">
                Walk the gallery essays, read the journal, or say hello — collaborations
                and photowalks are welcome when the timing fits.
              </p>
              <div className="flex flex-wrap gap-6">
                <Link
                  href="/gallery"
                  className="font-label-caps text-label-caps text-primary underline underline-offset-4"
                >
                  View series
                </Link>
                <Link
                  href="/contact"
                  className="font-label-caps text-label-caps text-on-surface-variant transition-colors hover:text-primary"
                >
                  Get in touch
                </Link>
                <a
                  href={site.instagramUrl}
                  target="_blank"
                  rel="me noreferrer"
                  className="font-label-caps text-label-caps text-on-surface-variant transition-colors hover:text-primary"
                >
                  {site.instagramProof.handle}
                </a>
              </div>
            </MotionReveal>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
