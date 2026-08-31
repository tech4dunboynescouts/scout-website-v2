// Removes emoji glyphs from text used in generated OG images (next/og's Arial-only
// renderer can't reliably draw every emoji, leaving tofu boxes for unsupported ones).
export function stripEmoji(value: string): string {
  return value
    .replace(/[\p{Extended_Pictographic}\u{1F1E6}-\u{1F1FF}\u200d\uFE0F]/gu, "")
    .replace(/\s+/g, " ")
    .trim();
}
