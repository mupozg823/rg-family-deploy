"use client";

import { motion } from "framer-motion";
import { User } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { RankingItem } from "@/types/common";
import { hasHonorPageQualification } from "@/lib/mock";
import { USE_MOCK_DATA } from "@/lib/config";
import styles from "./RankingList.module.css";

// Local helper function
const formatCompactNumber = (amount: number): string => {
  if (amount >= 100000000) {
    return `${(amount / 100000000).toFixed(1)}억`;
  }
  if (amount >= 10000) {
    return `${Math.floor(amount / 10000).toLocaleString()}만`;
  }
  return amount.toLocaleString();
};

interface RankingListProps {
  rankings: RankingItem[];
  maxAmount?: number; // Kept for compatibility but unused
  startRank?: number;
}

const listVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3 },
  },
};

export default function RankingList({
  rankings,
  startRank = 1,
}: RankingListProps) {
  const getRankClass = (rank: number) => {
    if (rank === 1) return styles.rank1;
    if (rank === 2) return styles.rank2;
    if (rank === 3) return styles.rank3;
    return "";
  };

  return (
    <div className={styles.list}>
      {/* Header Row */}
      <div className={styles.header}>
        <span className={styles.headerTitle}>RANK</span>
        <span className={`${styles.headerTitle} ${styles.left}`}>USER</span>
        <span className={`${styles.headerTitle} ${styles.right}`}>SCORE</span>
        <span className={styles.headerTitle}>BADGE</span>
      </div>

      <motion.div
        variants={listVariants}
        initial="hidden"
        animate="visible"
        className={styles.listContainer}
      >
        {rankings.map((item, index) => {
          const actualRank = startRank + index;

          const ItemContent = (
            <motion.div
              className={`${styles.item} ${getRankClass(actualRank)}`}
              variants={itemVariants}
            >
              {/* Rank Column */}
              <div className={styles.rank}>{actualRank}</div>

              {/* User Column */}
              <div className={styles.userSection}>
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
                    <User size={18} className="text-gray-400 m-auto" />
                  )}
                </div>
                <span className={styles.name}>{item.donorName}</span>
              </div>

              {/* Score Column */}
              <div className={styles.score}>
                {formatCompactNumber(item.totalAmount)}
              </div>

              {/* Badge Column */}
              <div className={styles.badge}>
                {/* Visual placeholder for badge, can be replaced with real badge logic */}
                <div className={styles.badgeIcon}>
                  {/* Simple circle or icon */}
                  <div
                    style={{
                      width: 12,
                      height: 12,
                      borderRadius: "50%",
                      background: "currentColor",
                    }}
                  />
                </div>
              </div>
            </motion.div>
          );

          // 시즌 TOP 3 또는 회차별 고액 후원자만 개인 헌정 페이지로 이동 가능
          const hasHonorPage = actualRank <= 3 ||
            (USE_MOCK_DATA && item.donorId && hasHonorPageQualification(item.donorId));

          if (item.donorId && hasHonorPage) {
            return (
              <Link
                key={item.donorId || index}
                href={`/ranking/${item.donorId}`}
                className={styles.link}
              >
                {ItemContent}
              </Link>
            );
          }

          return <div key={item.donorId || index}>{ItemContent}</div>;
        })}
      </motion.div>
    </div>
  );
}
