'use client'

import { motion } from 'framer-motion'
import { Crown, Medal, Award, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import type { RankingItem } from '@/types/common'
import GaugeBar from './GaugeBar'
import styles from './RankingCard.module.css'

interface RankingCardProps {
  item: RankingItem
  maxAmount: number
  index: number
}

export default function RankingCard({ item, maxAmount, index }: RankingCardProps) {
  const getRankIcon = () => {
    if (item.rank === 1) return <Crown size={24} />
    if (item.rank === 2) return <Medal size={24} />
    if (item.rank === 3) return <Award size={24} />
    return null
  }

  const getRankClass = () => {
    if (item.rank === 1) return styles.gold
    if (item.rank === 2) return styles.silver
    if (item.rank === 3) return styles.bronze
    return ''
  }

  // 하트 단위로 표시 (팬더티비 후원 형식)
  const formatAmount = (amount: number) => {
    if (amount >= 100000) {
      return `${(amount / 10000).toFixed(1)}만 하트`
    }
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(1)}만 하트`
    }
    return `${amount.toLocaleString()} 하트`
  }

  const CardContent = (
    <motion.div
      className={`${styles.card} ${getRankClass()}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8 }}
    >
      {/* Rank Badge */}
      <div className={styles.rankBadge}>
        {getRankIcon()}
        <span>{item.rank}</span>
      </div>

      {/* Avatar */}
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
          <User size={32} />
        )}
      </div>

      {/* Info */}
      <div className={styles.info}>
        <h3 className={styles.name}>{item.donorName}</h3>
        <span className={styles.amount}>{formatAmount(item.totalAmount)}</span>
      </div>

      {/* Gauge Bar */}
      <div className={styles.gaugeWrapper}>
        <GaugeBar
          value={item.totalAmount}
          maxValue={maxAmount}
          rank={item.rank}
          size="lg"
        />
      </div>

      {/* Decorations */}
      {item.rank <= 3 && (
        <div className={styles.decoration}>
          <div className={styles.glow} />
          <div className={styles.particles}>
            {[...Array(6)].map((_, i) => (
              <motion.div
                key={i}
                className={styles.particle}
                animate={{
                  y: [-10, 10],
                  opacity: [0.3, 0.8, 0.3],
                }}
                transition={{
                  duration: 2,
                  repeat: Infinity,
                  delay: i * 0.3,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  )

  // VIP 헌정 페이지 링크 (Top 3만)
  if (item.rank <= 3 && item.donorId) {
    return (
      <Link href={`/ranking/vip/${item.donorId}`} className={styles.link} title="헌정 페이지 보기">
        {CardContent}
      </Link>
    )
  }

  return CardContent
}
