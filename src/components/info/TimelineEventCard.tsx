'use client'

import { motion } from 'framer-motion'
import { Calendar, ExternalLink } from 'lucide-react'
import Image from 'next/image'
import { CATEGORY_LABELS, getCategoryColor } from '@/lib/hooks/useTimelineData'
import { formatDate } from '@/lib/utils/format'
import type { TimelineItem } from '@/types/common'
import styles from './Timeline.module.css'

interface TimelineEventCardProps {
  event: TimelineItem
  index: number
  onSelect: (event: TimelineItem) => void
}

export default function TimelineEventCard({ event, index, onSelect }: TimelineEventCardProps) {
  const isLeft = index % 2 === 0

  return (
    <motion.div
      className={`${styles.event} ${isLeft ? styles.left : styles.right}`}
      initial={{ opacity: 0, x: isLeft ? -50 : 50 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true, margin: '-100px' }}
      transition={{ duration: 0.5, delay: 0.1 }}
    >
      {/* Dot */}
      <div
        className={styles.dot}
        style={{ backgroundColor: getCategoryColor(event.category) }}
      />

      {/* Content Card */}
      <div
        className={styles.card}
        onClick={() => onSelect(event)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && onSelect(event)}
      >
        {/* Date */}
        <div className={styles.date}>
          <Calendar size={14} />
          {formatDate(event.eventDate)}
        </div>

        {/* Category Badge */}
        {event.category && (
          <span
            className={styles.categoryBadge}
            style={{
              backgroundColor: `${getCategoryColor(event.category)}20`,
              color: getCategoryColor(event.category),
            }}
          >
            {CATEGORY_LABELS[event.category] || event.category}
          </span>
        )}

        {/* Image */}
        {event.imageUrl && (
          <div className={styles.imageWrapper}>
            <Image
              src={event.imageUrl}
              alt={event.title}
              fill
              className={styles.image}
              unoptimized
            />
          </div>
        )}

        {/* Title & Description */}
        <h3 className={styles.title}>{event.title}</h3>
        {event.description && <p className={styles.description}>{event.description}</p>}

        {/* View More Indicator */}
        <div className={styles.viewMore}>
          <ExternalLink size={14} />
          <span>자세히 보기</span>
        </div>
      </div>
    </motion.div>
  )
}
