import { readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import type { ImageResponse } from "next/og";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".webp": "image/webp",
};

// Reads a static asset from /public and returns it as a base64 data URI, avoiding
// a network round-trip.
export async function publicAssetToDataUri(publicPath: string): Promise<string> {
  const filePath = path.join(process.cwd(), "public", publicPath);
  const buffer = await readFile(filePath);
  const ext = path.extname(publicPath).toLowerCase();
  const mimeType = MIME_TYPES[ext] ?? "application/octet-stream";
  return `data:${mimeType};base64,${buffer.toString("base64")}`;
}

// Converts an ImageResponse (which produces ~1MB uncompressed PNG) into a highly compressed,
// high-quality JPEG (< 100 KB), ensuring full compatibility with WhatsApp (< 300 KB limit).
export async function toJpegResponse(
  imageResponse: ImageResponse,
  quality = 82
): Promise<Response> {
  const pngBuffer = Buffer.from(await imageResponse.arrayBuffer());
  const jpegBuffer = await sharp(pngBuffer)
    .jpeg({ quality, mozjpeg: true })
    .toBuffer();

  return new Response(new Uint8Array(jpegBuffer), {
    headers: {
      "Content-Type": "image/jpeg",
      "Content-Length": String(jpegBuffer.byteLength),
      "Cache-Control": "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, OPTIONS",
    },
  });
}
