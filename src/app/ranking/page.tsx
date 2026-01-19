"use client";

import { useRef, useState, useMemo } from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowLeft, Crown, Sparkles, ChevronDown, Calendar } from "lucide-react";
import Footer from "@/components/Footer";
import { mockSeasons, mockProfiles } from "@/lib/mock";
import type { RankingItem, UnitFilter } from "@/types/common";
import {
  RankingPodium,
  RankingFullList,
} from "@/components/ranking";
import styles from "./page.module.css";

// 현재 활성 시즌 가져오기
const getCurrentSeason = () => mockSeasons.find(s => s.is_active) || mockSeasons[mockSeasons.length - 1];

// Mock 프로필에서 랭킹 데이터 직접 생성
function getMockRankings(unitFilter: UnitFilter): RankingItem[] {
  let profiles = mockProfiles.filter(p => p.id !== 'admin-user');

  if (unitFilter && unitFilter !== 'all' && unitFilter !== 'vip') {
    profiles = profiles.filter(p => p.unit === unitFilter);
  }

  return profiles
    .filter(p => (p.total_donation || 0) > 0)
    .sort((a, b) => (b.total_donation || 0) - (a.total_donation || 0))
    .map((profile, index) => ({
      donorId: profile.id,
      donorName: profile.nickname,
      avatarUrl: profile.avatar_url,
      totalAmount: profile.total_donation || 0,
      rank: index + 1,
    }));
}

export default function TotalRankingPage() {
  const listRef = useRef<HTMLDivElement>(null);
  const [unitFilter, setUnitFilter] = useState<UnitFilter>('all');

  const scrollToList = () => {
    listRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  // Mock 데이터에서 직접 랭킹 생성
  const rankings = useMemo(() => getMockRankings(unitFilter), [unitFilter]);
  const maxAmount = rankings.length > 0 ? rankings[0].totalAmount : 0;

  // 50위까지만 표시
  const top50 = rankings.slice(0, 50);
  const top3 = top50.slice(0, 3);
  const currentSeason = getCurrentSeason();

  return (
      <div className={styles.main}>
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
        {/* Filters & Season Navigation */}
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

          {/* Season Info & Link */}
          <div className={styles.seasonNav}>
            <span className={styles.currentSeason}>
              <span className={styles.seasonLive} />
              {currentSeason.name}
            </span>
            <Link href="/ranking/season" className={styles.seasonBtn}>
              <Calendar size={12} />
              <span>시즌별 랭킹</span>
            </Link>
          </div>
        </div>

        {rankings.length === 0 ? (
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
        <Footer />
      </div>
  );
}
