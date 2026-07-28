export type TocItem = {
  id: string;
  text: string;
  level: 2 | 3;
};

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/<[^>]+>/g, "")
    .replace(/&[a-z]+;/gi, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 80);
}

function decodeBasicEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");
}

/** Inject ids into h2/h3 and return HTML + TOC entries. */
export function enrichBodyHtmlWithToc(html: string): {
  html: string;
  toc: TocItem[];
} {
  if (!html.trim()) return { html, toc: [] };

  const toc: TocItem[] = [];
  const used = new Set<string>();

  const enriched = html.replace(
    /<(h2|h3)([^>]*)>([\s\S]*?)<\/\1>/gi,
    (_match, tag: string, attrs: string, inner: string) => {
      const level = tag.toLowerCase() === "h2" ? 2 : 3;
      const text = decodeBasicEntities(inner.replace(/<[^>]+>/g, "").trim());
      if (!text) return `<${tag}${attrs}>${inner}</${tag}>`;

      let id = slugifyHeading(text) || `section-${toc.length + 1}`;
      let unique = id;
      let n = 2;
      while (used.has(unique)) {
        unique = `${id}-${n++}`;
      }
      used.add(unique);
      toc.push({ id: unique, text, level: level as 2 | 3 });

      const withoutId = attrs.replace(/\sid=["'][^"']*["']/gi, "");
      return `<${tag}${withoutId} id="${unique}">${inner}</${tag}>`;
    },
  );

  return { html: enriched, toc };
}

export function tocFromLegacySections(
  sections: { heading: string }[],
): TocItem[] {
  const toc: TocItem[] = [];
  const used = new Set<string>();

  for (const section of sections) {
    const text = section.heading?.trim();
    if (!text) continue;
    let id = slugifyHeading(text) || `section-${toc.length + 1}`;
    let unique = id;
    let n = 2;
    while (used.has(unique)) {
      unique = `${id}-${n++}`;
    }
    used.add(unique);
    toc.push({ id: unique, text, level: 2 });
  }

  return toc;
}
