import Navbar from "@/components/Navbar";
import Hero from "@/components/Hero";
import LiveMembers from "@/components/LiveMembers";
import Notice from "@/components/Notice";
import Shorts from "@/components/Shorts";
import VOD from "@/components/VOD";

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
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 0.8fr",
            gap: "3rem",
          }}
        >
          <LiveMembers />
          <Notice />
        </div>

        <Shorts />
        <VOD />
      </div>

      {/* Footer Placeholder */}
      <footer
        style={{
          width: "100%",
          padding: "2rem",
          borderTop: "1px solid rgba(255,255,255,0.1)",
          marginTop: "4rem",
          textAlign: "center",
          color: "#666",
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
          <strong>RG FAMILY</strong>
          <div style={{ display: "flex", gap: "1rem" }}>
            <span>약관</span>
            <span>정책</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
