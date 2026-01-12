'use client'

import { useState, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Calendar, Sparkles, ChevronRight } from 'lucide-react'
import { useTimelineData, getSeasonColor } from '@/lib/hooks/useTimelineData'
import { formatDate } from '@/lib/utils/format'
import TimelineFilter from './TimelineFilter'
import TimelineEventCard from './TimelineEventCard'
import TimelineModal from './TimelineModal'
import type { TimelineItem } from '@/types/common'
import styles from './Timeline.module.css'

export default function Timeline() {
  const containerRef = useRef<HTMLDivElement>(null)
  const [selectedEvent, setSelectedEvent] = useState<TimelineItem | null>(null)

  const {
    seasons,
    categories,
    selectedSeasonId,
    selectedCategory,
    groupedBySeason,
    isLoading,
    setSelectedSeasonId,
    setSelectedCategory,
  } = useTimelineData()

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  const totalEvents = groupedBySeason.reduce((sum, g) => sum + g.events.length, 0)

  return (
    <div className={styles.container} ref={containerRef}>
      {/* Filters */}
      <TimelineFilter
        seasons={seasons}
        categories={categories}
        selectedSeasonId={selectedSeasonId}
        selectedCategory={selectedCategory}
        onSeasonChange={setSelectedSeasonId}
        onCategoryChange={setSelectedCategory}
      />

      {/* Timeline */}
      {isLoading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>타임라인을 불러오는 중...</span>
        </div>
      ) : totalEvents === 0 ? (
        <div className={styles.empty}>
          <Calendar size={48} strokeWidth={1} />
          <p>등록된 타임라인이 없습니다</p>
        </div>
      ) : (
        <div className={styles.timeline}>
          {/* Progress Line */}
          <div className={styles.line}>
            <motion.div className={styles.lineProgress} style={{ height: lineHeight }} />
          </div>

          {/* Grouped Events by Season */}
          {groupedBySeason.map((group, groupIndex) => {
            const seasonColor = getSeasonColor(groupIndex)
            let eventCounter = 0

            return (
              <div key={group.season?.id || 'no-season'} className={styles.seasonGroup}>
                {/* Season Header Card */}
                {group.season && (
                  <motion.div
                    className={styles.seasonHeader}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    style={{ '--season-color': seasonColor } as React.CSSProperties}
                  >
                    <div className={styles.seasonIcon}>
                      <Sparkles size={24} />
                    </div>
                    <div className={styles.seasonInfo}>
                      <h2 className={styles.seasonName}>{group.season.name}</h2>
                      <p className={styles.seasonPeriod}>
                        {formatDate(group.season.start_date)}
                        {group.season.end_date && (
                          <>
                            <ChevronRight size={14} />
                            {formatDate(group.season.end_date)}
                          </>
                        )}
                      </p>
                    </div>
                    <div className={styles.seasonEventCount}>
                      <span className={styles.eventNumber}>{group.events.length}</span>
                      <span className={styles.eventLabel}>이벤트</span>
                    </div>
                  </motion.div>
                )}

                {/* Season Events */}
                {group.events.map((event) => {
                  const index = eventCounter++
                  return (
                    <TimelineEventCard
                      key={event.id}
                      event={event}
                      index={index}
                      onSelect={setSelectedEvent}
                    />
                  )
                })}
              </div>
            )
          })}
        </div>
      )}

      {/* Detail Modal */}
      <TimelineModal event={selectedEvent} onClose={() => setSelectedEvent(null)} />
    </div>
  )
}
