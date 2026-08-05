import { ImageResponse } from "next/og";
import { NextRequest } from "next/server";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    // Falls back to the site title so the route can also serve as the
    // site-wide OpenGraph image, not only per-post cards.
    const title =
      searchParams.get("title") || "Syed Ahthesham Ali — Software Engineer";

    return new ImageResponse(
      (
        <div
          style={{
            height: "100%",
            width: "100%",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#0a0a0a",
            position: "relative",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: "32px",
              right: "32px",
              display: "flex",
              alignItems: "center",
              gap: "8px",
            }}
          >
            <span
              style={{
                color: "white",
                fontSize: "20px",
                fontWeight: 500,
              }}
            >
              ahthe.vercel.app
            </span>
          </div>

          <div
            style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "0 48px",
              maxWidth: "900px",
            }}
          >
            <h1
              style={{
                fontSize: "48px",
                fontWeight: 700,
                color: "#a7f3d0",
                lineHeight: 1.2,
                textAlign: "center",
                margin: 0,
              }}
            >
              {title}
            </h1>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
      }
    );
  } catch (e) {
    return new Response(`Failed to generate image: ${e.message}`, {
      status: 500,
    });
  }
}
