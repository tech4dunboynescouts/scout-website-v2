import { ImageResponse } from "next/og";
import { siteUrl } from "@/lib/siteConfig";

export const runtime = "edge";

const size = {
  width: 1200,
  height: 630,
};

export const contentType = "image/png";

export function GET() {
  const logoUrl = new URL("/images/logo.jpg", siteUrl).toString();

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          width: "100%",
          height: "100%",
          position: "relative",
          overflow: "hidden",
          background: "linear-gradient(140deg, #0D2044 0%, #17376B 58%, #E8640A 100%)",
          color: "#FFFFFF",
          fontFamily: "Arial",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background:
              "radial-gradient(circle at top right, rgba(255,255,255,0.16) 0, rgba(255,255,255,0.06) 18%, transparent 42%), radial-gradient(circle at bottom left, rgba(255,255,255,0.12) 0, transparent 36%)",
          }}
        />
        <div
          style={{
            display: "flex",
            flex: 1,
            padding: "56px 64px",
            alignItems: "stretch",
            justifyContent: "space-between",
            gap: 40,
          }}
        >
          <div
            style={{
              display: "flex",
              width: 320,
              flexDirection: "column",
              justifyContent: "space-between",
              padding: 24,
              borderRadius: 32,
              background: "rgba(255,255,255,0.12)",
              border: "1px solid rgba(255,255,255,0.18)",
              boxShadow: "0 18px 45px rgba(7, 15, 31, 0.24)",
              backdropFilter: "blur(6px)",
            }}
          >
            <div
              style={{
                display: "flex",
                width: 180,
                height: 180,
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 999,
                background: "rgba(13, 32, 68, 0.85)",
                alignSelf: "center",
                overflow: "hidden",
                border: "6px solid rgba(255,255,255,0.18)",
              }}
            >
              <img
                src={logoUrl}
                alt="1st Meath Dunboyne Scout Group logo"
                width="160"
                height="160"
                style={{ display: "flex", width: 160, height: 160, objectFit: "cover" }}
              />
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 12,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 20,
                  fontWeight: 700,
                  textTransform: "uppercase",
                  letterSpacing: 2.2,
                  color: "#FFD7BB",
                }}
              >
                Established 1973
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 28,
                  lineHeight: 1.25,
                  opacity: 0.95,
                }}
              >
                Beavers, Cubs, Scouts, Ventures and a unique Water Section in Dunboyne, Co. Meath.
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              flex: 1,
              flexDirection: "column",
              justifyContent: "space-between",
              paddingTop: 8,
              paddingBottom: 8,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 14,
                fontSize: 22,
                fontWeight: 700,
                textTransform: "uppercase",
                letterSpacing: 2.8,
                color: "#FFE5D4",
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: 56,
                  height: 4,
                  borderRadius: 999,
                  background: "#FFB27A",
                }}
              />
              1st Meath Dunboyne Scout Group
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: 22,
                maxWidth: 680,
              }}
            >
              <div
                style={{
                  display: "flex",
                  fontSize: 78,
                  fontWeight: 800,
                  lineHeight: 1.02,
                  letterSpacing: -2,
                }}
              >
                Skills for Life.
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 78,
                  fontWeight: 800,
                  lineHeight: 1.02,
                  letterSpacing: -2,
                  color: "#FFD7BB",
                }}
              >
                Adventure for Everyone.
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 30,
                  lineHeight: 1.35,
                  color: "rgba(255,255,255,0.9)",
                  maxWidth: 640,
                }}
              >
                A highly active scout group serving young people and families across Dunboyne with outdoor adventure, community and leadership.
              </div>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div
                style={{
                  display: "flex",
                  gap: 14,
                  fontSize: 20,
                  color: "#FFF3EA",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    padding: "10px 16px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.14)",
                  }}
                >
                  Outdoors
                </div>
                <div
                  style={{
                    display: "flex",
                    padding: "10px 16px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.14)",
                  }}
                >
                  Community
                </div>
                <div
                  style={{
                    display: "flex",
                    padding: "10px 16px",
                    borderRadius: 999,
                    background: "rgba(255,255,255,0.12)",
                    border: "1px solid rgba(255,255,255,0.14)",
                  }}
                >
                  Water Section
                </div>
              </div>
              <div
                style={{
                  display: "flex",
                  fontSize: 20,
                  fontWeight: 700,
                  letterSpacing: 1.2,
                  color: "#FFE5D4",
                }}
              >
                dunboynescouts.com
              </div>
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}