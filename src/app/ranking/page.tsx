"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";
import styles from "./page.module.css";

export default function RankingPage() {
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>후원 랭킹</h1>
        <p>RG FAMILY 명예의 전당</p>
      </header>

      <div className={styles.grid}>
        {/* Total Ranking Card */}
        <Link href="/ranking/total" className={styles.card}>
          <div className={styles.cardContent}>
            <h2>전체 랭킹</h2>
            <p>RG FAMILY 출범 이후 누적 랭킹</p>
            <div className={styles.icon}>
              <ChevronRight color="var(--primary)" size={32} />
            </div>
          </div>
          <div className={styles.bg} />
        </Link>

        {/* Season Ranking Card */}
        <Link href="/ranking/season/current" className={styles.card}>
          <div className={styles.cardContent}>
            <h2>이번 시즌 랭킹</h2>
            <p>현재 진행중인 시즌의 실시간 랭킹</p>
            <div className={styles.icon}>
              <ChevronRight color="var(--primary)" size={32} />
            </div>
          </div>
          <div className={styles.bg} />
        </Link>
      </div>
    </div>
  );
}
