"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  GALLERY_ASPECT_RATIOS,
  type GalleryAspectRatio,
  DEFAULT_GALLERY_ASPECT,
} from "../../../lib/aspect-ratios";
import {
  computeCoverCrop,
  cropImageToBlob,
  loadImageFromFile,
  minCoverScale,
  type CropRect,
} from "../../../lib/crop-image";
import { hasMediaSrc } from "../../../lib/media";

type Props = {
  file: File;
  initialAspect?: GalleryAspectRatio;
  onCancel: () => void;
  onConfirm: (croppedFile: File, aspectRatio: GalleryAspectRatio, alt: string) => Promise<void>;
};

export default function AspectCropModal({
  file,
  initialAspect = DEFAULT_GALLERY_ASPECT,
  onCancel,
  onConfirm,
}: Props) {
  const [aspectId, setAspectId] = useState<GalleryAspectRatio>(initialAspect);
  const [alt, setAlt] = useState(file.name.replace(/\.[^.]+$/, "").replace(/[-_]/g, " "));
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });
  const [transform, setTransform] = useState({ scale: 1, offsetX: 0, offsetY: 0 });
  const [transformsByAspect, setTransformsByAspect] = useState<
    Record<string, { scale: number; offsetX: number; offsetY: number }>
  >({});

  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(
    null,
  );

  const active = GALLERY_ASPECT_RATIOS.find((item) => item.id === aspectId)!;

  useEffect(() => {
    loadImageFromFile(file).then(setImage).catch(() => setImage(null));
  }, [file]);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setFrameSize({ width, height });
    });
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!image || frameSize.width === 0 || frameSize.height === 0) return;
    const saved = transformsByAspect[aspectId];
    if (saved) {
      setTransform(saved);
      return;
    }
    const scale = minCoverScale(
      image.naturalWidth,
      image.naturalHeight,
      frameSize.width,
      frameSize.height,
    );
    setTransform({ scale, offsetX: 0, offsetY: 0 });
  }, [aspectId, image, frameSize.width, frameSize.height, transformsByAspect]);

  const persistTransform = useCallback(
    (next: { scale: number; offsetX: number; offsetY: number }) => {
      setTransform(next);
      setTransformsByAspect((prev) => ({ ...prev, [aspectId]: next }));
    },
    [aspectId],
  );

  function clampPan(nextOffsetX: number, nextOffsetY: number, nextScale: number) {
    if (!image || frameSize.width === 0) return { offsetX: nextOffsetX, offsetY: nextOffsetY };
    const displayedW = image.naturalWidth * nextScale;
    const displayedH = image.naturalHeight * nextScale;
    const maxX = Math.max(0, (displayedW - frameSize.width) / 2);
    const maxY = Math.max(0, (displayedH - frameSize.height) / 2);
    return {
      offsetX: Math.min(maxX, Math.max(-maxX, nextOffsetX)),
      offsetY: Math.min(maxY, Math.max(-maxY, nextOffsetY)),
    };
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    dragRef.current = {
      x: e.clientX,
      y: e.clientY,
      offsetX: transform.offsetX,
      offsetY: transform.offsetY,
    };
  }

  function onPointerMove(e: ReactPointerEvent<HTMLDivElement>) {
    if (!dragRef.current) return;
    const dx = e.clientX - dragRef.current.x;
    const dy = e.clientY - dragRef.current.y;
    const clamped = clampPan(
      dragRef.current.offsetX + dx,
      dragRef.current.offsetY + dy,
      transform.scale,
    );
    persistTransform({ ...clamped, scale: transform.scale });
  }

  function onPointerUp() {
    dragRef.current = null;
  }

  function getCurrentCrop(): CropRect | null {
    if (!image || frameSize.width === 0) return null;
    return computeCoverCrop(
      image.naturalWidth,
      image.naturalHeight,
      frameSize.width,
      frameSize.height,
      transform.offsetX,
      transform.offsetY,
      transform.scale,
    );
  }

  async function handleSave() {
    if (!image) return;
    const crop = getCurrentCrop();
    if (!crop) return;

    setSaving(true);
    try {
      const base = file.name.replace(/\.[^.]+$/, "");
      const croppedFile = await cropImageToBlob(image, crop, `${base}-${aspectId.replace("/", "x")}.jpg`);
      await onConfirm(croppedFile, aspectId, alt.trim() || base);
    } finally {
      setSaving(false);
    }
  }

  const minScale =
    image && frameSize.width
      ? minCoverScale(image.naturalWidth, image.naturalHeight, frameSize.width, frameSize.height)
      : transform.scale;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/90 p-4 backdrop-blur-sm">
      <div className="flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded border border-divider-strong bg-surface-container shadow-2xl">
        <header className="border-b border-divider px-6 py-5">
          <h3 className="font-headline-sm text-headline-sm text-primary">Crop Gallery Photo</h3>
          <p className="mt-1 font-body-md text-sm text-on-surface-variant">
            Choose an aspect ratio, drag to reposition, then upload.
          </p>
        </header>

        <div className="flex flex-wrap gap-2 border-b border-divider px-6 py-3">
          {GALLERY_ASPECT_RATIOS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setTransformsByAspect((prev) => ({ ...prev, [aspectId]: transform }));
                setAspectId(item.id);
              }}
              className={`rounded px-3 py-1.5 font-label-caps text-[10px] transition-colors ${
                aspectId === item.id
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-high text-on-surface-variant hover:text-primary"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <p className="mb-3 font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
            Frame — {active.label}
          </p>
          <div
            ref={frameRef}
            className="relative mx-auto w-full max-w-2xl overflow-hidden rounded border border-divider-strong bg-black touch-none"
            style={{ aspectRatio: String(active.ratio) }}
            onPointerDown={onPointerDown}
            onPointerMove={onPointerMove}
            onPointerUp={onPointerUp}
            onPointerLeave={onPointerUp}
          >
            {image && frameSize.width > 0 && hasMediaSrc(image.src) && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={image.src}
                alt=""
                draggable={false}
                className="pointer-events-none absolute left-1/2 top-1/2 max-w-none select-none"
                style={{
                  width: image.naturalWidth * transform.scale,
                  height: image.naturalHeight * transform.scale,
                  transform: `translate(calc(-50% + ${transform.offsetX}px), calc(-50% + ${transform.offsetY}px))`,
                }}
              />
            )}
          </div>

          <label className="mt-5 block">
            <span className="mb-2 block font-label-caps text-label-caps text-on-surface-variant">
              Alt text
            </span>
            <input value={alt} onChange={(e) => setAlt(e.target.value)} className="admin-input w-full" />
          </label>

          <div className="mt-4">
            <label className="mb-2 block font-label-caps text-label-caps text-on-surface-variant">
              Zoom
            </label>
            <input
              type="range"
              min={minScale}
              max={minScale * 2.5}
              step={0.01}
              value={transform.scale}
              onChange={(e) => {
                const nextScale = Number(e.target.value);
                const clamped = clampPan(transform.offsetX, transform.offsetY, nextScale);
                persistTransform({ ...clamped, scale: nextScale });
              }}
              className="w-full accent-primary"
            />
          </div>
        </div>

        <footer className="flex justify-end gap-3 border-t border-divider px-6 py-4">
          <button
            type="button"
            onClick={onCancel}
            disabled={saving}
            className="rounded border border-divider-strong px-5 py-2.5 font-label-caps text-label-caps text-on-surface-variant hover:text-primary"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!image || saving || !alt.trim()}
            onClick={handleSave}
            className="rounded bg-primary px-5 py-2.5 font-label-caps text-label-caps text-on-primary hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Uploading…" : "Add to Gallery"}
          </button>
        </footer>
      </div>
    </div>
  );
}
