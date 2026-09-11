/**
 * Safe Image URL Resolver
 * Handles full URLs, relative paths (/uploads/...), backend filenames, and avatar fallbacks
 */
export const getProfileImageUrl = (imageUrl, name = "User", bg = "2563eb") => {
  if (!imageUrl || typeof imageUrl !== "string" || !imageUrl.trim()) {
    const encoded = encodeURIComponent(name || "User");
    return `https://ui-avatars.com/api/?name=${encoded}&background=${bg}&color=fff&size=200`;
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
