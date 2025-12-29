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

export default function RankingList({ rankings, maxAmount, startRank = 1 }: RankingListProps) {
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
    <div className={styles.list}>
      {rankings.map((item, index) => {
        const actualRank = startRank + index

        const ItemContent = (
          <motion.div
            className={styles.item}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
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
    </div>
  )
}
