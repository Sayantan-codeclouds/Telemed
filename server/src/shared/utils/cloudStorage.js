import fs from "fs";

/**
 * Persistent media storage (Cloudinary).
 *
 * Uploads are written to the API server's local disk by multer first. On hosts
 * with an ephemeral filesystem (Render, Heroku, most containers) that disk is
 * wiped on every deploy and restart, so anything stored there — profile photos,
 * lab reports — silently disappears while the database keeps pointing at it.
 *
 * This module moves the file to Cloudinary and returns its permanent URL. The
 * caller stores that URL in place of the bare filename. Profile images are
 * public and served by their URL; lab reports are uploaded as private
 * ("authenticated") assets and only ever streamed through the API.
 *
 * Every failure path returns null rather than throwing, so an unconfigured or
 * unreachable Cloudinary degrades to the previous local-disk behaviour instead
 * of breaking uploads.
 */

export const isCloudStorageEnabled = () =>
  Boolean(
    process.env.CLOUDINARY_CLOUD_NAME &&
      process.env.CLOUDINARY_API_KEY &&
      process.env.CLOUDINARY_API_SECRET
  );

let configuredClient = null;

const getClient = async () => {
  if (configuredClient) return configuredClient;

  const { v2: cloudinary } = await import("cloudinary");
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });

  configuredClient = cloudinary;
  return configuredClient;
};

/**
 * Uploads a local file to Cloudinary and removes the local copy on success.
 *
 * @param {string} localFilePath Absolute path multer wrote the file to.
 * @param {string} folder Logical folder, e.g. "profile-images" | "lab-reports".
 * @param {object} [options]
 * @param {"upload"|"authenticated"} [options.deliveryType] "authenticated" keeps the
 *   asset private: it can only be fetched with a signed URL (used for lab reports).
 * @param {string} [options.mimetype] Used to pick the right Cloudinary resource
 *   type. Documents (PDFs) are stored as "raw" so they're preserved byte-exact
 *   rather than being treated as images and rasterised — important for medical
 *   records. Images use "image" so they can be optimised/transformed.
 * @returns {Promise<string|null>} Permanent https URL, or null to fall back to local storage.
 */
export const uploadToCloud = async (localFilePath, folder, options = {}) => {
  if (!isCloudStorageEnabled() || !localFilePath) return null;

  const { mimetype, deliveryType = "upload" } = options;
  const resourceType = !mimetype
    ? "auto"
    : mimetype.startsWith("image/")
    ? "image"
    : "raw";

  try {
    const cloudinary = await getClient();

    const result = await cloudinary.uploader.upload(localFilePath, {
      folder: `teleclinic/${folder}`,
      resource_type: resourceType,
      type: deliveryType,
      overwrite: true,
    });

    // Local copy is now redundant — best effort, never fail the upload over it.
    fs.promises.unlink(localFilePath).catch(() => {});

    return result.secure_url || null;
  } catch (err) {
    console.error(
      `[CloudStorage] Upload to ${folder} failed, keeping local file:`,
      err?.message || err
    );
    return null;
  }
};

/**
 * Derives a Cloudinary public_id from a delivery URL.
 *
 * URLs look like:
 *   https://res.cloudinary.com/<cloud>/<type>/upload/v<version>/<folder>/<name>.<ext>
 * The public_id is everything after the version segment. For "raw" assets the
 * extension is part of the id; for image/video it is not.
 */
const parseCloudinaryUrl = (url) => {
  // Authenticated/private URLs also carry a "s--<signature>--" segment.
  const match = /\/(image|video|raw)\/(upload|authenticated|private)\/(?:s--[^/]+--\/)?(?:v\d+\/)?([^?#]+)/.exec(url);
  if (!match) return null;

  const [, resourceType, deliveryType, rest] = match;
  const extension = (/\.([a-z0-9]+)$/i.exec(rest) || [])[1] || "";
  const publicId =
    resourceType === "raw" ? rest : rest.replace(/\.[a-z0-9]+$/i, "");

  return { resourceType, deliveryType, publicId, extension };
};

/**
 * URL the server can fetch a stored asset from. Public assets are returned
 * as-is; authenticated/private ones get a freshly signed delivery URL.
 * Never send the result to the browser for private files; stream it instead.
 */
export const getCloudFetchUrl = async (storedUrl) => {
  const parsed = typeof storedUrl === "string" ? parseCloudinaryUrl(storedUrl) : null;
  if (!parsed || parsed.deliveryType === "upload") return storedUrl;
  if (!isCloudStorageEnabled()) return null;

  const cloudinary = await getClient();
  return cloudinary.url(parsed.publicId, {
    resource_type: parsed.resourceType,
    type: parsed.deliveryType,
    sign_url: true,
    secure: true,
    ...(parsed.resourceType !== "raw" && parsed.extension && { format: parsed.extension }),
  });
};

/**
 * Removes a previously uploaded asset. Accepts the stored URL; anything that
 * isn't a Cloudinary URL (e.g. a legacy local filename) is ignored so callers
 * can pass whatever they have without branching.
 *
 * Best effort: a failure here is logged, never thrown, so it can't block the
 * database delete that matters.
 */
export const deleteFromCloud = async (storedUrl) => {
  if (!isCloudStorageEnabled()) return false;
  if (typeof storedUrl !== "string" || !storedUrl.includes("res.cloudinary.com")) {
    return false;
  }

  const parsed = parseCloudinaryUrl(storedUrl);
  if (!parsed) return false;

  try {
    const cloudinary = await getClient();
    await cloudinary.uploader.destroy(parsed.publicId, {
      resource_type: parsed.resourceType,
      type: parsed.deliveryType,
      invalidate: true,
    });
    return true;
  } catch (err) {
    console.error("[CloudStorage] Delete failed:", err?.message || err);
    return false;
  }
};
