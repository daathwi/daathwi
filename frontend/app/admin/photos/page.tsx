"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import type { ApiPhoto } from "../../../lib/api";
import { deletePhoto, fetchPhotosAdmin, mediaUrl } from "../../../lib/admin-api";
import { coalesceMediaSrc, hasMediaSrc } from "../../../lib/media";
import { useAdminToast } from "../components/AdminToast";

export default function AdminPhotosPage() {
  const { showToast } = useAdminToast();
  const [photos, setPhotos] = useState<ApiPhoto[]>([]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setPhotos(await fetchPhotosAdmin());
    } catch {
      showToast("Failed to load photos", "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    load();
  }, [load]);

  async function handleDelete(id: string) {
    if (!confirm("Delete this photo?")) return;
    try {
      await deletePhoto(id);
      showToast("Photo deleted");
      await load();
    } catch {
      showToast("Delete failed", "error");
    }
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex items-end justify-between border-b border-divider bg-background/80 px-margin-desktop py-8 backdrop-blur-xl">
        <div>
          <h2 className="font-headline-md text-headline-md text-primary">Hero Photos</h2>
          <p className="mt-2 font-body-md text-on-surface-variant">
            Home page hero carousel only. Upload separate web (16:9) and mobile (9:16) crops.
          </p>
        </div>
        <Link
          href="/admin/photos/new"
          className="flex items-center gap-2 rounded bg-primary px-6 py-3 font-label-caps text-label-caps text-on-primary transition-opacity hover:opacity-90"
        >
          <span className="material-symbols-outlined text-sm">upload</span>
          Upload Hero Photo
        </Link>
      </header>

      <section className="px-margin-desktop py-stack-lg">
        {loading ? (
          <p className="font-body-md text-on-surface-variant">Loading…</p>
        ) : (
          <div className="grid grid-cols-1 gap-gutter md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {photos.map((photo) => (
              <PhotoCard
                key={photo.id}
                title={photo.alt}
                meta={`ID: ${photo.id}`}
                webSrc={mediaUrl(photo.src)}
                mobileSrc={mediaUrl(coalesceMediaSrc(photo.src_mobile, photo.src))}
                onDelete={() => handleDelete(photo.id)}
              />
            ))}
            {photos.length === 0 && (
              <p className="col-span-full font-body-md text-on-surface-variant">
                No hero photos yet.{" "}
                <Link href="/admin/photos/new" className="text-primary hover:underline">
                  Upload one
                </Link>
                .
              </p>
            )}
          </div>
        )}
      </section>
    </>
  );
}

function PhotoCard({
  title,
  meta,
  webSrc,
  mobileSrc,
  onDelete,
}: {
  title: string;
  meta: string;
  webSrc: string;
  mobileSrc: string;
  onDelete: () => void;
}) {
  return (
    <div className="image-card-hover group relative flex flex-col gap-stack-sm">
      <div className="grid grid-cols-2 gap-2">
        <div className="relative aspect-video overflow-hidden rounded border border-divider bg-surface-container-low">
          {hasMediaSrc(webSrc) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={webSrc} alt={`${title} — web crop`} className="h-full w-full object-cover" />
          ) : (
            <div className="h-full w-full bg-surface-container" aria-hidden />
          )}
          <span className="absolute bottom-1 left-1 bg-background/80 px-1.5 py-0.5 font-label-caps text-[9px] text-on-surface-variant">
            WEB
          </span>
        </div>
        <div className="relative aspect-[9/16] overflow-hidden rounded border border-divider bg-surface-container-low">
          {hasMediaSrc(mobileSrc) ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={mobileSrc}
              alt={`${title} — mobile crop`}
              className="h-full w-full object-cover"
            />
          ) : (
            <div className="h-full w-full bg-surface-container" aria-hidden />
          )}
          <span className="absolute bottom-1 left-1 bg-background/80 px-1.5 py-0.5 font-label-caps text-[9px] text-on-surface-variant">
            MOBILE
          </span>
        </div>
      </div>
      <div className="flex flex-col">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-body-md font-medium text-primary">{title}</h3>
          <button
            type="button"
            onClick={onDelete}
            className="shrink-0 rounded-full border border-divider-strong p-1.5 text-on-surface-variant transition-colors hover:border-error hover:text-error"
            aria-label="Delete photo"
          >
            <span className="material-symbols-outlined text-[18px]">delete</span>
          </button>
        </div>
        <p className="mt-1 font-label-caps text-[10px] text-on-surface-variant">{meta}</p>
      </div>
    </div>
  );
}
