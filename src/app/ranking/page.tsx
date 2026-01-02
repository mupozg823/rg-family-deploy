"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Crown, Sparkles, ChevronDown } from "lucide-react";
import { useRanking } from "@/lib/hooks/useRanking";
import {
  RankingPodium,
  RankingFullList,
} from "@/components/ranking";
import styles from "./page.module.css";

export default function TotalRankingPage() {
  const listRef = useRef<HTMLDivElement>(null);

  const scrollToList = () => {
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const {
    rankings,
    unitFilter,
    maxAmount,
    isLoading,
    setUnitFilter,
  } = useRanking();

  // 50위까지만 표시
  const top50 = rankings.slice(0, 50);
  const top3 = top50.slice(0, 3);

  return (
    <main className={styles.main}>
      {/* Minimal Navigation Bar */}
      <nav className={styles.pageNav}>
        <Link href="/" className={styles.backBtn}>
          <ArrowLeft size={18} />
        </Link>
        <div className={styles.navTitle}>
          <Sparkles size={14} />
          <span>RANKINGS</span>
        </div>
        <Link href="/ranking/vip" className={styles.vipBtn}>
          <Crown size={14} />
          <span>VIP</span>
        </Link>
      </nav>

      {/* Premium Hero Section */}
      <div className={styles.hero}>
        <motion.div
          className={styles.heroContent}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.heroBadge}>ELITE</span>
          <h1 className={styles.title}>RANKINGS</h1>
          <p className={styles.subtitle}>Top Supporters of RG Family</p>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.button
          onClick={scrollToList}
          className={styles.scrollIndicator}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{
            opacity: { delay: 1 },
            y: { duration: 1.5, repeat: Infinity }
          }}
        >
          <ChevronDown size={24} />
        </motion.button>
      </div>

      <div className={styles.container}>
        {/* Minimal Filters */}
        <div className={styles.filters}>
          <div className={styles.unitFilter}>
            {(["excel", "crew", "all"] as const).map((unit) => (
              <button
                key={unit}
                onClick={() => setUnitFilter(unit)}
                className={`${styles.unitButton} ${
                  unitFilter === unit ? styles.active : ""
                }`}
                data-unit={unit}
              >
                {unit === "excel"
                  ? "EXCEL"
                  : unit === "crew"
                  ? "CREW"
                  : "ALL"}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
          </div>
        ) : rankings.length === 0 ? (
          <div className={styles.empty}>
            <p>No rankings available</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            <section className={styles.podiumSection}>
              <RankingPodium items={top3} />
            </section>

            {/* Full Ranking List */}
            <section ref={listRef} className={styles.fullListSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Full Rankings</h2>
                <span className={styles.sectionBadge}>TOP 50</span>
              </div>
              <RankingFullList
                rankings={top50}
                maxAmount={maxAmount}
                limit={50}
              />
            </section>
          </>
        )}
      </div>
    </main>
  );
}
