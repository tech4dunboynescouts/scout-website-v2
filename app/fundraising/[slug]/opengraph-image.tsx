import { ImageResponse } from "next/og";
import { client } from "@/sanity/lib/client";
import { fundraisingCampaignBySlugQuery } from "@/sanity/lib/queries";
import { stripEmoji } from "@/lib/stripEmoji";

export const runtime = "edge";
export const contentType = "image/png";
export const size = {
  width: 1200,
  height: 630,
};

function formatEuro(value: number): string {
  return new Intl.NumberFormat("en-IE", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(value);
}

export default async function OpenGraphImage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const campaign = await client.fetch(fundraisingCampaignBySlugQuery, { slug }).catch(() => null);

  const title = stripEmoji(campaign?.title ?? "Fundraising Campaign");
  const raised = typeof campaign?.raised === "number" ? campaign.raised : 0;
  const target = typeof campaign?.target === "number" ? campaign.target : 0;
  const progress = target > 0 ? Math.min((raised / target) * 100, 100) : 0;
  const coverImage: string | undefined = campaign?.coverImage;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          position: "relative",
          background: "linear-gradient(135deg, #0b2d4f 0%, #154a78 60%, #f97316 100%)",
          color: "#ffffff",
          padding: "72px",
          fontFamily: "Arial",
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
                "linear-gradient(180deg, rgba(11,45,79,0.35) 0%, rgba(11,45,79,0.55) 55%, rgba(11,45,79,0.92) 100%)",
            }}
          />
        )}

        <div style={{ display: "flex", flexDirection: "column", justifyContent: "space-between", width: "100%" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <div
              style={{
                display: "flex",
                fontSize: 30,
                fontWeight: 700,
                letterSpacing: 0.8,
                textTransform: "uppercase",
                opacity: 0.95,
              }}
            >
              1st Meath Dunboyne Scout Group
            </div>
            <div style={{ display: "flex", fontSize: 28, opacity: 0.9 }}>Fundraising Campaign</div>
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 26, maxWidth: 980 }}>
            <div style={{ display: "flex", fontSize: 64, lineHeight: 1.06, fontWeight: 800 }}>{title}</div>

            <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
              <div
                style={{
                  display: "flex",
                  width: "100%",
                  height: 20,
                  borderRadius: 999,
                  background: "rgba(255,255,255,0.24)",
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    height: "100%",
                    width: `${Math.max(progress, 8)}%`,
                    background: "#f97316",
                  }}
                />
              </div>
              <div style={{ display: "flex", fontSize: 30, fontWeight: 700 }}>
                {target > 0 ? `${formatEuro(raised)} raised of ${formatEuro(target)}` : `${formatEuro(raised)} raised`}
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
