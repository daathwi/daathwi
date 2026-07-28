import Link from "next/link";
import Footer from "../components/Footer";
import Header from "../components/Header";
import MotionReveal from "../components/MotionReveal";
import { getSiteSettings } from "../../lib/server-data";

export const metadata = {
  title: "FAQ | daathwi.jpg",
  description:
    "Common questions about daathwi.jpg — street photography, series, collaborations, and contact.",
};

export const dynamic = "force-dynamic";

const FAQS = [
  {
    q: "What kind of photography is this?",
    a: "Indian street and cultural stories — everyday light, texture, motion, and place. Work is organized as photo essays (series) rather than a generic catch-all gallery.",
  },
  {
    q: "How is the gallery organized?",
    a: "Open Gallery to see series first. Each series is a visual narrative. Click a series to view its frames in a full gallery with lightbox.",
  },
  {
    q: "Can I use an image from the site?",
    a: "All images are copyrighted. Personal browsing is welcome. Any other use needs prior written permission — reach out via the contact page with the image and intended use.",
  },
  {
    q: "Do you take commissions or collaborations?",
    a: "Select photowalks, cultural assignments, and collaborations may be possible depending on timing and fit. Send a short note through Contact with what you have in mind.",
  },
  {
    q: "Where else can I see new work?",
    a: "The journal on this site shares writing behind the frames. Daily sketches and newer frames often appear on Instagram as well.",
  },
  {
    q: "How do I get in touch?",
    a: "Use the Contact page or email directly. Include context — collaboration, assignment, or a general question — so the reply can be useful.",
  },
  {
    q: "Is the site affiliated with a studio or agency?",
    a: "No. daathwi.jpg is the personal portfolio of Daathwi Naagh.",
  },
] as const;

export default async function FaqPage() {
  const site = await getSiteSettings();

  return (
    <>
      <Header />
      <main className="pb-stack-lg pt-40">
        <section className="mx-auto mb-stack-md max-w-3xl px-margin-mobile md:px-margin-desktop">
          <MotionReveal>
            <p className="mb-3 font-label-caps text-label-caps text-secondary">
              Help
            </p>
            <h1 className="mb-4 font-display-lg text-display-lg-mobile md:text-display-lg">
              FAQ
            </h1>
            <p className="max-w-xl font-body-lg text-body-lg text-on-surface-variant">
              Quick answers about the work, the site, and how to reach out.
            </p>
          </MotionReveal>
        </section>

        <section className="mx-auto max-w-3xl space-y-0 px-margin-mobile md:px-margin-desktop">
          {FAQS.map((item, index) => (
            <MotionReveal
              key={item.q}
              delay={index * 40}
              className="border-t border-divider py-8"
            >
              <h2 className="mb-3 font-headline-sm text-headline-sm text-primary">
                {item.q}
              </h2>
              <p className="font-body-md leading-relaxed text-on-surface-variant">
                {item.a}
              </p>
            </MotionReveal>
          ))}
          <div className="border-t border-divider pt-8">
            <p className="font-body-md text-on-surface-variant">
              Still have a question?{" "}
              <Link href="/contact" className="text-primary underline underline-offset-4">
                Contact
              </Link>{" "}
              or email{" "}
              <a
                href={`mailto:${site.contactEmail}`}
                className="text-primary underline underline-offset-4"
              >
                {site.contactEmail}
              </a>
              .
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
