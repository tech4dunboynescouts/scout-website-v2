import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "1st Meath Dunboyne Scout Group social preview";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          height: "100%",
          width: "100%",
          background: "linear-gradient(135deg, #0f2c52 0%, #1d4a7a 60%, #f97316 100%)",
          color: "white",
          padding: "72px",
          flexDirection: "column",
          justifyContent: "space-between",
          fontFamily: "Arial",
        }}
      >
        <div
          style={{
            fontSize: 26,
            fontWeight: 700,
            letterSpacing: 1,
            textTransform: "uppercase",
            opacity: 0.95,
          }}
        >
          1st Meath Dunboyne Scout Group
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 18, maxWidth: 960 }}>
          <div style={{ fontSize: 64, fontWeight: 800, lineHeight: 1.06 }}>
            Skills For Life.
            <br />
            Adventure For Everyone.
          </div>
          <div style={{ fontSize: 32, opacity: 0.9 }}>
            Beavers, Cubs, Scouts, Ventures and Water Section
          </div>
        </div>
      </div>
    ),
    size,
  );
}
