import { ImageResponse } from "next/og";
import { siteUrl } from "@/lib/siteConfig";

export const runtime = "edge";
export const alt = "1st Meath Dunboyne Scout Group social preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  const heroImage = new URL("/images/photo-1501854140801-50d01698950b.jpg", siteUrl).toString();
  const logo = new URL("/images/logo.jpg", siteUrl).toString();

  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          position: "relative",
          height: "100%",
          width: "100%",
          color: "white",
          fontFamily: "Arial",
          overflow: "hidden",
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
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
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            background:
              "linear-gradient(135deg, rgba(15,44,82,0.92) 0%, rgba(15,44,82,0.82) 45%, rgba(249,115,22,0.55) 100%)",
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
              src={logo}
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
            <div style={{ display: "flex", fontSize: 64, fontWeight: 800, lineHeight: 1.06 }}>
              Skills For Life.
              <br />
              Adventure For Everyone.
            </div>
            <div style={{ display: "flex", fontSize: 32, opacity: 0.9 }}>
              Beavers, Cubs, Scouts, Ventures, Rovers and Water Section
            </div>
          </div>
        </div>
      </div>
    ),
    size,
  );
}
