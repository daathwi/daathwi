"use client";

import {
  FormEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useState,
} from "react";
import type { ApiSiteSettings } from "../../../lib/api";
import {
  fetchSiteAdmin,
  mediaUrl,
  updateSiteAdmin,
} from "../../../lib/admin-api";
import { hasMediaSrc } from "../../../lib/media";
import MediaPicker from "../components/MediaPicker";
import { useAdminToast } from "../components/AdminToast";

const TABS = [
  { id: "general", label: "General" },
  { id: "navigation", label: "Navigation" },
  { id: "home", label: "Instagram" },
  { id: "about", label: "About" },
  { id: "contact", label: "Contact" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export default function AdminSettingsPage() {
  const { showToast } = useAdminToast();
  const [site, setSite] = useState<ApiSiteSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<TabId>("general");
  const [pickerMode, setPickerMode] = useState<"portrait" | "story" | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setSite(await fetchSiteAdmin());
    } catch {
      showToast("Failed to load settings", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!site) return;
    setSaving(true);
    try {
      const updated = await updateSiteAdmin({
        site_url: site.site_url,
        domain: site.domain,
        tagline: site.tagline,
        contact_email: site.contact_email,
        instagram_url: site.instagram_url,
        hero_fallback_url: site.hero_fallback_url,
        nav_links: site.nav_links,
        licensing: site.licensing,
        instagram_proof: {
          ...site.instagram_proof,
          url: site.instagram_url,
          handle: site.instagram_proof.handle,
        },
        about: site.about,
        contact: site.contact,
      });
      setSite(updated);
      showToast("Settings saved — live site will reflect changes");
    } catch {
      showToast("Save failed", "error");
    } finally {
      setSaving(false);
    }
  }

  function handleProfileSelect(src: string) {
    if (!site) return;
    setSite({
      ...site,
      about: {
        ...site.about,
        profile_image: src,
        profile_alt: site.about.profile_alt || "Portrait of Daathwi Naagh",
      },
    });
    showToast("Main portrait selected — save to publish");
  }

  function handleStoryPhotoSelect(src: string) {
    if (!site) return;
    if (site.about.moodboard.length >= 2) {
      showToast("You already have 2 extra story photos (3 total with portrait)", "error");
      return;
    }
    setSite({
      ...site,
      about: {
        ...site.about,
        moodboard: [
          ...site.about.moodboard,
          {
            src,
            alt: site.about.profile_alt || "Daathwi Naagh",
            className: "",
          },
        ],
      },
    });
    showToast("Story photo selected — save to publish");
  }

  if (loading || !site) {
    return (
      <div className="px-margin-desktop py-stack-lg">
        <p className="font-body-md text-on-surface-variant">Loading…</p>
      </div>
    );
  }

  return (
    <>
      <MediaPicker
        open={pickerMode !== null}
        onClose={() => setPickerMode(null)}
        title={pickerMode === "story" ? "Choose story photo" : "Choose portrait"}
        onSelect={(item) => {
          if (pickerMode === "story") handleStoryPhotoSelect(item.src);
          else handleProfileSelect(item.src);
        }}
      />

      <header className="border-b border-divider px-margin-desktop py-8">
        <h2 className="font-headline-md text-headline-md text-primary">Site Settings</h2>
        <p className="mt-2 max-w-2xl font-body-md text-on-surface-variant">
          Maintain copy and structure used by the public site — home, about, contact,
          and navigation.
        </p>
      </header>

      <div className="flex flex-wrap gap-2 border-b border-divider px-margin-desktop pt-6">
        {TABS.map((item) => (
          <button
            key={item.id}
            type="button"
            onClick={() => setTab(item.id)}
            className={`border-b-2 px-3 pb-3 font-label-caps text-label-caps transition-colors ${
              tab === item.id
                ? "border-primary text-primary"
                : "border-transparent text-on-surface-variant hover:text-primary"
            }`}
          >
            {item.label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} className="max-w-3xl space-y-8 px-margin-desktop py-stack-lg">
        {tab === "general" && (
          <Section
            title="General"
            hint="Used in the hero tagline, header contact, and SEO-facing URLs."
          >
            <Field label="Site URL">
              <input
                value={site.site_url}
                onChange={(e) => setSite({ ...site, site_url: e.target.value })}
                className="admin-input"
                placeholder="https://daathwi.jpg"
              />
            </Field>
            <Field label="Domain label">
              <input
                value={site.domain}
                onChange={(e) => setSite({ ...site, domain: e.target.value })}
                className="admin-input"
                placeholder="daathwi.jpg"
              />
            </Field>
            <Field label="Tagline (home hero)">
              <textarea
                rows={2}
                value={site.tagline}
                onChange={(e) => setSite({ ...site, tagline: e.target.value })}
                className="admin-input resize-none"
              />
            </Field>
            <Field label="Contact email">
              <input
                type="email"
                value={site.contact_email}
                onChange={(e) => setSite({ ...site, contact_email: e.target.value })}
                className="admin-input"
              />
            </Field>
            <Field label="Instagram URL">
              <input
                value={site.instagram_url}
                onChange={(e) => setSite({ ...site, instagram_url: e.target.value })}
                className="admin-input"
              />
            </Field>
            <Field label="Instagram handle">
              <input
                value={site.instagram_proof.handle}
                onChange={(e) =>
                  setSite({
                    ...site,
                    instagram_proof: { ...site.instagram_proof, handle: e.target.value },
                  })
                }
                className="admin-input"
                placeholder="@daathwi.jpg"
              />
            </Field>
            <Field label="Hero fallback image path (optional)">
              <input
                value={site.hero_fallback_url}
                onChange={(e) => setSite({ ...site, hero_fallback_url: e.target.value })}
                className="admin-input"
                placeholder="/uploads/… or leave empty if hero photos exist"
              />
            </Field>
          </Section>
        )}

        {tab === "navigation" && (
          <Section
            title="Navigation"
            hint="Header links on the public site. Keep hrefs as site paths (e.g. /gallery)."
          >
            {site.nav_links.map((link, index) => (
              <div key={`${link.href}-${index}`} className="grid grid-cols-12 gap-3">
                <div className="col-span-5">
                  <Field label="Label">
                    <input
                      value={link.label}
                      onChange={(e) => {
                        const nav_links = [...site.nav_links];
                        nav_links[index] = { ...link, label: e.target.value };
                        setSite({ ...site, nav_links });
                      }}
                      className="admin-input"
                    />
                  </Field>
                </div>
                <div className="col-span-5">
                  <Field label="Href">
                    <input
                      value={link.href}
                      onChange={(e) => {
                        const nav_links = [...site.nav_links];
                        nav_links[index] = { ...link, href: e.target.value };
                        setSite({ ...site, nav_links });
                      }}
                      className="admin-input"
                    />
                  </Field>
                </div>
                <div className="col-span-2 flex items-end pb-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSite({
                        ...site,
                        nav_links: site.nav_links.filter((_, i) => i !== index),
                      })
                    }
                    className="font-label-caps text-[11px] text-on-surface-variant hover:text-primary"
                  >
                    Remove
                  </button>
                </div>
              </div>
            ))}
            <button
              type="button"
              onClick={() =>
                setSite({
                  ...site,
                  nav_links: [...site.nav_links, { href: "/", label: "New link" }],
                })
              }
              className="font-label-caps text-label-caps text-primary underline underline-offset-4"
            >
              + Add nav link
            </button>
          </Section>
        )}

        {tab === "home" && (
          <Section
            title="Instagram"
            hint="Optional Instagram callout copy used on the site."
          >
            <Field label="Instagram proof headline">
              <input
                value={site.instagram_proof.headline}
                onChange={(e) =>
                  setSite({
                    ...site,
                    instagram_proof: {
                      ...site.instagram_proof,
                      headline: e.target.value,
                    },
                  })
                }
                className="admin-input"
              />
            </Field>
            <Field label="Instagram proof description">
              <textarea
                rows={3}
                value={site.instagram_proof.description}
                onChange={(e) =>
                  setSite({
                    ...site,
                    instagram_proof: {
                      ...site.instagram_proof,
                      description: e.target.value,
                    },
                  })
                }
                className="admin-input resize-none"
              />
            </Field>
            <p className="rounded border border-divider bg-surface-container-low px-4 py-3 font-body-md text-sm text-on-surface-variant">
              Homepage media is maintained under <strong>Hero Photos</strong>,{" "}
              <strong>Series</strong>, and <strong>Gallery</strong>. Blog posts under{" "}
              <strong>Blog</strong>.
            </p>
          </Section>
        )}

        {tab === "about" && (
          <Section
            title="Your story"
            hint="Public About page: opening, Why, What, and 2–3 photos of you. First story paragraph = Why; the rest = What."
          >
            <Field label="Story title">
              <input
                value={site.about.hero_title}
                onChange={(e) =>
                  setSite({
                    ...site,
                    about: { ...site.about, hero_title: e.target.value },
                  })
                }
                className="admin-input"
                placeholder="Street stories from India."
              />
            </Field>
            <Field label="Opening (lede)">
              <textarea
                rows={3}
                value={site.about.hero_quote}
                onChange={(e) =>
                  setSite({
                    ...site,
                    about: { ...site.about, hero_quote: e.target.value },
                  })
                }
                className="admin-input resize-none"
                placeholder="A short line that introduces you as a person, not a résumé."
              />
            </Field>
            <Field label="Why — heading">
              <input
                value={site.about.mission_title}
                onChange={(e) =>
                  setSite({
                    ...site,
                    about: { ...site.about, mission_title: e.target.value },
                  })
                }
                className="admin-input"
                placeholder="Why I raise the camera."
              />
            </Field>
            <Field label="Story paragraphs (one per line)">
              <textarea
                rows={8}
                value={site.about.mission_paragraphs.join("\n")}
                onChange={(e) =>
                  setSite({
                    ...site,
                    about: {
                      ...site.about,
                      mission_paragraphs: e.target.value
                        .split("\n")
                        .map((line) => line.trim())
                        .filter(Boolean),
                    },
                  })
                }
                className="admin-input resize-none"
                placeholder={
                  "Line 1 becomes the Why section.\nLine 2+ become the What section."
                }
              />
            </Field>

            <Field label="Photo alt text">
              <input
                value={site.about.profile_alt}
                onChange={(e) =>
                  setSite({
                    ...site,
                    about: { ...site.about, profile_alt: e.target.value },
                  })
                }
                className="admin-input"
                placeholder="Portrait of Daathwi Naagh"
              />
            </Field>

            <div className="space-y-3">
              <span className="font-label-caps text-label-caps text-on-surface-variant">
                Main portrait (photo 1 of 3)
              </span>
              {hasMediaSrc(site.about.profile_image) ? (
                <div className="relative aspect-[4/5] max-w-xs overflow-hidden rounded-lg border border-divider bg-surface-container">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={mediaUrl(site.about.profile_image)}
                    alt={site.about.profile_alt}
                    className="h-full w-full object-cover"
                  />
                </div>
              ) : (
                <p className="font-body-md text-sm text-on-surface-variant">
                  Choose a portrait from Media for the About story.
                </p>
              )}
              <button
                type="button"
                onClick={() => setPickerMode("portrait")}
                className="inline-flex items-center gap-2 border border-divider px-4 py-2 font-label-caps text-label-caps text-primary hover:border-primary"
              >
                {hasMediaSrc(site.about.profile_image)
                  ? "Replace from Media"
                  : "Choose from Media"}
              </button>
              {hasMediaSrc(site.about.profile_image) && (
                <button
                  type="button"
                  onClick={() =>
                    setSite({
                      ...site,
                      about: { ...site.about, profile_image: "" },
                    })
                  }
                  className="ml-3 font-label-caps text-[11px] text-on-surface-variant hover:text-primary"
                >
                  Clear
                </button>
              )}
            </div>

            <div className="space-y-3">
              <span className="font-label-caps text-label-caps text-on-surface-variant">
                Extra story photos (photos 2–3)
              </span>
              <p className="font-body-md text-sm text-on-surface-variant">
                Add up to two more photos of you — on the street, with a camera, in a place
                that feels like your work.
              </p>
              <div className="grid grid-cols-2 gap-3 max-w-md">
                {site.about.moodboard.map((image, index) => (
                  <div key={`${image.src}-${index}`} className="space-y-2">
                    <div className="relative aspect-[4/5] overflow-hidden rounded-lg border border-divider bg-surface-container">
                      {hasMediaSrc(image.src) ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={mediaUrl(image.src)}
                          alt={image.alt}
                          className="h-full w-full object-cover"
                        />
                      ) : null}
                    </div>
                    <button
                      type="button"
                      onClick={() =>
                        setSite({
                          ...site,
                          about: {
                            ...site.about,
                            moodboard: site.about.moodboard.filter((_, i) => i !== index),
                          },
                        })
                      }
                      className="font-label-caps text-[11px] text-on-surface-variant hover:text-primary"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              {site.about.moodboard.length < 2 && (
                <button
                  type="button"
                  onClick={() => setPickerMode("story")}
                  className="inline-flex items-center gap-2 border border-divider px-4 py-2 font-label-caps text-label-caps text-primary hover:border-primary"
                >
                  Add from Media
                </button>
              )}
            </div>
          </Section>
        )}

        {tab === "contact" && (
          <Section
            title="Contact page"
            hint="Location is optional — leave city empty to hide city-specific UI."
          >
            <Field label="Hero title">
              <input
                value={site.contact.hero_title}
                onChange={(e) =>
                  setSite({
                    ...site,
                    contact: { ...site.contact, hero_title: e.target.value },
                  })
                }
                className="admin-input"
              />
            </Field>
            <Field label="Hero title (italic line)">
              <input
                value={site.contact.hero_title_italic}
                onChange={(e) =>
                  setSite({
                    ...site,
                    contact: { ...site.contact, hero_title_italic: e.target.value },
                  })
                }
                className="admin-input"
              />
            </Field>
            <Field label="Hero description suffix">
              <textarea
                rows={3}
                value={site.contact.hero_description_suffix}
                onChange={(e) =>
                  setSite({
                    ...site,
                    contact: {
                      ...site.contact,
                      hero_description_suffix: e.target.value,
                    },
                  })
                }
                className="admin-input resize-none"
              />
            </Field>

            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <Field label="City (optional)">
                <input
                  value={site.contact.location.city}
                  onChange={(e) =>
                    setSite({
                      ...site,
                      contact: {
                        ...site.contact,
                        location: { ...site.contact.location, city: e.target.value },
                      },
                    })
                  }
                  className="admin-input"
                />
              </Field>
              <Field label="Country">
                <input
                  value={site.contact.location.country}
                  onChange={(e) =>
                    setSite({
                      ...site,
                      contact: {
                        ...site.contact,
                        location: {
                          ...site.contact.location,
                          country: e.target.value,
                        },
                      },
                    })
                  }
                  className="admin-input"
                />
              </Field>
              <Field label="Location detail">
                <input
                  value={site.contact.location.detail}
                  onChange={(e) =>
                    setSite({
                      ...site,
                      contact: {
                        ...site.contact,
                        location: {
                          ...site.contact.location,
                          detail: e.target.value,
                        },
                      },
                    })
                  }
                  className="admin-input"
                />
              </Field>
            </div>

            <Field label="Service tags (comma-separated)">
              <input
                value={site.contact.service_tags.join(", ")}
                onChange={(e) =>
                  setSite({
                    ...site,
                    contact: {
                      ...site.contact,
                      service_tags: e.target.value
                        .split(",")
                        .map((t) => t.trim())
                        .filter(Boolean),
                    },
                  })
                }
                className="admin-input"
              />
            </Field>

            <div>
              <p className="mb-3 font-label-caps text-label-caps text-on-surface-variant">
                Guidelines
              </p>
              <div className="space-y-4">
                {site.contact.guidelines.map((item, index) => (
                  <div key={index} className="space-y-2 border border-divider p-4">
                    <input
                      value={item.step}
                      onChange={(e) => {
                        const guidelines = [...site.contact.guidelines];
                        guidelines[index] = { ...item, step: e.target.value };
                        setSite({
                          ...site,
                          contact: { ...site.contact, guidelines },
                        });
                      }}
                      className="admin-input"
                      placeholder="Step label"
                    />
                    <textarea
                      rows={3}
                      value={item.text}
                      onChange={(e) => {
                        const guidelines = [...site.contact.guidelines];
                        guidelines[index] = { ...item, text: e.target.value };
                        setSite({
                          ...site,
                          contact: { ...site.contact, guidelines },
                        });
                      }}
                      className="admin-input resize-none"
                      placeholder="Guideline text"
                    />
                  </div>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-3 font-label-caps text-label-caps text-on-surface-variant">
                Inquiry options
              </p>
              <div className="space-y-3">
                {site.contact.inquiry_options.map((opt, index) => (
                  <div key={index} className="grid grid-cols-2 gap-3">
                    <input
                      value={opt.label}
                      onChange={(e) => {
                        const inquiry_options = [...site.contact.inquiry_options];
                        inquiry_options[index] = { ...opt, label: e.target.value };
                        setSite({
                          ...site,
                          contact: { ...site.contact, inquiry_options },
                        });
                      }}
                      className="admin-input"
                      placeholder="Label"
                    />
                    <input
                      value={opt.value}
                      onChange={(e) => {
                        const inquiry_options = [...site.contact.inquiry_options];
                        inquiry_options[index] = { ...opt, value: e.target.value };
                        setSite({
                          ...site,
                          contact: { ...site.contact, inquiry_options },
                        });
                      }}
                      className="admin-input"
                      placeholder="Value key"
                    />
                  </div>
                ))}
              </div>
            </div>
          </Section>
        )}

        <div className="sticky bottom-0 flex items-center gap-4 border-t border-divider bg-background/95 py-4 backdrop-blur-sm">
          <button
            type="submit"
            disabled={saving}
            className="rounded bg-primary px-8 py-3 font-label-caps text-label-caps text-on-primary hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Saving…" : "Save settings"}
          </button>
          <a
            href="/"
            target="_blank"
            rel="noreferrer"
            className="font-label-caps text-label-caps text-on-surface-variant hover:text-primary"
          >
            Preview site →
          </a>
        </div>
      </form>
    </>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint: string;
  children: ReactNode;
}) {
  return (
    <section className="space-y-6">
      <div>
        <h3 className="font-headline-sm text-headline-sm text-primary">{title}</h3>
        <p className="mt-1 font-body-md text-sm text-on-surface-variant">{hint}</p>
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block space-y-2">
      <span className="font-label-caps text-label-caps text-on-surface-variant">{label}</span>
      {children}
    </label>
  );
}
