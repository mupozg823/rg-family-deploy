'use client'

import { motion } from 'framer-motion'
import { User, ChevronRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { RankingItem } from '@/types/common'
import GaugeBar from './GaugeBar'
import styles from './RankingList.module.css'

interface RankingListProps {
  rankings: RankingItem[]
  maxAmount: number
  startRank?: number
}

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.03,
      delayChildren: 0.1,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, x: -20 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.2 },
  },
}

export default function RankingList({ rankings, maxAmount, startRank = 1 }: RankingListProps) {
  // 하트 단위로 표시 (팬더티비 후원 형식)
  const formatAmount = (amount: number) => {
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(1)}만`
    }
    return amount.toLocaleString()
  }

  return (
    <motion.div
      className={styles.list}
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {rankings.map((item, index) => {
        const actualRank = startRank + index

        const ItemContent = (
          <motion.div
            className={styles.item}
            variants={itemVariants}
            whileHover={{ x: 4 }}
          >
            {/* Rank */}
            <div className={styles.rank}>
              <span>{actualRank}</span>
            </div>

            {/* Avatar */}
            <div className={styles.avatar}>
              {item.avatarUrl ? (
                <Image
                  src={item.avatarUrl}
                  alt={item.donorName}
                  fill
                  className={styles.avatarImage}
                />
              ) : (
                <User size={20} />
              )}
            </div>

            {/* Info */}
            <div className={styles.info}>
              <span className={styles.name}>{item.donorName}</span>
              <div className={styles.gaugeWrapper}>
                <GaugeBar
                  value={item.totalAmount}
                  maxValue={maxAmount}
                  rank={actualRank}
                  size="sm"
                  animated={false}
                />
              </div>
            </div>

            {/* Amount */}
            <div className={styles.amount}>
              <span>{formatAmount(item.totalAmount)}</span>
            </div>

            {/* Arrow */}
            {item.donorId && (
              <ChevronRight size={20} className={styles.arrow} />
            )}
          </motion.div>
        )

        if (item.donorId) {
          return (
            <Link
              key={item.donorId || index}
              href={`/ranking/vip/${item.donorId}`}
              className={styles.link}
            >
              {ItemContent}
            </Link>
          )
        }

        return <div key={item.donorId || index}>{ItemContent}</div>
      })}
    </motion.div>
  )
}
