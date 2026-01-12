"use client";

import { motion } from "framer-motion";
import { formatAmount } from "@/lib/utils";
import styles from "./GaugeBar.module.css";

interface GaugeBarProps {
  value: number;
  maxValue: number;
  rank: number;
  showPercentage?: boolean;
  size?: "sm" | "md" | "lg";
  animated?: boolean;
}

export default function GaugeBar({
  value,
  maxValue,
  rank,
  showPercentage = true,
  size = "md",
  animated = true,
}: GaugeBarProps) {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0;

  const getRankColor = () => {
    if (rank === 1) return "var(--metallic-gold-gradient)";
    if (rank === 2) return "var(--metallic-silver-gradient)";
    if (rank === 3) return "var(--metallic-bronze-gradient)";
    return "var(--progress-gradient)";
  };

  const getRankClass = () => {
    if (rank === 1) return styles.gold;
    if (rank === 2) return styles.silver;
    if (rank === 3) return styles.bronze;
    return "";
  };

  return (
    <div className={`${styles.container} ${styles[size]} ${getRankClass()}`}>
      <div className={styles.barBackground}>
        <motion.div
          className={styles.barFill}
          style={{ background: getRankColor() }}
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
        />

        {/* Glow effect for top 3 */}
        {rank <= 3 && (
          <motion.div
            className={styles.glow}
            style={{ background: getRankColor() }}
            initial={animated ? { width: 0 } : { width: `${percentage}%` }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
          />
        )}
      </div>

      <div className={styles.info}>
        <span className={styles.amount}>{formatAmount(value)}</span>
        {showPercentage && (
          <span className={styles.percentage}>{percentage.toFixed(0)}%</span>
        )}
      </div>
    </div>
  );
}
