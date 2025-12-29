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
  showPercentage = true,
  size = 'md',
  animated = true,
}: GaugeBarProps) {
  const percentage = maxValue > 0 ? (value / maxValue) * 100 : 0

  const getRankColor = () => {
    if (rank === 1) return 'linear-gradient(90deg, #ffd700 0%, #ffed4a 50%, #ffd700 100%)'
    if (rank === 2) return 'linear-gradient(90deg, #c0c0c0 0%, #e8e8e8 50%, #c0c0c0 100%)'
    if (rank === 3) return 'linear-gradient(90deg, #cd7f32 0%, #dda15e 50%, #cd7f32 100%)'
    return 'linear-gradient(90deg, var(--color-primary) 0%, #ff6eb3 50%, var(--color-primary) 100%)'
  }

  const getRankClass = () => {
    if (rank === 1) return styles.gold
    if (rank === 2) return styles.silver
    if (rank === 3) return styles.bronze
    return ''
  }

  const formatAmount = (amount: number) => {
    if (amount >= 100000000) {
      return `${(amount / 100000000).toFixed(1)}억 하트`
    }
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(1)}만 하트`
    }
    return `${amount.toLocaleString()} 하트`
  }

  return (
    <div className={`${styles.container} ${styles[size]} ${getRankClass()}`}>
      <div className={styles.barBackground}>
        <motion.div
          className={styles.barFill}
          style={{ background: getRankColor() }}
          initial={animated ? { width: 0 } : { width: `${percentage}%` }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
        />

        {/* Glow effect for top 3 */}
        {rank <= 3 && (
          <motion.div
            className={styles.glow}
            style={{ background: getRankColor() }}
            initial={animated ? { width: 0 } : { width: `${percentage}%` }}
            animate={{ width: `${percentage}%` }}
            transition={{ duration: 1, ease: 'easeOut', delay: 0.2 }}
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
  )
}
