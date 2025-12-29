'use client'

import { motion } from 'framer-motion'
import { X, Clock, MapPin, Radio, Users, Megaphone, Calendar } from 'lucide-react'
import type { ScheduleEvent } from '@/types/common'
import styles from './Calendar.module.css'

interface EventListProps {
  date: Date
  events: ScheduleEvent[]
  onClose: () => void
}

const EVENT_ICONS = {
  broadcast: Radio,
  collab: Users,
  event: Calendar,
  notice: Megaphone,
  '休': Calendar,
}

const EVENT_LABELS = {
  broadcast: '방송',
  collab: '콜라보',
  event: '이벤트',
  notice: '공지',
  '休': '휴방',
}

const EVENT_COLORS: Record<string, string> = {
  broadcast: '#4ade80',
  collab: '#60a5fa',
  event: '#f472b6',
  notice: '#fbbf24',
  '休': '#94a3b8',
}

export default function EventList({ date, events, onClose }: EventListProps) {
  const formattedDate = date.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    weekday: 'long',
  })

  const formatTime = (datetime: string) => {
    return new Date(datetime).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  return (
    <div className={styles.eventList}>
      <div className={styles.eventListHeader}>
        <h3 className={styles.eventListTitle}>{formattedDate}</h3>
        <button onClick={onClose} className={styles.closeButton}>
          <X size={20} />
        </button>
      </div>

      {events.length === 0 ? (
        <div className={styles.noEvents}>
          <Calendar size={48} strokeWidth={1} />
          <p>등록된 일정이 없습니다</p>
        </div>
      ) : (
        <div className={styles.eventItems}>
          {events.map((event, index) => {
            const Icon = EVENT_ICONS[event.eventType]
            const color = event.color || EVENT_COLORS[event.eventType] || '#fd68ba'

            return (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className={styles.eventItemCard}
                style={{ borderLeftColor: color }}
              >
                <div className={styles.eventIcon} style={{ backgroundColor: color }}>
                  <Icon size={16} />
                </div>

                <div className={styles.eventContent}>
                  <div className={styles.eventMeta}>
                    <span
                      className={styles.eventType}
                      style={{ backgroundColor: `${color}20`, color }}
                    >
                      {EVENT_LABELS[event.eventType]}
                    </span>
                    {event.unit && (
                      <span
                        className={styles.eventUnit}
                        data-unit={event.unit}
                      >
                        {event.unit === 'excel' ? '엑셀부' : '크루부'}
                      </span>
                    )}
                  </div>

                  <h4 className={styles.eventTitle}>{event.title}</h4>

                  {event.description && (
                    <p className={styles.eventDescription}>{event.description}</p>
                  )}

                  <div className={styles.eventDetails}>
                    {!event.isAllDay && (
                      <span className={styles.eventTime}>
                        <Clock size={14} />
                        {formatTime(event.startDatetime)}
                        {event.endDatetime && ` - ${formatTime(event.endDatetime)}`}
                      </span>
                    )}
                    {event.isAllDay && (
                      <span className={styles.eventTime}>
                        <Clock size={14} />
                        하루 종일
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      )}
    </div>
  )
}
