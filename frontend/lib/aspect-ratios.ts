export const GALLERY_ASPECT_RATIOS = [
  { id: "9/16", label: "9:16", ratio: 9 / 16 },
  { id: "16/9", label: "16:9", ratio: 16 / 9 },
  { id: "4/5", label: "4:5", ratio: 4 / 5 },
  { id: "5/4", label: "5:4", ratio: 5 / 4 },
  { id: "3/4", label: "3:4", ratio: 3 / 4 },
  { id: "4/3", label: "4:3", ratio: 4 / 3 },
  { id: "1/1", label: "1:1", ratio: 1 },
] as const;

export type GalleryAspectRatio = (typeof GALLERY_ASPECT_RATIOS)[number]["id"];

export const DEFAULT_GALLERY_ASPECT: GalleryAspectRatio = "4/5";

export function aspectRatioToNumber(id: string): number {
  const found = GALLERY_ASPECT_RATIOS.find((item) => item.id === id);
  if (found) return found.ratio;
  const [w, h] = id.split("/").map(Number);
  if (w > 0 && h > 0) return w / h;
  return 4 / 5;
}

export function aspectRatioLabel(id: string): string {
  return GALLERY_ASPECT_RATIOS.find((item) => item.id === id)?.label ?? id;
}
