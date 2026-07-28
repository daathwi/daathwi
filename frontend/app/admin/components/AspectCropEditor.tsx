"use client";

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";
import {
  GALLERY_ASPECT_RATIOS,
  type GalleryAspectRatio,
  aspectRatioToNumber,
} from "../../../lib/aspect-ratios";
import {
  computeCoverCrop,
  cropImageToBlob,
  loadImageFromFile,
  minCoverScale,
  revokeImageObjectUrl,
  type CropRect,
} from "../../../lib/crop-image";

const STAGE_HEIGHT = 480;

export type AspectCropEditorHandle = {
  crop: () => Promise<File | null>;
  hasImage: boolean;
};

type Props = {
  file: File | null;
  aspectRatio: GalleryAspectRatio;
  onAspectRatioChange?: (aspect: GalleryAspectRatio) => void;
  showAspectPicker?: boolean;
};

function fitCropFrame(
  stageWidth: number,
  stageHeight: number,
  aspect: number,
): { width: number; height: number; left: number; top: number } {
  if (stageWidth === 0 || stageHeight === 0) {
    return { width: 0, height: 0, left: 0, top: 0 };
  }

  let width = stageWidth;
  let height = width / aspect;

  if (height > stageHeight) {
    height = stageHeight;
    width = height * aspect;
  }

  return {
    width,
    height,
    left: (stageWidth - width) / 2,
    top: (stageHeight - height) / 2,
  };
}

