"use client";

import { motion } from "framer-motion";
import { Crown, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { RankingItem } from "@/types/common";
import styles from "./RankingPodium.module.css";

interface RankingPodiumProps {
  items: RankingItem[];
}

export default function RankingPodium({ items }: RankingPodiumProps) {
  // Ensure we have 3 slots even if empty (for layout stability)
  const top3 = [
    items.find((i) => i.rank === 1) || null,
    items.find((i) => i.rank === 2) || null,
    items.find((i) => i.rank === 3) || null,
  ];

  // Reorder for Podium: 2nd (Left), 1st (Center), 3rd (Right)
  const podiumOrder = [top3[1], top3[0], top3[2]];

  const getRankClass = (rank: number) => {
    // 1위만 특별, 2위와 3위는 동일한 엘리트 스타일
    if (rank === 1) return styles.rank1;
    return styles.elite; // 2위, 3위 동일
  };

  const getRankIcon = (rank: number) => {
    if (rank === 1) return <Crown size={24} />;
    return <Star size={20} />; // 2위, 3위는 동일한 Star 아이콘
  };

  const formatAmount = (amount: number) => {
    if (amount >= 100000000) return `${(amount / 100000000).toFixed(1)}억`;
    if (amount >= 10000) return `${(amount / 10000).toFixed(1)}만`;
    return amount.toLocaleString();
  };

  // 닉네임에서 이니셜 생성 (아바타 없을 때 사용)
  const getInitials = (name: string) => {
    // 한글은 첫 글자, 영어는 첫 2글자
    const cleaned = name.replace(/[^가-힣a-zA-Z]/g, '');
    if (/[가-힣]/.test(cleaned)) {
      return cleaned.slice(0, 2);
    }
    return cleaned.slice(0, 2).toUpperCase();
  };

  return (
    <div className={styles.container}>
      {podiumOrder.map((item, i) => {
        // Correct rank based on position in array
        // i=0 -> Rank 2, i=1 -> Rank 1, i=2 -> Rank 3
        const rank = i === 1 ? 1 : i === 0 ? 2 : 3;

        if (!item) {
          // Placeholder for empty slot
          return (
            <div
              key={`empty-${rank}`}
              className={`${styles.podiumWrapper} ${getRankClass(rank)}`}
            >
              <div className={styles.cube}>
                <div className={styles.top} />
                <div className={styles.face} />
              </div>
            </div>
          );
        }

        const Content = (
          <motion.div
            className={`${styles.podiumWrapper} ${getRankClass(rank)}`}
            initial={{ opacity: 0, scale: 0.9, y: 50 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.6, delay: i * 0.15 }}
          >
            {/* Avatar Section (Floating) - 화려한 닉네임 이니셜 표시 */}
            <div className={styles.avatarSection}>
              <div className={styles.avatar}>
                {item.avatarUrl ? (
                  <Image
                    src={item.avatarUrl}
                    alt={item.donorName}
                    fill
                    className={styles.avatarImage}
                    unoptimized
                  />
                ) : (
                  <div className={styles.initialsWrapper}>
                    <span className={styles.initials}>
                      {getInitials(item.donorName)}
                    </span>
                  </div>
                )}
              </div>
              <div className={styles.rankBadge}>
                {getRankIcon(rank)}
                <span className={styles.rankNumber}>{rank}</span>
              </div>
            </div>

            {/* 3D Glass Cube */}
            <div className={styles.cube}>
              <div className={styles.top}>
                <div className={styles.shine} />
              </div>
              <div className={`${styles.face} ${styles.front}`}>
                <div className={styles.info}>
                  <p className={styles.name} title={item.donorName}>
                    {item.donorName}
                  </p>
                  <p className={styles.amount}>
                    {formatAmount(item.totalAmount)}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        );

        // Top 3만 개인 페이지 링크 (올바른 경로: /ranking/${item.donorId})
        if (item.donorId) {
          return (
            <Link
              key={item.donorId}
              href={`/ranking/${item.donorId}`}
              style={{ display: "contents" }}
            >
              {Content}
            </Link>
          );
        }

        return (
          <div key={item.donorName} style={{ display: "contents" }}>
            {Content}
          </div>
        );
      })}
    </div>
  );
}
