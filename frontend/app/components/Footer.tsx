import Link from "next/link";
import { getSiteSettings } from "../../lib/server-data";

export default async function Footer() {
  const site = await getSiteSettings();
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-divider bg-background pb-12 pt-stack-lg">
      <div className="mx-auto mb-12 flex w-full max-w-container-max flex-col items-start justify-between px-margin-mobile md:flex-row md:items-center md:px-margin-desktop">
        <div className="mb-8 md:mb-0">
          <span className="font-display-lg mb-2 block text-headline-sm text-primary">
            daathwi.jpg
          </span>
          <p className="max-w-xs text-label-caps leading-relaxed text-on-surface-variant">
            {site.tagline}
          </p>
        </div>

        <div className="flex flex-wrap gap-8 md:gap-16">
          <div>
            <h4 className="mb-4 font-label-caps text-label-caps text-primary">
              SOCIAL
            </h4>
            <ul className="space-y-2">
              <li>
                <a
                  href={site.instagramUrl}
                  target="_blank"
                  rel="me noreferrer"
                  className="text-label-caps text-on-surface-variant transition-colors hover:text-primary"
                >
                  INSTAGRAM
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.contactEmail}`}
                  className="text-label-caps text-on-surface-variant transition-colors hover:text-primary"
                >
                  EMAIL
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="mb-4 font-label-caps text-label-caps text-primary">
              STUDIO
            </h4>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/gallery"
                  className="text-label-caps text-on-surface-variant transition-colors hover:text-primary"
                >
                  GALLERY
                </Link>
              </li>
              <li>
                <Link
                  href="/blog"
                  className="text-label-caps text-on-surface-variant transition-colors hover:text-primary"
                >
                  THE JOURNAL
                </Link>
              </li>
              <li>
                <Link
                  href="/contact"
                  className="text-label-caps text-on-surface-variant transition-colors hover:text-primary"
                >
                  CONTACT
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-container-max flex-col items-center justify-between border-t border-divider px-margin-mobile pt-8 md:flex-row md:px-margin-desktop">
        <p className="mb-4 font-label-caps text-label-caps text-on-surface-variant md:mb-0">
          © {year} Daathwi Naagh. All Rights Reserved.
        </p>
        <div className="flex gap-6">
          <Link
            href="/privacy"
            className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary"
          >
            Privacy Policy
          </Link>
          <Link
            href="/terms"
            className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary"
          >
            Terms of Service
          </Link>
          <Link
            href="/faq"
            className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary"
          >
            FAQ
          </Link>
        </div>
      </div>
    </footer>
  );
}
