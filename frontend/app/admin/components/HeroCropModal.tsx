"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  computeCoverCrop,
  cropImageToBlob,
  loadImageFromFile,
  minCoverScale,
  type CropRect,
} from "../../../lib/crop-image";
import { hasMediaSrc } from "../../../lib/media";

type CropMode = "web" | "mobile";

const MODES: { id: CropMode; label: string; aspect: number; hint: string }[] = [
  { id: "web", label: "Web", aspect: 16 / 9, hint: "Desktop hero — 16:9" },
  { id: "mobile", label: "Mobile", aspect: 9 / 16, hint: "Mobile hero — 9:16" },
];

type Props = {
  file: File;
  onCancel: () => void;
  onConfirm: (webFile: File, mobileFile: File, alt: string) => Promise<void>;
};

export default function HeroCropModal({ file, onCancel, onConfirm }: Props) {
  const [mode, setMode] = useState<CropMode>("web");
  const [alt, setAlt] = useState(file.name.replace(/\.[^.]+$/, ""));
  const [saving, setSaving] = useState(false);
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [frameSize, setFrameSize] = useState({ width: 0, height: 0 });
  const [transforms, setTransforms] = useState<
    Record<CropMode, { scale: number; offsetX: number; offsetY: number }>
  >({
    web: { scale: 1, offsetX: 0, offsetY: 0 },
    mobile: { scale: 1, offsetX: 0, offsetY: 0 },
  });
  const [crops, setCrops] = useState<Partial<Record<CropMode, CropRect>>>({});

  const frameRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(
    null,
  );

  const active = MODES.find((m) => m.id === mode)!;
  const transform = transforms[mode];

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

    setTransforms((prev) => {
      if (crops[mode]) return prev;
      const scale = minCoverScale(
        image.naturalWidth,
        image.naturalHeight,
        frameSize.width,
        frameSize.height,
      );
      return {
        ...prev,
        [mode]: { scale, offsetX: 0, offsetY: 0 },
      };
    });
  }, [mode, image, frameSize.width, frameSize.height, crops]);

  const updateTransform = useCallback(
    (patch: Partial<{ scale: number; offsetX: number; offsetY: number }>) => {
      setTransforms((prev) => ({
        ...prev,
        [mode]: { ...prev[mode], ...patch },
      }));
    },
    [mode],
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
    updateTransform(clamped);
  }

  function onPointerUp() {
    dragRef.current = null;
  }

  function saveCurrentCrop() {
    if (!image || frameSize.width === 0) return;
    const crop = computeCoverCrop(
      image.naturalWidth,
      image.naturalHeight,
      frameSize.width,
      frameSize.height,
      transform.offsetX,
      transform.offsetY,
      transform.scale,
    );
    setCrops((prev) => ({ ...prev, [mode]: crop }));
  }

  async function handleNext() {
    if (!image) return;
    saveCurrentCrop();
    if (mode === "web") {
      setMode("mobile");
      return;
    }
    await handleSave();
  }

  async function handleSave() {
    if (!image || frameSize.width === 0) return;
    saveCurrentCrop();

    const webCrop =
      mode === "web"
        ? computeCoverCrop(
            image.naturalWidth,
            image.naturalHeight,
            frameSize.width,
            frameSize.height,
            transform.offsetX,
            transform.offsetY,
            transform.scale,
          )
        : crops.web;
    const mobileCrop =
      mode === "mobile"
        ? computeCoverCrop(
            image.naturalWidth,
            image.naturalHeight,
            frameSize.width,
            frameSize.height,
            transform.offsetX,
            transform.offsetY,
            transform.scale,
          )
        : crops.mobile;

    if (!webCrop || !mobileCrop) return;

    setSaving(true);
    try {
      const base = file.name.replace(/\.[^.]+$/, "");
      const webFile = await cropImageToBlob(image, webCrop, `${base}-web.jpg`);
      const mobileFile = await cropImageToBlob(image, mobileCrop, `${base}-mobile.jpg`);
      await onConfirm(webFile, mobileFile, alt.trim() || base);
    } finally {
      setSaving(false);
    }
  }

  const canContinue = Boolean(image) && alt.trim().length > 0;

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-background/90 p-4 backdrop-blur-sm">
      <div className="flex max-h-[95vh] w-full max-w-3xl flex-col overflow-hidden rounded border border-divider-strong bg-surface-container shadow-2xl">
        <header className="border-b border-divider px-6 py-5">
          <h3 className="font-headline-sm text-headline-sm text-primary">Crop Hero Photo</h3>
          <p className="mt-1 font-body-md text-sm text-on-surface-variant">
            Drag to reposition, then set crops for web and mobile hero displays.
          </p>
        </header>

        <div className="flex gap-2 border-b border-divider px-6 py-3">
          {MODES.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                saveCurrentCrop();
                setMode(item.id);
              }}
              className={`rounded px-4 py-2 font-label-caps text-label-caps transition-colors ${
                mode === item.id
                  ? "bg-primary text-on-primary"
                  : "bg-surface-container-high text-on-surface-variant hover:text-primary"
              }`}
            >
              {item.label}
              {crops[item.id] && (
                <span className="ml-2 text-[10px] opacity-70">✓</span>
              )}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <p className="mb-3 font-label-caps text-[10px] uppercase tracking-widest text-on-surface-variant">
            {active.hint}
          </p>
          <div
            ref={frameRef}
            className="relative mx-auto w-full max-w-2xl overflow-hidden rounded border border-divider-strong bg-black touch-none"
            style={{ aspectRatio: String(active.aspect) }}
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
            <input
              value={alt}
              onChange={(e) => setAlt(e.target.value)}
              className="admin-input w-full"
            />
          </label>

          <div className="mt-4">
            <label className="mb-2 block font-label-caps text-label-caps text-on-surface-variant">
              Zoom
            </label>
            <input
              type="range"
              min={
                image && frameSize.width
                  ? minCoverScale(
                      image.naturalWidth,
                      image.naturalHeight,
                      frameSize.width,
                      frameSize.height,
                    )
                  : transform.scale
              }
              max={
                (image && frameSize.width
                  ? minCoverScale(
                      image.naturalWidth,
                      image.naturalHeight,
                      frameSize.width,
                      frameSize.height,
                    )
                  : transform.scale) * 2.5
              }
              step={0.01}
              value={transform.scale}
              onChange={(e) => {
                const nextScale = Number(e.target.value);
                const clamped = clampPan(transform.offsetX, transform.offsetY, nextScale);
                updateTransform({ scale: nextScale, ...clamped });
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
            disabled={!canContinue || saving}
            onClick={handleNext}
            className="rounded bg-primary px-5 py-2.5 font-label-caps text-label-caps text-on-primary hover:opacity-90 disabled:opacity-50"
          >
            {saving ? "Uploading…" : mode === "web" ? "Next: Mobile Crop" : "Upload Photo"}
          </button>
        </footer>
      </div>
    </div>
  );
}
