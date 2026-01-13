'use client'

import { motion } from 'framer-motion'
import { Trophy } from 'lucide-react'
import type { HallOfFameHonor } from '@/lib/mock'
import { formatAmount } from '@/lib/utils/format'
import styles from '../TributeSections.module.css'

interface TributeHistorySectionProps {
  honors: HallOfFameHonor[]
}

export default function TributeHistorySection({ honors }: TributeHistorySectionProps) {
  return (
    <motion.section
      className={styles.section}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className={styles.sectionHeader}>
        <Trophy size={20} />
        <h2>명예의 전당 기록</h2>
      </div>
      <div className={styles.historyList}>
        {honors.map((honor) => (
          <div key={honor.id} className={styles.historyItem}>
            <span className={styles.historyDate}>
              {honor.honorType === 'season_top3'
                ? `${honor.seasonName} TOP ${honor.rank}`
                : honor.episodeName}
            </span>
            <span className={styles.historyAmount}>{formatAmount(honor.amount)}</span>
          </div>
        ))}
      </div>
    </motion.section>
  )
}
