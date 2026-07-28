import Footer from "../components/Footer";
import ContactForm from "../components/ContactForm";
import Header from "../components/Header";
import MotionReveal from "../components/MotionReveal";
import { getSiteSettings } from "../../lib/server-data";
import { hasMediaSrc } from "../../lib/media";

export const metadata = {
  title: "Contact — daathwi.jpg",
  description:
    "Get in touch with Daathwi Naagh — street photography, collaborations, and inquiries.",
};

export const dynamic = "force-dynamic";

export default async function ContactPage() {
  const site = await getSiteSettings();
  const { contact } = site;
  const hasLocation =
    Boolean(contact.location.city?.trim()) ||
    Boolean(contact.location.country?.trim()) ||
    Boolean(contact.location.detail?.trim());
  const hasMap = hasMediaSrc(contact.location.mapImage);
  const showLocationCard = hasLocation || hasMap;

  return (
    <>
      <Header />

      <main className="mx-auto max-w-container-max px-margin-mobile pb-stack-lg pt-32 md:px-margin-desktop">
        {/* Hero */}
        <section className="mb-stack-lg grid grid-cols-1 items-end gap-gutter md:grid-cols-12">
          <MotionReveal className="md:col-span-8">
            <span className="mb-4 block font-label-caps text-label-caps text-outline">
              GET IN TOUCH
            </span>
            <h1 className="mb-8 font-display-lg text-display-lg-mobile leading-tight md:text-display-lg">
              {contact.heroTitle}
              <br />
              <i className="font-normal italic">{contact.heroTitleItalic}</i>
            </h1>
            <p className="max-w-2xl font-body-lg text-body-lg text-on-surface-variant">
              {contact.heroDescriptionSuffix}
            </p>
          </MotionReveal>
          <MotionReveal className="flex justify-start md:col-span-4 md:justify-end" delay={120}>
            <div className="flex flex-col gap-4">
              <a
                href={`mailto:${site.contactEmail}`}
                className="font-headline-sm text-headline-sm underline decoration-1 underline-offset-8 transition-opacity hover:opacity-60"
              >
                {site.contactEmail}
              </a>
              {hasLocation && (
                <span className="font-body-md text-body-md text-on-surface-variant">
                  {contact.location.city
                    ? `${contact.location.city}, ${contact.location.country}`
                    : contact.location.country || contact.location.detail}
                </span>
              )}
            </div>
          </MotionReveal>
        </section>

        {/* Form + Sidebar */}
        <div className="grid grid-cols-1 gap-gutter md:grid-cols-12">
          <MotionReveal className="border border-divider bg-surface-container-low p-8 md:col-span-7 md:p-12" delay={80}>
            <ContactForm
              contactEmail={site.contactEmail}
              inquiryOptions={contact.inquiryOptions}
            />
          </MotionReveal>

          <div className="flex flex-col gap-gutter md:col-span-5">
            {showLocationCard && (
              <MotionReveal variant="scale-in" delay={140}>
                <div className="flex min-h-[220px] flex-col justify-between border border-divider bg-surface-container-high p-8">
                  <div>
                    <span className="mb-4 block font-label-caps text-label-caps text-outline">
                      LOCATION
                    </span>
                    {(contact.location.city || contact.location.country) && (
                      <h3 className="mb-2 font-headline-sm text-headline-sm">
                        {contact.location.city || contact.location.country}
                      </h3>
                    )}
                    <p className="font-body-md text-on-surface-variant">
                      {contact.location.city && contact.location.country && (
                        <>
                          {contact.location.country}
                          <br />
                        </>
                      )}
                      {contact.location.detail}
                    </p>
                  </div>
                  {hasMap && (
                    <div className="group relative mt-8 aspect-video overflow-hidden">
                      <div className="pointer-events-none absolute inset-0 z-10 bg-primary/10 opacity-0 transition-opacity group-hover:opacity-100" />
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={contact.location.mapImage}
                        alt={contact.location.mapAlt}
                        className="h-full w-full object-cover brightness-75 grayscale transition-transform duration-700 group-hover:scale-105"
                      />
                      <div className="absolute bottom-4 left-4 z-20">
                        <span className="border border-divider-strong bg-background/80 px-3 py-1 font-label-caps text-[10px] tracking-widest backdrop-blur-sm">
                          {(contact.location.city || contact.location.country).toUpperCase()}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </MotionReveal>
            )}

            <MotionReveal delay={200}>
              <div className="grid grid-cols-2 gap-4">
                <a
                  href={site.instagramUrl}
                  target="_blank"
                  rel="me noreferrer"
                  className="group flex aspect-square flex-col justify-between border border-divider bg-surface-container p-6 transition-colors hover:border-divider-emphasis"
                >
                  <span className="material-symbols-outlined text-outline transition-colors group-hover:text-primary">
                    camera
                  </span>
                  <span className="font-label-caps text-label-caps">INSTAGRAM</span>
                </a>
                <a
                  href={`mailto:${site.contactEmail}`}
                  className="group flex aspect-square flex-col justify-between border border-divider bg-surface-container p-6 transition-colors hover:border-divider-emphasis"
                >
                  <span className="material-symbols-outlined text-outline transition-colors group-hover:text-primary">
                    mail
                  </span>
                  <span className="font-label-caps text-label-caps">EMAIL</span>
                </a>
              </div>
            </MotionReveal>
          </div>
        </div>

        {/* Service Guidelines */}
        <MotionReveal className="mt-stack-lg border-t border-divider pt-stack-md">
          <div className="mb-stack-md flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <h2 className="font-headline-md text-headline-md">
              How it works
            </h2>
            <div className="flex flex-wrap gap-4">
              {contact.serviceTags.map((tag) => (
                <span
                  key={tag}
                  className="bg-surface-container-highest px-4 py-1 font-label-caps text-label-caps text-on-surface-variant"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {contact.guidelines.map((item) => (
              <div key={item.step} className="space-y-4">
                <span className="font-label-caps text-label-caps text-outline">
                  {item.step}
                </span>
                <p className="font-body-md text-on-surface-variant">
                  {item.text}
                </p>
              </div>
            ))}
          </div>
        </MotionReveal>
      </main>

      <Footer />
    </>
  );
}
