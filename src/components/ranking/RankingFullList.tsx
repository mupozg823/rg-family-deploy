"use client";

import { motion } from "framer-motion";
import { Heart, MessageCircle } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { RankingItem } from "@/types/common";
import { formatAmountShort, getInitials, getTributePageUrl } from "@/lib/utils";
import styles from "./RankingFullList.module.css";

interface RankingFullListProps {
  rankings: RankingItem[];
  maxAmount: number;
  limit?: number;
}

export default function RankingFullList({
  rankings,
  maxAmount,
  limit = 50,
}: RankingFullListProps) {
  const displayRankings = rankings.slice(0, limit);

  const getPercentage = (amount: number) => {
    return maxAmount > 0 ? (amount / maxAmount) * 100 : 0;
  };

  const getRankStyle = (rank: number) => {
    if (rank === 1) return styles.gold;
    // 2,3위는 동일한 elite 스타일
    if (rank === 2 || rank === 3) return styles.elite;
    if (rank <= 10) return styles.top10;
    return "";
  };

  return (
    <div className={styles.container}>
      {displayRankings.map((item, index) => {
        const percentage = getPercentage(item.totalAmount);

        const Content = (
          <motion.div
            className={`${styles.item} ${getRankStyle(item.rank)}`}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: index * 0.02 }}
          >
            {/* Rank Number */}
            <div className={styles.rankSection}>
              <span className={styles.rank}>{item.rank}</span>
            </div>

            {/* Avatar - 화려한 이니셜 표시 */}
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
                <span className={styles.initials}>
                  {getInitials(item.donorName, { koreanMax: 1 })}
                </span>
              )}
            </div>

            {/* User Info & Stats */}
            <div className={styles.infoSection}>
              <div className={styles.nameRow}>
                <span className={styles.name}>{item.donorName}</span>
                <div className={styles.statsRow}>
                  {item.donationCount !== undefined && (
                    <span className={styles.stat}>
                      <Heart size={12} />
                      {item.donationCount}회
                    </span>
                  )}
                  {item.messageCount !== undefined && item.messageCount > 0 && (
                    <span className={styles.stat}>
                      <MessageCircle size={12} />
                      {item.messageCount}
                    </span>
                  )}
                </div>
              </div>

              {/* Gauge Bar */}
              <div className={styles.gaugeContainer}>
                <motion.div
                  className={styles.gaugeFill}
                  initial={{ width: 0 }}
                  animate={{ width: `${percentage}%` }}
                  transition={{ duration: 0.8, delay: index * 0.02 + 0.2 }}
                />
                {item.rank <= 3 && (
                  <motion.div
                    className={styles.gaugeGlow}
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.8, delay: index * 0.02 + 0.2 }}
                  />
                )}
              </div>
            </div>

            {/* Amount */}
            <div className={styles.amountSection}>
              <span className={styles.amount}>{formatAmountShort(item.totalAmount)}</span>
              <span className={styles.unit}>하트</span>
            </div>
          </motion.div>
        );

        // Top 3 (1,2,3위)만 개인 페이지 링크 제공
        const isTop3 = item.rank >= 1 && item.rank <= 3;

        if (isTop3 && item.donorId) {
          return (
            <Link
              key={item.donorId}
              href={getTributePageUrl(item.donorId)}
              className={styles.link}
            >
              {Content}
            </Link>
          );
        }

        // 4위 이하는 링크 없이 표시
        return (
          <div key={`${item.donorName}-${index}`} className={styles.noLink}>
            {Content}
          </div>
        );
      })}
    </div>
  );
}
