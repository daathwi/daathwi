export function slugify(text: string, maxLength = 120) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, maxLength);
}

export function formatDisplayDate(date = new Date()) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function estimateReadTime(text: string) {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const minutes = Math.max(1, Math.round(words / 200));
  return `${minutes} Min Read`;
}

export function buildArticlePayload({
  title,
  excerpt,
  category,
  image,
  alt,
  dateDisplay,
  readTime,
  contentHtml,
}: {
  title: string;
  excerpt: string;
  category: string;
  image: string;
  alt: string;
  dateDisplay: string;
  readTime: string;
  contentHtml: string;
}) {
  const plain = contentHtml.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
  const paragraphs = plain.split(/\n\n+/).filter(Boolean);

  return {
    heroImage: image,
    heroAlt: alt || title,
    breadcrumbLabel: category,
    categoryTag: category.toUpperCase(),
    dateLong: dateDisplay,
    readTime,
    lede: excerpt || paragraphs[0] || "",
    author: {
      name: "Daathwi Naagh",
      role: "Photographer",
      avatar: "",
      avatarAlt: "Daathwi Naagh",
    },
    techniques: [],
    gear: [],
    intro: paragraphs.slice(0, 1),
    sections:
      paragraphs.length > 1
        ? [{ heading: "", paragraphs: paragraphs.slice(1) }]
        : [],
    gallery: [],
    closing: [],
    bodyHtml: contentHtml,
  };
}
