'use client'

import { motion } from 'framer-motion'
import { History, Heart, MessageCircle } from 'lucide-react'
import type { TributeDonation, TributeTheme } from '@/types/common'
import styles from './TributeDonationTimeline.module.css'

interface TributeDonationTimelineProps {
  donations: TributeDonation[]
  theme: TributeTheme
}

export default function TributeDonationTimeline({
  donations,
  theme,
}: TributeDonationTimelineProps) {
  const formatAmount = (amount: number) => {
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(0)}만`
    }
    return amount.toLocaleString()
  }

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const totalAmount = donations.reduce((sum, d) => sum + d.amount, 0)

  return (
    <section className={`${styles.section} ${styles[theme]}`}>
      <div className={styles.container}>
        {/* Header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className={styles.iconWrapper}>
            <History size={24} />
          </div>
          <h2 className={styles.title}>Donation History</h2>
          <p className={styles.subtitle}>
            Total: <span className={styles.totalAmount}>{formatAmount(totalAmount)} 하트</span>
          </p>
        </motion.div>

        {/* Timeline */}
        <div className={styles.timeline}>
          {donations.map((donation, index) => (
            <motion.div
              key={donation.id}
              className={styles.timelineItem}
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
            >
              <div className={styles.timelineLine}>
                <div className={styles.timelineDot} />
              </div>

              <div className={styles.timelineContent}>
                <div className={styles.timelineHeader}>
                  <div className={styles.amount}>
                    <Heart size={16} className={styles.heartIcon} />
                    <span>{formatAmount(donation.amount)} 하트</span>
                  </div>
                  <span className={styles.date}>{formatDate(donation.createdAt)}</span>
                </div>

                {donation.message && (
                  <div className={styles.message}>
                    <MessageCircle size={14} className={styles.messageIcon} />
                    <p>{donation.message}</p>
                  </div>
                )}

                <span className={styles.season}>{donation.seasonName}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  )
}
