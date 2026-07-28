import Link from "next/link";
import Footer from "../components/Footer";
import Header from "../components/Header";
import MotionReveal from "../components/MotionReveal";
import { getSiteSettings } from "../../lib/server-data";

export const metadata = {
  title: "Privacy Policy | daathwi.jpg",
  description:
    "How daathwi.jpg collects, uses, and protects information when you visit the site or get in touch.",
};

export const dynamic = "force-dynamic";

export default async function PrivacyPage() {
  const site = await getSiteSettings();

  return (
    <>
      <Header />
      <main className="pb-stack-lg pt-40">
        <article className="mx-auto max-w-3xl px-margin-mobile md:px-margin-desktop">
          <MotionReveal>
            <p className="mb-3 font-label-caps text-label-caps text-secondary">
              Legal
            </p>
            <h1 className="mb-4 font-display-lg text-display-lg-mobile md:text-display-lg">
              Privacy Policy
            </h1>
            <p className="mb-stack-md font-body-md text-on-surface-variant">
              Last updated: July 28, 2026
            </p>
          </MotionReveal>

          <div className="space-y-10 font-body-md leading-relaxed text-on-surface-variant">
            <section className="space-y-3">
              <h2 className="font-headline-sm text-headline-sm text-primary">
                Overview
              </h2>
              <p>
                This Privacy Policy explains how Daathwi Naagh (&ldquo;I,&rdquo;
                &ldquo;me,&rdquo; or &ldquo;daathwi.jpg&rdquo;) handles information when
                you visit {site.domain}, browse the gallery and journal, or contact me.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-headline-sm text-headline-sm text-primary">
                Information I collect
              </h2>
              <p>I may collect:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>
                  <strong className="text-primary">Contact details</strong> you send
                  through the contact form or email — such as your name, email address,
                  and message.
                </li>
                <li>
                  <strong className="text-primary">Newsletter details</strong> if you
                  choose to reach out for updates (typically your email address).
                </li>
                <li>
                  <strong className="text-primary">Basic technical data</strong> that may
                  be collected automatically by hosting or analytics tools — such as IP
                  address, browser type, device type, and pages visited.
                </li>
              </ul>
              <p>
                I do not sell personal information. Photography on this site is my
                creative work; visitors are not required to create an account.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-headline-sm text-headline-sm text-primary">
                How I use information
              </h2>
              <ul className="list-disc space-y-2 pl-5">
                <li>To reply to inquiries and collaboration requests</li>
                <li>To operate and improve the website</li>
                <li>To understand how the site is used at a high level</li>
                <li>To protect the site against abuse or technical issues</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-headline-sm text-headline-sm text-primary">
                Cookies &amp; third parties
              </h2>
              <p>
                The site may use essential cookies or similar technologies required for
                basic functionality (for example, remembering theme preference). If
                analytics or hosting providers process technical data, they do so under
                their own privacy terms.
              </p>
              <p>
                Links to third-party sites such as Instagram open outside daathwi.jpg.
                Their privacy practices are not controlled by me.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-headline-sm text-headline-sm text-primary">
                Data retention
              </h2>
              <p>
                Contact messages and related correspondence are kept only as long as
                needed to respond and maintain a reasonable record of the conversation,
                unless a longer period is required for legal or security reasons.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-headline-sm text-headline-sm text-primary">
                Your choices
              </h2>
              <p>
                You can ask to access, correct, or delete personal information you have
                shared with me by emailing{" "}
                <a
                  href={`mailto:${site.contactEmail}`}
                  className="text-primary underline underline-offset-4"
                >
                  {site.contactEmail}
                </a>
                . I will respond within a reasonable time.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-headline-sm text-headline-sm text-primary">
                Changes
              </h2>
              <p>
                This policy may be updated from time to time. The &ldquo;Last
                updated&rdquo; date at the top will change when it does. Continued use
                of the site after updates means you accept the revised policy.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-headline-sm text-headline-sm text-primary">
                Contact
              </h2>
              <p>
                Questions about privacy:{" "}
                <a
                  href={`mailto:${site.contactEmail}`}
                  className="text-primary underline underline-offset-4"
                >
                  {site.contactEmail}
                </a>
                . You can also visit the{" "}
                <Link href="/contact" className="text-primary underline underline-offset-4">
                  contact page
                </Link>
                .
              </p>
            </section>
          </div>
        </article>
      </main>
      <Footer />
    </>
  );
}
