import Link from "next/link";
import { notFound } from "next/navigation";
import Footer from "../../components/Footer";
import GalleryGrid from "../../components/GalleryGrid";
import Header from "../../components/Header";
import MotionReveal from "../../components/MotionReveal";
import type { GalleryItem } from "../../../lib/types";
import {
  getGallerySeriesBySlug,
  getGallerySeriesGrouped,
} from "../../../lib/server-data";

type Props = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: Props) {
  const { slug } = await params;

  if (slug === "other") {
    return {
      title: "Other frames | daathwi.jpg",
      description: "Gallery photos not yet assigned to a photo essay.",
    };
  }

  const series = await getGallerySeriesBySlug(slug);
  if (!series) return { title: "Series | daathwi.jpg" };

  return {
    title: `${series.title} | daathwi.jpg`,
    description: series.subtitle || series.description || series.title,
  };
}

export default async function GallerySeriesPage({ params }: Props) {
  const { slug } = await params;

  if (slug === "other") {
    const { ungrouped } = await getGallerySeriesGrouped();
    if (ungrouped.length === 0) notFound();

    return (
      <SeriesLayout
        title="Other frames"
        subtitle="Photos not yet assigned to a series"
        description=""
        items={ungrouped}
      />
    );
  }

  const series = await getGallerySeriesBySlug(slug);
  if (!series || series.items.length === 0) notFound();

  return (
    <SeriesLayout
      title={series.title}
      subtitle={series.subtitle}
      description={series.description}
      items={series.items}
    />
  );
}

function SeriesLayout({
  title,
  subtitle,
  description,
  items,
}: {
  title: string;
  subtitle: string;
  description: string;
  items: GalleryItem[];
}) {
  return (
    <>
      <Header />
      <main className="pb-stack-lg pt-40">
        <section className="mx-auto mb-stack-md max-w-container-max px-margin-mobile md:px-margin-desktop">
          <MotionReveal>
            <h1 className="mb-4 max-w-3xl font-display-lg text-display-lg-mobile md:text-display-lg">
              {title}
            </h1>
            {subtitle ? (
              <p className="max-w-xl font-body-lg text-body-lg text-on-surface-variant">
                {subtitle}
              </p>
            ) : null}
            {description ? (
              <p className="mt-3 max-w-2xl font-body-md text-on-surface-variant">
                {description}
              </p>
            ) : null}
          </MotionReveal>
        </section>

        <GalleryGrid items={items} />

        <section className="mx-auto mt-stack-lg max-w-container-max px-margin-mobile md:px-margin-desktop">
          <Link
            href="/gallery"
            className="inline-flex items-center gap-2 font-label-caps text-label-caps text-primary underline underline-offset-4"
          >
            ← Back to all series
          </Link>
        </section>
      </main>
      <Footer />
    </>
  );
}
