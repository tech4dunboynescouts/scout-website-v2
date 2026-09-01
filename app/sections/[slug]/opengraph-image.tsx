import { ImageResponse } from "next/og";
import { client } from "@/sanity/lib/client";
import { sectionPageBySlugQuery } from "@/sanity/lib/queries";
import sectionsJson from "@/data/sections.json";
import { stripEmoji } from "@/lib/stripEmoji";
import { publicAssetToDataUri, toJpegResponse } from "@/lib/ogImageAssets";

export const contentType = "image/jpeg";
export const size = {
  width: 1200,
  height: 630,
};

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const sanity = await client.fetch(sectionPageBySlugQuery, { slug }).catch(() => null);
  const json = sectionsJson.find((s) => s.slug === slug);

  const name = stripEmoji(sanity?.name ?? json?.name ?? "Section");
  const tagline = sanity?.tagline ?? json?.tagline ?? "";
  const heroImagePath: string | null = sanity?.heroImage ?? json?.image ?? null;
  // Sanity CDN URLs are fetched over the network; local /images/... fallback
  // paths (JSON-only sections) are read straight from disk for speed/reliability.
  const heroImage = heroImagePath
    ? heroImagePath.startsWith("http")
      ? heroImagePath
      : await publicAssetToDataUri(heroImagePath)
    : undefined;
  const logoUrl = await publicAssetToDataUri("/images/logo.jpg");

  const image = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          color: "#ffffff",
          fontFamily: "Arial",
          overflow: "hidden",
        }}
      >
        {heroImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={heroImage}
            alt=""
            width={size.width}
            height={size.height}
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              objectFit: "cover",
            }}
          />
        ) : (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: "flex",
              background: "linear-gradient(135deg, #0f2c52 0%, #1d4a7a 65%, #f97316 100%)",
            }}
          />
        )}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            display: "flex",
            background:
              "linear-gradient(180deg, rgba(15,44,82,0.4) 0%, rgba(15,44,82,0.6) 50%, rgba(15,44,82,0.93) 100%)",
          }}
        />

        <div
          style={{
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            position: "relative",
            width: "100%",
            padding: "64px 72px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={logoUrl}
              alt=""
              width={72}
              height={72}
              style={{ borderRadius: "50%", border: "2px solid rgba(255,255,255,0.5)" }}
            />
            <div
              style={{
                display: "flex",
                fontSize: 26,
                fontWeight: 700,
                letterSpacing: 1,
                textTransform: "uppercase",
                opacity: 0.95,
              }}
            >
              1st Meath Dunboyne Scout Group
            </div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 980 }}>
            <div style={{ display: "flex", fontSize: 96, fontWeight: 800, lineHeight: 1.02 }}>{name}</div>
            {tagline && (
              <div style={{ display: "flex", fontSize: 32, opacity: 0.9 }}>{tagline}</div>
            )}
          </div>
        </div>
      </div>
    ),
    size,
  );

  return toJpegResponse(image);
}
