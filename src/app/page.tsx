import { Suspense } from "react";
import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import LiveMembers from "@/components/LiveMembers";
import Notice from "@/components/Notice";
import Shorts from "@/components/Shorts";
import VOD from "@/components/VOD";
import SectionSkeleton from "@/components/SectionSkeleton";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <div
        style={{
          maxWidth: "var(--max-width)",
          margin: "0 auto",
          padding: "2rem",
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
        }}
      >
        {/* Live & Notice Section */}
        <div className="live-notice-grid">
          <LiveMembers />
          <Notice />
        </div>

        <Suspense fallback={<SectionSkeleton type="shorts" />}>
          <Shorts />
        </Suspense>
        <Suspense fallback={<SectionSkeleton type="vod" />}>
          <VOD />
        </Suspense>
      </div>

      {/* Footer Placeholder */}
      <footer
        style={{
          width: "100%",
          padding: "2rem",
          borderTop: "1px solid var(--glass-border)",
          marginTop: "4rem",
          textAlign: "center",
          color: "var(--text-muted)",
          fontSize: "0.9rem",
        }}
      >
        <div
          style={{
            maxWidth: "var(--max-width)",
            margin: "0 auto",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <strong style={{ color: "var(--text-primary)" }}>RG FAMILY</strong>
          <div style={{ display: "flex", gap: "1rem" }}>
            <span>약관</span>
            <span>정책</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
