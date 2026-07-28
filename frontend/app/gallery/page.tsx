import Footer from "../components/Footer";
import Header from "../components/Header";
import MotionReveal from "../components/MotionReveal";
import SeriesIndex from "../components/SeriesIndex";
import { getGallerySeriesGrouped } from "../../lib/server-data";

export const metadata = {
  title: "Gallery | daathwi.jpg",
  description:
    "Indian street photography essays — visual narratives of streets, craft, night, and culture by Daathwi Naagh.",
};

export const dynamic = "force-dynamic";

export default async function GalleryPage() {
  const { series, ungrouped } = await getGallerySeriesGrouped();

  return (
    <>
      <Header />
      <main className="pb-stack-lg pt-40">
        <section className="mx-auto mb-stack-md max-w-container-max px-margin-mobile md:px-margin-desktop">
          <MotionReveal>
            <h1 className="mb-5 max-w-3xl font-display-lg text-display-lg-mobile md:text-display-lg">
              Street &amp; culture
            </h1>
            <p className="max-w-xl font-body-lg text-body-lg text-on-surface-variant">
              Photo essays from across India. Open a series to step into the story.
            </p>
          </MotionReveal>
        </section>

        <SeriesIndex series={series} ungroupedCount={ungrouped.length} />
      </main>
      <Footer />
    </>
  );
}
