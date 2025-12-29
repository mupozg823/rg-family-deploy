"use client";

import { motion } from "framer-motion";
import { Trophy } from "lucide-react";
import { getRankingData } from "@/lib/mock/data";
import styles from "./RankingBoard.module.css";

export default function RankingBoard() {
  const rankingData = getRankingData().slice(0, 5); // Top 5
  // Calculate max amount for progress bars
  const maxAmount = rankingData[0]?.amount || 1;

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          <Trophy size={20} className={styles.titleIcon} />
          <span>SEASON RANKING</span>
        </div>
        <span style={{ fontSize: "0.8rem", color: "#666" }}>Total Top 5</span>
      </div>

      <div className={styles.list}>
        {rankingData.map((item, index) => (
          <motion.div
            key={item.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className={styles.item}
          >
            {/* Progress Bar Background */}
            <div
              className={styles.progressBar}
              style={{ width: `${(item.amount / maxAmount) * 100}%` }}
            />

            <span
              className={`${styles.rank} ${styles[`rank${item.rank}`] || ""}`}
            >
              {item.rank}
            </span>

            <div className={styles.info}>
              <span className={styles.nickname}>{item.name}</span>
              <span className={styles.amount}>
                {item.amount.toLocaleString()} 🪙
              </span>
            </div>

            {item.unit && (
              <span
                className={`${styles.unitBadge} ${
                  item.unit === "excel" ? styles.unitExcel : styles.unitCrew
                }`}
              >
                {item.unit.toUpperCase()}
              </span>
            )}
          </motion.div>
        ))}
      </div>
    </section>
  );
}
