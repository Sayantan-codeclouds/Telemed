/**
 * jsPDF's built-in fonts (Helvetica etc.) only cover the Windows-1252
 * character set. A single character outside it (₹, ℞, Devanagari, emoji...)
 * makes jsPDF re-encode the whole line, which then prints as garbage.
 *
 * makePdfTextSafe(doc) patches doc.text / doc.splitTextToSize so every string
 * is first mapped to printable equivalents (₹ -> "Rs.", ℞ -> "Rx", other
 * currency symbols -> their ISO code) and anything else unsupported becomes
 * "?" (only that character is lost, not the line).
 */

// Characters outside Latin-1 that Windows-1252 (and so jsPDF) can still print.
const WIN_ANSI_EXTRAS = new Set("€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ");

const REPLACEMENTS = {
  "₹": "Rs.",
  "℞": "Rx",
  "₦": "NGN ",
  "₱": "PHP ",
  "₩": "KRW ",
  "₺": "TRY ",
  "₫": "VND ",
  "₴": "UAH ",
  "₽": "RUB ",
  "₪": "ILS ",
  "৳": "BDT ",
  "₸": "KZT ",
  "★": "*",
  "✓": "v",
  "✔": "v",
  "→": "->",
  "←": "<-",
  "≤": "<=",
  "≥": ">=",
  " ": " ",
};

const isPrintable = (char) => {
  const code = char.codePointAt(0);
  return (
    char === "\n" ||
    char === "\t" ||
    (code >= 0x20 && code <= 0x7e) ||
    (code >= 0xa0 && code <= 0xff) ||
    WIN_ANSI_EXTRAS.has(char)
  );
};

/** Maps a string to characters the PDF can print. */
export const pdfSafe = (value) => {
  if (value === null || value === undefined) return "";
  let out = "";
  for (const char of String(value)) {
    if (REPLACEMENTS[char] !== undefined) out += REPLACEMENTS[char];
    else out += isPrintable(char) ? char : "?";
  }
  return out;
};

/** Patches a jsPDF document so all text it draws or measures is PDF-safe. */
export const makePdfTextSafe = (doc) => {
  const rawText = doc.text.bind(doc);
  const rawSplit = doc.splitTextToSize.bind(doc);
  doc.text = (text, ...args) => rawText(Array.isArray(text) ? text.map(pdfSafe) : pdfSafe(text), ...args);
  doc.splitTextToSize = (text, ...args) => rawSplit(pdfSafe(text), ...args);
  return doc;
};

/** jsPDF image format for a data URL ("PNG" / "JPEG"), or null if unsupported. */
export const imageFormatOf = (dataUrl) => {
  const match = /^data:image\/(png|jpe?g)/i.exec(String(dataUrl || ""));
  if (!match) return null;
  return match[1].toLowerCase() === "png" ? "PNG" : "JPEG";
};
