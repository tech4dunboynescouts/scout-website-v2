import { readFile } from "node:fs/promises";
import path from "node:path";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

// Reads a static asset from /public and returns it as a base64 data URI, avoiding
// a network round-trip (edge functions fetching their own deployment's /public
// assets over HTTP is slow/unreliable and has caused crawlers like Facebook's
// to report the generated OG image as corrupted/unprocessable).
export async function publicAssetToDataUri(publicPath: string): Promise<string> {
  const filePath = path.join(process.cwd(), "public", publicPath);
  const buffer = await readFile(filePath);
  const ext = path.extname(publicPath).toLowerCase();
  const mimeType = MIME_TYPES[ext] ?? "application/octet-stream";
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}
