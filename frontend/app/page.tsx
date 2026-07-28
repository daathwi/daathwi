import Link from "next/link";
import { JournalImage, NewsletterForm } from "./components/ClientBits";
import FeaturedWorkGrid, {
  FeaturedWorkHeader,
} from "./components/FeaturedWorkGrid";
import Footer from "./components/Footer";
import Header from "./components/Header";
import HomeHero from "./components/home/HomeHero";
import ScrollProgress from "./components/home/ScrollProgress";
import MotionReveal from "./components/MotionReveal";
import SeriesIndex from "./components/SeriesIndex";
import {
  getBlogPosts,
  getFeaturedItems,
  getHeroImages,
  getLatestGallerySeries,
  getSiteSettings,
} from "../lib/server-data";

export const dynamic = "force-dynamic";

export default async function Home() {
  const [heroImages, featuredItems, latestSeries, blogPosts, site] = await Promise.all([
    getHeroImages(),
    getFeaturedItems(),
    getLatestGallerySeries(3),
    getBlogPosts(),
    getSiteSettings(),
  ]);

  const latestBlogs = blogPosts.slice(0, 3);

  return (
    <>
      <ScrollProgress />
      <Header />
      <main>
        <HomeHero images={heroImages} tagline={site.tagline} />

        {/* Practice intro */}
        <section className="border-b border-divider bg-surface-container-lowest py-stack-lg">
          <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
            <div className="grid grid-cols-1 gap-gutter md:grid-cols-12">
              <MotionReveal className="md:col-span-4">
                <span className="mb-3 block font-label-caps text-label-caps text-secondary">
                  The practice
                </span>
                <h2 className="font-headline-md text-headline-md leading-tight">
                  I photograph India as it moves.
                </h2>
              </MotionReveal>
              <MotionReveal className="md:col-span-7 md:col-start-6" delay={100}>
                <p className="font-body-lg text-body-lg leading-relaxed text-on-surface-variant">
                  Not monuments as postcards — the side light on a shoe seller, steam
                  lifting off chai, deep reds in a haveli wall, the pause between
                  strangers on a lane. Street photography, for me, is cultural texture
                  caught in motion.
                </p>
                <p className="mt-5 font-body-md leading-relaxed text-on-surface-variant">
                  Every frame is finished in Lightroom before it lands here or on{" "}
                  <a
                    href={site.instagramProof.url}
                    target="_blank"
                    rel="me noreferrer"
                    className="text-on-surface underline decoration-divider underline-offset-4 hover:decoration-primary"
                  >
                    {site.instagramProof.handle}
                  </a>
                  . Story first. Polish second.
                </p>
              </MotionReveal>
            </div>
          </div>
        </section>

        {latestSeries.length > 0 && (
          <section id="gallery" className="bg-background py-stack-lg">
            <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
              <MotionReveal className="mb-3 max-w-2xl">
                <span className="mb-1 block font-label-caps text-label-caps text-secondary">
                  STREET &amp; CULTURE
                </span>
                <h2 className="font-headline-sm text-headline-sm">Latest Series</h2>
                <p className="mt-3 font-body-md text-on-surface-variant">
                  Work is grouped as essays — Old Delhi lanes, monuments after dark,
                  craft and food — so each set reads as a story, not a random grid.
                </p>
              </MotionReveal>
              <MotionReveal className="mb-8 flex justify-end">
                <Link
                  href="/gallery"
                  className="motion-link-arrow shrink-0 font-label-caps text-label-caps text-on-surface-variant transition-colors hover:text-primary"
                >
                  View all series
                  <span className="motion-link-icon material-symbols-outlined ml-0.5 inline align-middle text-[16px]">
                    arrow_forward
                  </span>
                </Link>
              </MotionReveal>
              <SeriesIndex series={latestSeries} embedded />
            </div>
          </section>
        )}

        {/* What I look for */}
        <section className="border-y border-divider bg-background py-stack-lg">
          <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
            <MotionReveal className="mb-stack-md max-w-xl">
              <span className="mb-2 block font-label-caps text-label-caps text-secondary">
                On the street
              </span>
              <h2 className="font-headline-md text-headline-md leading-tight">
                What pulls me to raise the camera.
              </h2>
            </MotionReveal>
            <div className="grid grid-cols-1 gap-10 md:grid-cols-3 md:gap-gutter">
              {[
                {
                  title: "Light that arrives sideways",
                  body: "Late sun cutting a lane, a doorway holding shadow, blue hour settling on stone. Drama without staging.",
                },
                {
                  title: "Hands, steam, and ritual",
                  body: "Chai poured mid-air, dough slapped on a tawa, gold catching on a chain — culture lived, not posed.",
                },
                {
                  title: "People in their place",
                  body: "A glance, a wait, a walk home. Portraits that belong to the street they stand in.",
                },
              ].map((item, index) => (
                <MotionReveal key={item.title} delay={index * 90}>
                  <p className="mb-3 font-label-caps text-label-caps text-secondary">
                    {String(index + 1).padStart(2, "0")}
                  </p>
                  <h3 className="mb-3 font-headline-sm text-headline-sm text-primary">
                    {item.title}
                  </h3>
                  <p className="font-body-md leading-relaxed text-on-surface-variant">
                    {item.body}
                  </p>
                </MotionReveal>
              ))}
            </div>
          </div>
        </section>

        {latestBlogs.length > 0 && (
          <section id="journal" className="bg-background py-stack-lg">
            <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
              <MotionReveal className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div className="max-w-xl">
                  <span className="mb-1 block font-label-caps text-label-caps text-secondary">
                    JOURNAL
                  </span>
                  <h2 className="font-headline-sm text-headline-sm">Latest Posts</h2>
                  <p className="mt-3 font-body-md text-on-surface-variant">
                    Notes from the lane — technique, light, and the stories that sit
                    behind a single shutter click.
                  </p>
                </div>
                <Link
                  href="/blog"
                  className="motion-link-arrow shrink-0 font-label-caps text-label-caps text-on-surface-variant transition-colors hover:text-primary"
                >
                  View all
                  <span className="motion-link-icon material-symbols-outlined ml-0.5 inline align-middle text-[16px]">
                    arrow_forward
                  </span>
                </Link>
              </MotionReveal>
              <div className="grid grid-cols-1 gap-gutter md:grid-cols-3">
                {latestBlogs.map((post, index) => (
                  <MotionReveal key={post.id} delay={index * 80}>
                    <Link href={`/blog/${post.slug}`} className="group block">
                      <article>
                        <div className="relative mb-4 aspect-video overflow-hidden rounded-lg bg-surface-container">
                          <JournalImage src={post.image} alt={post.alt} />
                        </div>
                        <time className="mb-2 block font-label-caps text-label-caps text-on-surface-variant">
                          {post.date}
                        </time>
                        <h3 className="mb-2 font-headline-sm text-headline-sm transition-colors group-hover:text-primary">
                          {post.title}
                        </h3>
                        <p className="line-clamp-2 font-body-md text-body-md text-on-surface-variant">
                          {post.excerpt}
                        </p>
                      </article>
                    </Link>
                  </MotionReveal>
                ))}
              </div>
            </div>
          </section>
        )}

        {featuredItems.length > 0 && (
          <section className="bg-background py-stack-lg">
            <div className="mx-auto max-w-container-max px-margin-mobile md:px-margin-desktop">
              <FeaturedWorkHeader />
              <FeaturedWorkGrid items={featuredItems} />
            </div>
          </section>
        )}

        <section
          id="contact"
          className="border-t border-divider bg-surface-container-low py-stack-lg"
        >
          <div className="mx-auto max-w-container-max px-margin-mobile text-center md:px-margin-desktop">
            <MotionReveal className="mx-auto max-w-xl">
              <h2 className="mb-4 font-display-lg text-headline-md">Stay in the loop</h2>
              <p className="mb-8 font-body-md text-on-surface-variant">
                Occasional notes when a new series or journal piece goes up — no spam.
              </p>
              <NewsletterForm contactEmail={site.contactEmail} />
            </MotionReveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
