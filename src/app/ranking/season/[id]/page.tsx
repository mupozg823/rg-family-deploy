"use client";

import SectionHeader from "@/components/SectionHeader";

export default function SeasonRankingPage() {
  return (
    <div
      style={{
        maxWidth: "var(--max-width)",
        margin: "0 auto",
        padding: "4rem 2rem",
      }}
    >
      <SectionHeader title="SEASON RANKING" />
      <div
        style={{
          padding: "2rem",
          background: "rgba(255,255,255,0.05)",
          borderRadius: "12px",
          textAlign: "center",
        }}
      >
        <h2 style={{ color: "var(--primary)", marginBottom: "1rem" }}>
          시즌 랭킹 준비중
        </h2>
        <p style={{ color: "#888" }}>새로운 시즌이 곧 시작됩니다.</p>
      </div>
    </div>
  );
}
