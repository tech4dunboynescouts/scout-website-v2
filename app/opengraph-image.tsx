import { ImageResponse } from "next/og";
import { publicAssetToDataUri, toJpegResponse } from "@/lib/ogImageAssets";

export const alt = "1st Meath Dunboyne Scout Group social preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/jpeg";

export default async function OpenGraphImage() {
  const [heroImage, logo] = await Promise.all([
    publicAssetToDataUri("/images/photo-1501854140801-50d01698950b.jpg"),
    publicAssetToDataUri("/images/logo.jpg"),
  ]);

  const image = new ImageResponse(
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
              justifyContent: "center",
            position: "relative",
            width: "100%",
              padding: "56px 72px",
          }}
        >
            <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logo}
                alt=""
                width={76}
                height={76}
                style={{ borderRadius: "50%", border: "2px solid rgba(255,255,255,0.5)" }}
              />
              <div
                style={{
                  display: "flex",
                  fontSize: 24,
                  fontWeight: 700,
                  letterSpacing: 1.4,
                  textTransform: "uppercase",
                  opacity: 0.95,
                }}
              >
                1st Meath Dunboyne Scout Group
              </div>
            </div>
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                marginTop: 104,
                maxWidth: 920,
              }}
            >
              <div
                style={{
                  display: "flex",
                  width: 88,
                  height: 5,
                  marginBottom: 24,
                  background: "#f97316",
                }}
              />
              <div
                style={{
                  display: "flex",
                  fontSize: 70,
                  fontWeight: 800,
                  lineHeight: 1.04,
                }}
              >
                Over 50 years of
              </div>
              <div
                style={{
                  display: "flex",
                  marginTop: 8,
                  fontSize: 70,
                  fontWeight: 800,
                  lineHeight: 1.04,
                  color: "#fed7aa",
                }}
              >
                Scouting in Dunboyne.
              </div>
            </div>
          </div>
      </div>
    ),
    size,
  );

  return toJpegResponse(image);
}