const AspectCropEditor = forwardRef<AspectCropEditorHandle, Props>(function AspectCropEditor(
  { file, aspectRatio, onAspectRatioChange, showAspectPicker = false },
  ref,
) {
  const [image, setImage] = useState<HTMLImageElement | null>(null);
  const [stageSize, setStageSize] = useState({ width: 0, height: STAGE_HEIGHT });
  const [transform, setTransform] = useState({ scale: 1, offsetX: 0, offsetY: 0 });
  const [transformsByAspect, setTransformsByAspect] = useState<
    Record<string, { scale: number; offsetX: number; offsetY: number }>
  >({});

  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{ x: number; y: number; offsetX: number; offsetY: number } | null>(
    null,
  );
  const transformRef = useRef(transform);
  transformRef.current = transform;

  const aspect = aspectRatioToNumber(aspectRatio);
  const cropFrame = fitCropFrame(stageSize.width, stageSize.height, aspect);
  const cropFrameRef = useRef(cropFrame);
  cropFrameRef.current = cropFrame;

  useEffect(() => {
    if (!file) {
      setImage(null);
      return;
    }

    let cancelled = false;
    loadImageFromFile(file)
      .then((loaded) => {
        if (!cancelled) setImage(loaded);
      })
      .catch(() => {
        if (!cancelled) setImage(null);
      });

    return () => {
      cancelled = true;
      setImage((prev) => {
        revokeImageObjectUrl(prev);
        return null;
      });
    };
  }, [file]);

  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const measure = () => {
      setStageSize({ width: stage.clientWidth, height: STAGE_HEIGHT });
    };

    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!image || cropFrame.width === 0 || cropFrame.height === 0) return;

    const saved = transformsByAspect[aspectRatio];
    if (saved) {
      setTransform(saved);
      return;
    }

    const scale = minCoverScale(
      image.naturalWidth,
      image.naturalHeight,
      cropFrame.width,
      cropFrame.height,
    );
    setTransform({ scale, offsetX: 0, offsetY: 0 });
  }, [aspectRatio, image, cropFrame.width, cropFrame.height, transformsByAspect]);

  const persistTransform = useCallback(
    (next: { scale: number; offsetX: number; offsetY: number }) => {
      setTransform(next);
      setTransformsByAspect((prev) => ({ ...prev, [aspectRatio]: next }));
    },
    [aspectRatio],
  );

  function clampPan(nextOffsetX: number, nextOffsetY: number, nextScale: number) {
    if (!image || cropFrame.width === 0) return { offsetX: nextOffsetX, offsetY: nextOffsetY };

    const displayedW = image.naturalWidth * nextScale;
    const displayedH = image.naturalHeight * nextScale;
    const maxX = Math.max(0, (displayedW - cropFrame.width) / 2);
    const maxY = Math.max(0, (displayedH - cropFrame.height) / 2);

    return {
      offsetX: Math.min(maxX, Math.max(-maxX, nextOffsetX)),
      offsetY: Math.min(maxY, Math.max(-maxY, nextOffsetY)),
    };
  }

  function onPointerDown(e: ReactPointerEvent<HTMLDivElement>) {
    if (!image) return;
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

  function onWheel(e: React.WheelEvent<HTMLDivElement>) {
    if (!image || cropFrame.width === 0) return;
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    const nextScale = Math.min(minScale * 2.5, Math.max(minScale, transform.scale + delta * transform.scale));
    const clamped = clampPan(transform.offsetX, transform.offsetY, nextScale);
    persistTransform({ ...clamped, scale: nextScale });
  }

  function getCurrentCrop(): CropRect | null {
    const frame = cropFrameRef.current;
    if (!image || frame.width === 0) return null;
    const t = transformRef.current;
    return computeCoverCrop(
      image.naturalWidth,
      image.naturalHeight,
      frame.width,
      frame.height,
      t.offsetX,
      t.offsetY,
      t.scale,
    );
  }

  useImperativeHandle(
    ref,
    () => ({
      hasImage: Boolean(image),
      crop: async () => {
        if (!image || !file) return null;
        const crop = getCurrentCrop();
        if (!crop) return null;
        const base = file.name.replace(/\.[^.]+$/, "");
        return cropImageToBlob(image, crop, `${base}-${aspectRatio.replace("/", "x")}.jpg`);
      },
    }),
    [image, file, aspectRatio],
  );

  const minScale =
    image && cropFrame.width
      ? minCoverScale(image.naturalWidth, image.naturalHeight, cropFrame.width, cropFrame.height)
      : transform.scale;

  const activeLabel =
    GALLERY_ASPECT_RATIOS.find((item) => item.id === aspectRatio)?.label ?? aspectRatio;

  return (
    <div className="space-y-4">
      {showAspectPicker && onAspectRatioChange && (
        <div className="flex flex-wrap gap-2">
          {GALLERY_ASPECT_RATIOS.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                setTransformsByAspect((prev) => ({ ...prev, [aspectRatio]: transform }));
                onAspectRatioChange(item.id);
              }}
              className={`rounded border px-3 py-1.5 font-label-caps text-[10px] transition-colors ${
                aspectRatio === item.id
                  ? "border-primary bg-primary text-on-primary"
                  : "border-divider-strong text-on-surface-variant hover:border-divider-emphasis"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      )}

      <div
        ref={stageRef}
        className="relative w-full overflow-hidden rounded-lg border border-divider-strong bg-black touch-none"
        style={{ height: STAGE_HEIGHT }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onWheel={onWheel}
      >
        {!image && (
          <div className="flex h-full items-center justify-center font-body-md text-sm text-on-surface-variant">
            {file ? "Loading photo…" : "Upload a photo to start cropping"}
          </div>
        )}

        {image && cropFrame.width > 0 && image.src && (
          <>
            {/* Full-stage image layer for context while dragging */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={image.src}
              alt=""
              draggable={false}
              className="pointer-events-none absolute max-w-none select-none opacity-40"
              style={{
                left: cropFrame.left + cropFrame.width / 2,
                top: cropFrame.top + cropFrame.height / 2,
                width: image.naturalWidth * transform.scale,
                height: image.naturalHeight * transform.scale,
                transform: `translate(calc(-50% + ${transform.offsetX}px), calc(-50% + ${transform.offsetY}px))`,
              }}
            />

            {/* Crop window */}
            <div
              className="absolute overflow-hidden"
              style={{
                left: cropFrame.left,
                top: cropFrame.top,
                width: cropFrame.width,
                height: cropFrame.height,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
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
            </div>

            {/* Dimmed mask outside crop frame */}
            <div className="pointer-events-none absolute inset-0">
              <div
                className="absolute left-0 right-0 top-0 bg-black/55"
                style={{ height: cropFrame.top }}
              />
              <div
                className="absolute left-0 bg-black/55"
                style={{
                  top: cropFrame.top,
                  width: cropFrame.left,
                  height: cropFrame.height,
                }}
              />
              <div
                className="absolute right-0 bg-black/55"
                style={{
                  top: cropFrame.top,
                  left: cropFrame.left + cropFrame.width,
                  height: cropFrame.height,
                }}
              />
              <div
                className="absolute bottom-0 left-0 right-0 bg-black/55"
                style={{ top: cropFrame.top + cropFrame.height }}
              />
            </div>

            {/* Crop frame border */}
            <div
              className="pointer-events-none absolute rounded-sm border-2 border-white/90 shadow-[0_0_0_1px_rgba(0,0,0,0.35)]"
              style={{
                left: cropFrame.left,
                top: cropFrame.top,
                width: cropFrame.width,
                height: cropFrame.height,
              }}
            />

            <div
              className="pointer-events-none absolute font-label-caps text-[10px] uppercase tracking-widest text-white/90"
              style={{ left: cropFrame.left + 12, top: cropFrame.top + 12 }}
            >
              {activeLabel}
            </div>
          </>
        )}
      </div>

      {image && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-body-md text-sm text-on-surface-variant">
            Drag to reposition · scroll or use zoom to adjust framing
          </p>
          <div className="flex min-w-[200px] flex-1 items-center gap-3 sm:max-w-xs">
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
              zoom_out
            </span>
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
            <span className="material-symbols-outlined text-[18px] text-on-surface-variant">
              zoom_in
            </span>
          </div>
        </div>
      )}
    </div>
  );
});

export default AspectCropEditor;
