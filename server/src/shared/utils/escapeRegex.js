/**
 * Escapes regex metacharacters so user-supplied text is matched literally
 * (prevents regex injection / catastrophic backtracking in $regex queries).
 */
const escapeRegex = (value) => String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export default escapeRegex;
