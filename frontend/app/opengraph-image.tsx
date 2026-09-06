import { ImageResponse } from "next/og";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

export const runtime = "nodejs";
export const alt = "Sarvagya Singh — Full-Stack & Backend Engineer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OpengraphImage() {
  const mark = await readFile(join(process.cwd(), "public", "brand", "mark-256.png"));
  const markSrc = `data:image/png;base64,${mark.toString("base64")}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "72px 80px",
          background: "#0b0b0f",
          color: "#f5f6f8",
          fontFamily: "Helvetica, Arial, sans-serif",
        }}
      >
        <div
          style={{
            position: "absolute",
            top: -260,
            right: -180,
            width: 760,
            height: 760,
            borderRadius: 999,
            background:
              "radial-gradient(circle, rgba(139,92,246,0.42) 0%, rgba(99,102,241,0.14) 46%, rgba(11,11,15,0) 72%)",
          }}
        />

        <div style={{ display: "flex", alignItems: "center", gap: 22 }}>
          <img src={markSrc} width={64} height={64} alt="" />
          <div style={{ display: "flex", flexDirection: "column" }}>
            <div style={{ fontSize: 30, fontWeight: 700, letterSpacing: -0.4 }}>
              Sarvagya Singh
            </div>
            <div style={{ fontSize: 17, letterSpacing: 3.4, color: "#8b93a1" }}>
              FULL-STACK DEVELOPER
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div style={{ fontSize: 62, fontWeight: 700, lineHeight: 1.1, letterSpacing: -1.6 }}>
            I build the boring infrastructure
          </div>
          <div style={{ fontSize: 62, fontWeight: 700, lineHeight: 1.1, letterSpacing: -1.6, color: "#a78bfa" }}>
            that other people build on.
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 14, fontSize: 21, color: "#8b93a1" }}>
          <span>Node.js</span><span>·</span>
          <span>TypeScript</span><span>·</span>
          <span>MySQL</span><span>·</span>
          <span>RabbitMQ</span><span>·</span>
          <span>Three.js</span>
          <span style={{ marginLeft: "auto", color: "#f5f6f8" }}>sarvagyasingh.space</span>
        </div>
      </div>
    ),
    size
  );
}
