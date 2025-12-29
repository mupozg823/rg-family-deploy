'use client'

import { motion } from 'framer-motion'
import { LucideIcon } from 'lucide-react'
import styles from './StatsCard.module.css'

interface StatsCardProps {
  title: string
  value: string | number
  change?: number
  icon: LucideIcon
  color?: 'primary' | 'success' | 'warning' | 'info'
  delay?: number
}

export default function StatsCard({
  title,
  value,
  change,
  icon: Icon,
  color = 'primary',
  delay = 0,
}: StatsCardProps) {
  return (
    <motion.div
      className={`${styles.card} ${styles[color]}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay }}
    >
      <div className={styles.iconWrapper}>
        <Icon size={24} />
      </div>
      <div className={styles.content}>
        <span className={styles.title}>{title}</span>
        <span className={styles.value}>{value}</span>
        {change !== undefined && (
          <span className={`${styles.change} ${change >= 0 ? styles.positive : styles.negative}`}>
            {change >= 0 ? '+' : ''}{change}%
          </span>
        )}
      </div>
    </motion.div>
  )
}
