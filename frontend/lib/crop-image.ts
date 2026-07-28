export type CropRect = {
  x: number;
  y: number;
  width: number;
  height: number;
};

export function loadImageFromFile(file: File): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Failed to load image"));
    };
    image.src = url;
  });
}

export function revokeImageObjectUrl(image: HTMLImageElement | null | undefined) {
  if (!image?.src.startsWith("blob:")) return;
  URL.revokeObjectURL(image.src);
}

export function cropImageToBlob(
  image: HTMLImageElement,
  crop: CropRect,
  fileName: string,
  quality = 0.92,
): Promise<File> {
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(crop.width);
  canvas.height = Math.round(crop.height);
  const ctx = canvas.getContext("2d");
  if (!ctx) return Promise.reject(new Error("Canvas unavailable"));

  ctx.drawImage(
    image,
    crop.x,
    crop.y,
    crop.width,
    crop.height,
    0,
    0,
    crop.width,
    crop.height,
  );

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error("Crop failed"));
          return;
        }
        resolve(new File([blob], fileName, { type: "image/jpeg" }));
      },
      "image/jpeg",
      quality,
    );
  });
}

export function computeCoverCrop(
  imageWidth: number,
  imageHeight: number,
  frameWidth: number,
  frameHeight: number,
  offsetX: number,
  offsetY: number,
  scale: number,
): CropRect {
  const displayedWidth = imageWidth * scale;
  const displayedHeight = imageHeight * scale;
  const imageLeft = (frameWidth - displayedWidth) / 2 + offsetX;
  const imageTop = (frameHeight - displayedHeight) / 2 + offsetY;

  const cropX = Math.max(0, (0 - imageLeft) / scale);
  const cropY = Math.max(0, (0 - imageTop) / scale);
  const cropW = Math.min(imageWidth - cropX, frameWidth / scale);
  const cropH = Math.min(imageHeight - cropY, frameHeight / scale);

  return { x: cropX, y: cropY, width: cropW, height: cropH };
}

export function minCoverScale(
  imageWidth: number,
  imageHeight: number,
  frameWidth: number,
  frameHeight: number,
) {
  return Math.max(frameWidth / imageWidth, frameHeight / imageHeight);
}
