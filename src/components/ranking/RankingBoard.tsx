"use client";

import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { Trophy, Crown } from "lucide-react";
import { useSupabaseContext } from "@/lib/context";
import styles from "./RankingBoard.module.css";

interface RankingItem {
  rank: number;
  name: string;
  amount: number;
  unit: "excel" | "crew" | null;
}

export default function RankingBoard() {
  const supabase = useSupabaseContext();
  const [activeTab, setActiveTab] = useState<"season" | "total">("season");
  const [rankingData, setRankingData] = useState<RankingItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRankings = useCallback(async () => {
    setIsLoading(true);

    if (activeTab === "total") {
      // 전체 랭킹: profiles에서 total_donation 기준
      const { data, error } = await supabase
        .from("profiles")
        .select("id, nickname, total_donation, unit")
        .gt("total_donation", 0)
        .order("total_donation", { ascending: false })
        .limit(5);

      if (!error && data) {
        setRankingData(
          data.map((p, idx) => ({
            rank: idx + 1,
            name: p.nickname || "익명",
            amount: p.total_donation || 0,
            unit: p.unit,
          }))
        );
      }
    } else {
      // 시즌 랭킹: 현재 활성 시즌의 donations 집계
      const { data: season } = await supabase
        .from("seasons")
        .select("id")
        .eq("is_active", true)
        .single();

      if (season) {
        const { data, error } = await supabase
          .from("donations")
          .select("donor_id, amount, profiles!donor_id(nickname, unit)")
          .eq("season_id", season.id);

        if (!error && data) {
          // 도너별 합계 계산
          const donorTotals: Record<string, { name: string; amount: number; unit: "excel" | "crew" | null }> = {};
          data.forEach((d) => {
            const profile = d.profiles as unknown as { nickname: string; unit: "excel" | "crew" | null } | null;
            if (!donorTotals[d.donor_id]) {
              donorTotals[d.donor_id] = {
                name: profile?.nickname || "익명",
                amount: 0,
                unit: profile?.unit || null,
              };
            }
            donorTotals[d.donor_id].amount += d.amount;
          });

          const sorted = Object.values(donorTotals)
            .sort((a, b) => b.amount - a.amount)
            .slice(0, 5)
            .map((item, idx) => ({ ...item, rank: idx + 1 }));

          setRankingData(sorted);
        }
      } else {
        setRankingData([]);
      }
    }

    setIsLoading(false);
  }, [supabase, activeTab]);

  useEffect(() => {
    fetchRankings();
  }, [fetchRankings]);

  // Calculate max amount for progress bars
  const maxAmount = rankingData[0]?.amount || 1;

  return (
    <section className={styles.container}>
      <div className={styles.header}>
        <div className={styles.title}>
          <Trophy size={18} className={styles.titleIcon} />
          <span>RANKING</span>
        </div>

        {/* Tabs */}
        <div className={styles.tabs}>
          <button
            className={`${styles.tab} ${
              activeTab === "season" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("season")}
          >
            SEASON
          </button>
          <button
            className={`${styles.tab} ${
              activeTab === "total" ? styles.active : ""
            }`}
            onClick={() => setActiveTab("total")}
          >
            TOTAL
          </button>
        </div>
      </div>

      <div className={styles.list}>
        {isLoading ? (
          <div className={styles.loading}>로딩 중...</div>
        ) : rankingData.length === 0 ? (
          <div className={styles.empty}>랭킹 데이터가 없습니다</div>
        ) : rankingData.map((item, index) => (
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
              <span className={styles.nickname}>
                {item.rank === 1 && (
                  <Crown size={14} className={styles.crown} />
                )}
                {item.name}
              </span>
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

// CSS for loading/empty states (add to module if needed)
