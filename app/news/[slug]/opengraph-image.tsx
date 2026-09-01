import { ImageResponse } from "next/og";
import { client } from "@/sanity/lib/client";
import { newsArticleBySlugQuery } from "@/sanity/lib/queries";
import { stripEmoji } from "@/lib/stripEmoji";
import { publicAssetToDataUri, toJpegResponse } from "@/lib/ogImageAssets";

export const contentType = "image/jpeg";
export const size = {
  width: 1200,
  height: 630,
};

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const [article, logoUrl] = await Promise.all([
    client.fetch(newsArticleBySlugQuery, { slug }).catch(() => null),
    publicAssetToDataUri("/images/logo.jpg"),
  ]);

  const title = stripEmoji(article?.title ?? "News & Events");
  const tag = article?.tag ?? "Latest Update";
  const coverImage: string | undefined = article?.image;

  const image = new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "linear-gradient(135deg, #0f2c52 0%, #1d4a7a 65%, #f97316 100%)",
          color: "#ffffff",
          padding: "64px 72px",
          fontFamily: "Arial",
          overflow: "hidden",
        }}
      >
        {coverImage && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={coverImage}
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
        )}
        {coverImage && (
          <div
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              background:
                "linear-gradient(180deg, rgba(15,44,82,0.35) 0%, rgba(15,44,82,0.55) 55%, rgba(15,44,82,0.92) 100%)",
            }}
          />
        )}

        <div
          style={{
            position: "absolute",
            top: "64px",
            right: "72px",
            display: "flex",
            alignItems: "center",
            padding: "10px 18px",
            borderRadius: "999px",
            border: "1px solid rgba(255,255,255,0.35)",
            background: "rgba(255,255,255,0.14)",
            fontSize: 24,
            fontWeight: 700,
            letterSpacing: 0.3,
          }}
        >
          {tag}
        </div>

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%" }}>
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

          <div style={{ display: "flex", flexDirection: "column", gap: 24, maxWidth: 980 }}>
            <div style={{ display: "flex", fontSize: 68, lineHeight: 1.05, fontWeight: 800 }}>
              {title}
            </div>
            <div style={{ display: "flex", fontSize: 30, opacity: 0.9 }}>
              News & Events
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );

  return toJpegResponse(image);
}
