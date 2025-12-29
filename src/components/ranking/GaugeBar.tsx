'use client'

import { motion } from 'framer-motion'
import styles from './GaugeBar.module.css'

interface GaugeBarProps {
  value: number
  maxValue: number
  rank: number
  showPercentage?: boolean
  size?: 'sm' | 'md' | 'lg'
  animated?: boolean
}

export default function GaugeBar({
  value,
  maxValue,
  rank,
  showPercentage = false,
  size = 'md',
  animated = true,
}: GaugeBarProps) {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0

  const getRankColor = () => {
    if (rank === 1) return 'linear-gradient(90deg, #ffd700, #ffed4a)'
    if (rank === 2) return 'linear-gradient(90deg, #c0c0c0, #e8e8e8)'
    if (rank === 3) return 'linear-gradient(90deg, #cd7f32, #dda15e)'
    return 'linear-gradient(90deg, var(--color-primary), var(--color-primary-light))'
  }

  const formatAmount = (amount: number) => {
    if (amount >= 100000000) {
      return `${(amount / 100000000).toFixed(1)}억`
    }
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(0)}만`
    }
    return amount.toLocaleString()
  }

  return (
    <div className={`${styles.container} ${styles[size]}`}>
      <div className={styles.barBackground}>
        <motion.div
          className={styles.barFill}
          style={{ background: getRankColor() }}
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
        />

        {/* Glow effect for top 3 */}
        {rank <= 3 && (
          <motion.div
            className={styles.glow}
            style={{ background: getRankColor() }}
            initial={animated ? { width: 0 } : { width: `${percentage}%` }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
          />
        )}
      </div>

      <div className={styles.info}>
        <span className={styles.amount}>{formatAmount(value)}</span>
        {showPercentage && (
          <span className={styles.percentage}>{percentage.toFixed(1)}%</span>
        )}
      </div>
    </div>
  )
}
