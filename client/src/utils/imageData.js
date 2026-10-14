/**
 * Converts any browser-displayable image (uploaded file data URL, SVG, ...)
 * into a compact PNG data URL — or JPEG if the PNG would still be too big —
 * scaled to fit `maxWidth` x `maxHeight`.
 *
 * Used for doctor signatures and clinic stamps: they're stored inline (the API
 * accepts PNG/JPEG up to ~500 KB) and drawn into prescription PDFs, which
 * can't render SVG or WebP.
 */
const MAX_DATA_URL_LENGTH = 650000; // stays under the API's ~700k character limit

export function toCompactImageDataUrl(src, { maxWidth = 800, maxHeight = 400 } = {}) {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const scale = Math.min(1, maxWidth / (image.naturalWidth || maxWidth), maxHeight / (image.naturalHeight || maxHeight));
      const width = Math.max(1, Math.round((image.naturalWidth || maxWidth) * scale));
      const height = Math.max(1, Math.round((image.naturalHeight || maxHeight) * scale));

      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(image, 0, 0, width, height);

      const png = canvas.toDataURL("image/png");
      if (png.length <= MAX_DATA_URL_LENGTH) {
        resolve(png);
        return;
      }

      // Too big as PNG (e.g. a photo): JPEG on a white background.
      const flat = document.createElement("canvas");
      flat.width = width;
      flat.height = height;
      const flatCtx = flat.getContext("2d");
      flatCtx.fillStyle = "#ffffff";
      flatCtx.fillRect(0, 0, width, height);
      flatCtx.drawImage(canvas, 0, 0);
      for (const quality of [0.85, 0.7, 0.55]) {
        const jpeg = flat.toDataURL("image/jpeg", quality);
        if (jpeg.length <= MAX_DATA_URL_LENGTH) {
          resolve(jpeg);
          return;
        }
      }
      reject(new Error("This image is too detailed to use. Please choose a smaller or simpler image."));
    };
    image.onerror = () => reject(new Error("Could not read this image. Please use a PNG or JPG file."));
    image.src = src;
  });
}

/** Escapes text for safe insertion into SVG/XML markup. */
export const escapeXml = (value) =>
  String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
