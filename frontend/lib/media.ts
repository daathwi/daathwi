export function hasMediaSrc(src?: string | null): src is string {
  return Boolean(src?.trim());
}

/** First non-empty media path from candidates (treats "" like missing). */
export function coalesceMediaSrc(
  ...sources: (string | null | undefined)[]
): string {
  for (const source of sources) {
    const trimmed = source?.trim();
    if (trimmed) return trimmed;
  }
  return "";
}
