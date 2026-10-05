/**
 * Upload type whitelists. The stored file extension is always taken from
 * these maps (never from the client's filename), so an upload can't be
 * saved as .html/.svg/.js and later served as active content from /uploads.
 */
export const IMAGE_MIME_EXTENSIONS = {
  "image/jpeg": ".jpg",
  "image/jpg": ".jpg",
  "image/pjpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
  "image/gif": ".gif",
  "image/bmp": ".bmp",
  "image/avif": ".avif",
  "image/heic": ".heic",
  "image/heif": ".heif",
};

export const LAB_REPORT_MIME_EXTENSIONS = {
  ...IMAGE_MIME_EXTENSIONS,
  "application/pdf": ".pdf",
};
