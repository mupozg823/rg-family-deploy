'use client'

import { motion } from 'framer-motion'
import type { CalendarDay } from '@/types/common'
import styles from './Calendar.module.css'

interface CalendarGridProps {
  days: CalendarDay[]
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
}

const EVENT_COLORS: Record<string, string> = {
  broadcast: '#4ade80', // green
  collab: '#60a5fa', // blue
  event: '#f472b6', // pink
  notice: '#fbbf24', // yellow
  '休': '#94a3b8', // gray
}

export default function CalendarGrid({ days, selectedDate, onSelectDate }: CalendarGridProps) {
  const isSameDay = (date1: Date, date2: Date | null) => {
    if (!date2) return false
    return (
      date1.getDate() === date2.getDate() &&
      date1.getMonth() === date2.getMonth() &&
      date1.getFullYear() === date2.getFullYear()
    )
  }

  const getEventColor = (event: { color?: string | null; eventType?: string }) => {
    return event.color || EVENT_COLORS[event.eventType || ''] || '#fd68ba'
  }

  return (
    <div className={styles.grid}>
      {days.map((day, index) => {
        const isSelected = isSameDay(day.date, selectedDate)
        const dayOfWeek = day.date.getDay()
        const isSunday = dayOfWeek === 0
        const isSaturday = dayOfWeek === 6

        return (
          <motion.button
            key={index}
            onClick={() => onSelectDate(day.date)}
            className={`${styles.dayCell} ${!day.isCurrentMonth ? styles.otherMonth : ''} ${day.isToday ? styles.today : ''} ${isSelected ? styles.selected : ''}`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <span
              className={`${styles.dayNumber} ${isSunday ? styles.sunday : ''} ${isSaturday ? styles.saturday : ''}`}
            >
              {day.date.getDate()}
            </span>

            {/* Event Text List (Desktop) */}
            {day.events.length > 0 && (
              <div className={styles.eventsList}>
                {day.events.slice(0, 3).map((event, eventIndex) => (
                  <div
                    key={eventIndex}
                    className={styles.eventItem}
                    style={{
                      backgroundColor: getEventColor(event),
                    }}
                  >
                    {event.title}
                  </div>
                ))}
                {day.events.length > 3 && (
                  <span className={styles.moreEvents}>+{day.events.length - 3}개</span>
                )}
              </div>
            )}

            {/* Event Dots (Mobile) */}
            {day.events.length > 0 && (
              <div className={styles.eventDots}>
                {day.events.slice(0, 4).map((event, eventIndex) => (
                  <span
                    key={eventIndex}
                    className={styles.eventDot}
                    style={{
                      backgroundColor: getEventColor(event),
                    }}
                  />
                ))}
                {day.events.length > 4 && (
                  <span className={styles.moreEvents}>+{day.events.length - 4}</span>
                )}
              </div>
            )}

            {/* Event Preview on Hover */}
            {day.events.length > 0 && (
              <div className={styles.eventPreview}>
                {day.events.slice(0, 3).map((event, eventIndex) => (
                  <div
                    key={eventIndex}
                    className={styles.previewItem}
                    style={{
                      borderLeftColor: getEventColor(event),
                    }}
                  >
                    <span className={styles.previewTitle}>{event.title}</span>
                  </div>
                ))}
                {day.events.length > 3 && (
                  <span className={styles.previewMore}>외 {day.events.length - 3}개</span>
                )}
              </div>
            )}
          </motion.button>
        )
      })}
    </div>
  )
}
