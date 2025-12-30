'use client'

import { motion } from 'framer-motion'
import { Crown, Medal, Award, Calendar, Heart } from 'lucide-react'
import Image from 'next/image'
import type { TributeProfile, TributeTheme, TributeRank } from '@/types/common'
import TributeBadge from './TributeBadge'
import styles from './TributeHero.module.css'

interface TributeHeroProps {
  profile: TributeProfile
  theme: TributeTheme
  rank: TributeRank
  seasonName: string
}

export default function TributeHero({ profile, theme, rank, seasonName }: TributeHeroProps) {
  const getRankIcon = () => {
    if (rank === 1) return <Crown size={32} />
    if (rank === 2) return <Medal size={32} />
    if (rank === 3) return <Award size={32} />
    return null
  }

  const getRankLabel = () => {
    if (rank === 1) return 'Champion'
    if (rank === 2) return 'Elite'
    if (rank === 3) return 'Premium'
    return ''
  }

  const formatAmount = (amount: number) => {
    if (amount >= 100000000) {
      return `${(amount / 100000000).toFixed(1)}억 하트`
    }
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(0)}만 하트`
    }
    return `${amount.toLocaleString()} 하트`
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ko-KR', { year: 'numeric', month: 'long' })
  }

  return (
    <section className={`${styles.hero} ${styles[theme]}`}>
      {/* Background Decorations */}
      <div className={styles.bgDecoration}>
        <div className={styles.gradientOrb1} />
        <div className={styles.gradientOrb2} />
        <div className={styles.particles}>
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className={styles.particle}
              animate={{
                y: [-20, 20, -20],
                x: [-10, 10, -10],
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 4 + i * 0.5,
                repeat: Infinity,
                delay: i * 0.2,
              }}
            />
          ))}
        </div>
      </div>

      <div className={styles.container}>
        {/* Rank Badge */}
        <motion.div
          className={styles.rankSection}
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className={styles.rankIcon}>{getRankIcon()}</div>
          <span className={styles.rankLabel}>{getRankLabel()}</span>
          <span className={styles.rankNumber}>#{rank}</span>
        </motion.div>

        {/* Profile Avatar */}
        <motion.div
          className={styles.avatarWrapper}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className={styles.avatarGlow} />
          <div className={styles.avatar}>
            {profile.avatarUrl ? (
              <Image
                src={profile.avatarUrl}
                alt={profile.nickname}
                fill
                className={styles.avatarImage}
                unoptimized
              />
            ) : (
              <span className={styles.avatarPlaceholder}>
                {profile.nickname.charAt(0)}
              </span>
            )}
          </div>
          <div className={styles.avatarRing} />
        </motion.div>

        {/* Profile Info */}
        <motion.div
          className={styles.profileInfo}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <h1 className={styles.nickname}>{profile.nickname}</h1>

          <div className={styles.statsRow}>
            <div className={styles.stat}>
              <Heart className={styles.statIcon} size={18} />
              <span className={styles.statValue}>{formatAmount(profile.totalDonation)}</span>
            </div>
            <div className={styles.statDivider} />
            <div className={styles.stat}>
              <Calendar className={styles.statIcon} size={18} />
              <span className={styles.statValue}>{formatDate(profile.joinedAt)} 가입</span>
            </div>
          </div>

          <div className={styles.seasonBadge}>
            <TributeBadge theme={theme} label={seasonName} size="lg" />
          </div>
        </motion.div>
      </div>
    </section>
  )
}
