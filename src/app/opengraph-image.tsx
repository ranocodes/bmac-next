import { ImageResponse } from "next/og";

export const alt = "BMAC Jos — Brilliant Minds Ambassadors Club";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "linear-gradient(135deg, #1c1917 0%, #292524 60%, #3f3f36 100%)",
          padding: "72px",
          color: "#fafaf9",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: 14,
              background: "#f59e0b",
              color: "#1c1917",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 30,
              fontWeight: 800,
            }}
          >
            B
          </div>
          <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: 2 }}>
            BMAC JOS
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={{ fontSize: 68, fontWeight: 800, lineHeight: 1.05, maxWidth: 900 }}>
            Empowering Young Minds in Jos
          </div>
          <div style={{ fontSize: 28, color: "#d6d3d1", maxWidth: 820 }}>
            Public speaking · Literary arts · Mentorship · Digital literacy
          </div>
        </div>

        <div style={{ fontSize: 22, color: "#a8a29e" }}>
          Brilliant Minds Academic &amp; Career Foundation — bmacjos.org
        </div>
      </div>
    ),
    { ...size }
  );
}
