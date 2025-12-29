'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { motion, useScroll, useTransform } from 'framer-motion'
import { Calendar, ChevronDown, Filter } from 'lucide-react'
import Image from 'next/image'
import { useSupabase } from '@/lib/hooks/useSupabase'
import type { TimelineItem } from '@/types/common'
import type { Season } from '@/types/database'
import styles from './Timeline.module.css'

export default function Timeline() {
  const supabase = useSupabase()
  const [events, setEvents] = useState<TimelineItem[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const containerRef = useRef<HTMLDivElement>(null)

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start'],
  })

  const lineHeight = useTransform(scrollYProgress, [0, 1], ['0%', '100%'])

  const fetchData = useCallback(async () => {
    setIsLoading(true)

    // 시즌 목록 가져오기
    const { data: seasonsData } = await supabase
      .from('seasons')
      .select('*')
      .order('start_date', { ascending: false })

    if (seasonsData) {
      setSeasons(seasonsData)
    }

    // 타임라인 이벤트 가져오기
    let query = supabase
      .from('timeline_events')
      .select('*, seasons(name)')
      .order('event_date', { ascending: false })

    if (selectedSeasonId) {
      query = query.eq('season_id', selectedSeasonId)
    }

    const { data: eventsData, error } = await query

    if (error) {
      console.error('타임라인 로드 실패:', error)
      setIsLoading(false)
      return
    }

    const formattedEvents: TimelineItem[] = (eventsData || []).map((event) => ({
      id: event.id,
      eventDate: event.event_date,
      title: event.title,
      description: event.description,
      imageUrl: event.image_url,
      category: event.category,
      seasonId: event.season_id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      seasonName: (event.seasons as any)?.name,
    }))

    setEvents(formattedEvents)
    setIsLoading(false)
  }, [supabase, selectedSeasonId])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  const getCategoryColor = (category: string | null) => {
    const colors: Record<string, string> = {
      founding: '#4ade80',
      milestone: '#f472b6',
      event: '#60a5fa',
      member: '#fbbf24',
    }
    return colors[category || ''] || '#fd68ba'
  }

  return (
    <div className={styles.container} ref={containerRef}>
      {/* Filter */}
      <div className={styles.filterSection}>
        <div className={styles.filterLabel}>
          <Filter size={18} />
          <span>시즌 필터</span>
        </div>
        <div className={styles.seasonFilter}>
          <button
            onClick={() => setSelectedSeasonId(null)}
            className={`${styles.seasonButton} ${selectedSeasonId === null ? styles.active : ''}`}
          >
            전체
          </button>
          {seasons.map((season) => (
            <button
              key={season.id}
              onClick={() => setSelectedSeasonId(season.id)}
              className={`${styles.seasonButton} ${selectedSeasonId === season.id ? styles.active : ''}`}
            >
              {season.name}
            </button>
          ))}
        </div>
      </div>

      {/* Timeline */}
      {isLoading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>타임라인을 불러오는 중...</span>
        </div>
      ) : events.length === 0 ? (
        <div className={styles.empty}>
          <Calendar size={48} strokeWidth={1} />
          <p>등록된 타임라인이 없습니다</p>
        </div>
      ) : (
        <div className={styles.timeline}>
          {/* Progress Line */}
          <div className={styles.line}>
            <motion.div
              className={styles.lineProgress}
              style={{ height: lineHeight }}
            />
          </div>

          {/* Events */}
          {events.map((event, index) => (
            <motion.div
              key={event.id}
              className={`${styles.event} ${index % 2 === 0 ? styles.left : styles.right}`}
              initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
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
              <div className={styles.card}>
                {/* Date */}
                <div className={styles.date}>
                  <Calendar size={14} />
                  {formatDate(event.eventDate)}
                </div>

                {/* Season Badge */}
                {event.seasonName && (
                  <span className={styles.seasonBadge}>{event.seasonName}</span>
                )}

                {/* Category Badge */}
                {event.category && (
                  <span
                    className={styles.categoryBadge}
                    style={{
                      backgroundColor: `${getCategoryColor(event.category)}20`,
                      color: getCategoryColor(event.category),
                    }}
                  >
                    {event.category}
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
                    />
                  </div>
                )}

                {/* Title & Description */}
                <h3 className={styles.title}>{event.title}</h3>
                {event.description && (
                  <p className={styles.description}>{event.description}</p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
