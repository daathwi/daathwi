export type GalleryCategory =
  | "All Works"
  | "Street"
  | "Culture"
  | "Craft"
  | "Night"
  | "People";

export type GalleryItem = {
  id: string;
  src: string;
  alt: string;
  category: Exclude<GalleryCategory, "All Works">;
  tag: string;
  title: string;
  description: string;
  aspectRatio: string;
  offset?: "none" | "down" | "up";
  permalink?: string;
  seriesId?: string | null;
};

export type GallerySeries = {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  coverSrc: string | null;
  sortOrder: number;
  published: boolean;
  itemCount: number;
  items: GalleryItem[];
};

export type FeaturedItem = {
  id: string;
  src: string;
  alt: string;
  collection: string;
  title: string;
  subtitle: string;
  offset?: boolean;
  permalink?: string;
};

export type BlogPost = {
  id: string;
  slug: string;
  date: string;
  category: string;
  title: string;
  excerpt: string;
  image: string;
  alt: string;
  featured?: boolean;
  aspect?: "16/9" | "square" | "4/3";
  gridOffset?: boolean;
};

export type NavLink = {
  href: string;
  label: string;
};

export type AboutStat = {
  value: string;
  label: string;
};

export type AboutToolkitGroup = {
  title: string;
  items: string[];
};

export type AboutMoodboardImage = {
  src: string;
  alt: string;
  className: string;
};

export type AboutContent = {
  heroTitle: string;
  heroQuote: string;
  missionTitle: string;
  missionParagraphs: string[];
  stats: AboutStat[];
  toolkit: AboutToolkitGroup[];
  profileImage: string;
  profileAlt: string;
  moodboard: AboutMoodboardImage[];
};

export type ContactLocation = {
  city: string;
  country: string;
  detail: string;
  mapImage: string;
  mapAlt: string;
};

export type ContactInquiryOption = {
  value: string;
  label: string;
};

export type ContactGuideline = {
  step: string;
  text: string;
};

export type ContactContent = {
  heroTitle: string;
  heroTitleItalic: string;
  heroDescriptionSuffix: string;
  location: ContactLocation;
  inquiryOptions: ContactInquiryOption[];
  guidelines: ContactGuideline[];
  serviceTags: string[];
};

export type LicensingContent = {
  headline: string;
  description: string;
  email: string;
  inquiries: { label: string; subject: string }[];
};

export type InstagramProofContent = {
  handle: string;
  url: string;
  headline: string;
  description: string;
};

export type SiteSettings = {
  siteUrl: string;
  domain: string;
  tagline: string;
  contactEmail: string;
  instagramUrl: string;
  heroFallbackUrl: string;
  navLinks: NavLink[];
  licensing: LicensingContent;
  instagramProof: InstagramProofContent;
  about: AboutContent;
  contact: ContactContent;
};

export type BentoPhoto = {
  id: string;
  src: string;
  srcMobile: string;
  alt: string;
  permalink: string;
  slideIndex: number;
  slideCount: number;
};

export type BlogArticle = {
  heroImage: string;
  heroAlt: string;
  breadcrumbLabel: string;
  categoryTag: string;
  dateLong: string;
  readTime: string;
  lede: string;
  author: {
    name: string;
    role: string;
    avatar: string;
    avatarAlt: string;
  };
  techniques: string[];
  gear: string[];
  intro: string[];
  figure?: {
    src: string;
    alt: string;
    caption: string;
  };
  sections: {
    heading: string;
    paragraphs: string[];
  }[];
  gallery: {
    src: string;
    alt: string;
    caption?: string;
    className?: string;
  }[];
  pullQuote?: {
    text: string;
    cite: string;
  };
  closing: string[];
  bodyHtml?: string;
};
