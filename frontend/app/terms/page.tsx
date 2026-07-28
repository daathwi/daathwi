import Link from "next/link";
import Footer from "../components/Footer";
import Header from "../components/Header";
import MotionReveal from "../components/MotionReveal";
import { getSiteSettings } from "../../lib/server-data";

export const metadata = {
  title: "Terms of Service | daathwi.jpg",
  description:
    "Terms for using daathwi.jpg — website access, image rights, and contact guidelines.",
};

export const dynamic = "force-dynamic";

export default async function TermsPage() {
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
              Terms of Service
            </h1>
            <p className="mb-stack-md font-body-md text-on-surface-variant">
              Last updated: July 28, 2026
            </p>
          </MotionReveal>

          <div className="space-y-10 font-body-md leading-relaxed text-on-surface-variant">
            <section className="space-y-3">
              <h2 className="font-headline-sm text-headline-sm text-primary">
                Agreement
              </h2>
              <p>
                By using {site.domain} (the &ldquo;Site&rdquo;), you agree to these Terms
                of Service. If you do not agree, please do not use the Site.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-headline-sm text-headline-sm text-primary">
                The Site
              </h2>
              <p>
                daathwi.jpg is a personal photography portfolio showcasing Indian street
                and cultural stories by Daathwi Naagh. Content may change, and features
                may be added or removed without notice.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-headline-sm text-headline-sm text-primary">
                Intellectual property
              </h2>
              <p>
                All photographs, text, design, branding, and other materials on the Site
                are owned by Daathwi Naagh unless otherwise noted. You may view content
                for personal, non-commercial browsing.
              </p>
              <p>You may not, without prior written permission:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>Copy, download at scale, or redistribute images</li>
                <li>Use images for commercial, editorial, or promotional purposes</li>
                <li>Remove watermarks, credits, or alter works and present them as yours</li>
                <li>Scrape the Site or harvest media systematically</li>
              </ul>
              <p>
                For collaboration or usage requests, use the{" "}
                <Link href="/contact" className="text-primary underline underline-offset-4">
                  contact page
                </Link>
                .
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-headline-sm text-headline-sm text-primary">
                Acceptable use
              </h2>
              <p>You agree not to:</p>
              <ul className="list-disc space-y-2 pl-5">
                <li>Attempt to disrupt or compromise the Site or its hosting</li>
                <li>Submit abusive, unlawful, or misleading contact messages</li>
                <li>Impersonate another person when contacting me</li>
              </ul>
            </section>

            <section className="space-y-3">
              <h2 className="font-headline-sm text-headline-sm text-primary">
                Third-party links
              </h2>
              <p>
                The Site may link to Instagram or other external services. Those sites
                have their own terms and are not my responsibility.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-headline-sm text-headline-sm text-primary">
                Disclaimer
              </h2>
              <p>
                The Site is provided &ldquo;as is.&rdquo; I make no warranties that it
                will be uninterrupted, error-free, or always available. To the fullest
                extent permitted by law, I am not liable for any indirect or
                consequential damages arising from your use of the Site.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-headline-sm text-headline-sm text-primary">
                Changes
              </h2>
              <p>
                These terms may be updated periodically. The &ldquo;Last updated&rdquo;
                date will reflect the latest version. Continued use of the Site after
                changes means you accept the updated terms.
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-headline-sm text-headline-sm text-primary">
                Contact
              </h2>
              <p>
                Questions about these terms:{" "}
                <a
                  href={`mailto:${site.contactEmail}`}
                  className="text-primary underline underline-offset-4"
                >
                  {site.contactEmail}
                </a>
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
