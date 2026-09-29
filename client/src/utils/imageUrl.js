/**
 * Safe Image URL Resolver
 * Handles full URLs, relative paths (/uploads/...), backend filenames, and avatar fallbacks
 */
export const getAvatarFallbackUrl = (name = "User", bg = "2563eb") => {
  const encoded = encodeURIComponent(name || "User");
  return `https://ui-avatars.com/api/?name=${encoded}&background=${bg}&color=fff&size=200`;
};

export const getProfileImageUrl = (imageUrl, name = "User", bg = "2563eb") => {
  if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.trim()) {
    return getAvatarFallbackUrl(name, bg);
  }

  const trimmed = imageUrl.trim();

  // Full URL or Data URL
  if (/^https?:\/\//i.test(trimmed) || trimmed.startsWith("data:") || trimmed.startsWith("blob:")) {
    return trimmed;
  }

  const apiBase = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
  const backendUrl = apiBase.replace(/\/api\/?$/, "");

  // Relative path starting with /
  if (trimmed.startsWith("/")) {
    return `${backendUrl}${trimmed}`;
  }

  // Bare filename from uploads
  return `${backendUrl}/uploads/profile-images/${trimmed}`;
};

/**
 * onError handler for <img> avatars.
 *
 * A stored profile image can point at a file that no longer exists (uploads live
 * on the server's local disk, which is wiped on every deploy/restart on hosts
 * with an ephemeral filesystem). Without this, the browser renders a broken-image
 * icon; with it, the avatar degrades to the generated initials image.
 *
 * Usage: <img src={...} onError={handleAvatarError(fullName, "2563eb")} />
 */
export const handleAvatarError = (name = "User", bg = "2563eb") => (e) => {
  const fallback = getAvatarFallbackUrl(name, bg);
  // Guard against an infinite loop if the fallback itself fails to load.
  if (e.currentTarget.src === fallback) return;
  e.currentTarget.onerror = null;
  e.currentTarget.src = fallback;
};
