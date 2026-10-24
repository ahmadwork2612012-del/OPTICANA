const MAX_DIMENSION = 1600;
const QUALITY = 0.85;

function loadImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      URL.revokeObjectURL(url);
      resolve(image);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error("Unable to read image"));
    };
    image.src = url;
  });
}

function canvasToBlob(canvas, type) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));
}

// Resizes large photos (e.g. straight from a phone camera) before upload.
// GIFs are left untouched to keep animation; if compression does not make the
// file smaller, the original is returned.
export async function compressImage(file) {
  if (!file?.type?.startsWith("image/") || file.type === "image/gif") return file;

  const image = await loadImage(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(image.naturalWidth, image.naturalHeight));
  const width = Math.max(1, Math.round(image.naturalWidth * scale));
  const height = Math.max(1, Math.round(image.naturalHeight * scale));

  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  canvas.getContext("2d").drawImage(image, 0, 0, width, height);

  // Browsers that cannot encode WebP fall back to PNG; use JPEG instead then.
  let blob = await canvasToBlob(canvas, "image/webp");
  if (!blob || blob.type !== "image/webp") blob = await canvasToBlob(canvas, "image/jpeg");
  if (!blob || blob.size >= file.size) return file;

  return blob;
}

export default compressImage;
