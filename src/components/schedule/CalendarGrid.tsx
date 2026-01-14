'use client'

import { motion } from 'framer-motion'
import type { CalendarDay } from '@/types/common'

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
  excel: '#fd68ba', // pink (Excel Unit)
  crew: '#00d4ff', // cyan (Crew Unit)
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
    <div className="grid grid-cols-7 gap-[1px] bg-[var(--color-pink)]">
        {days.map((day, index) => {
          const isSelected = isSameDay(day.date, selectedDate)
          const dayOfWeek = day.date.getDay()
          const isSunday = dayOfWeek === 0
          const isSaturday = dayOfWeek === 6

          return (
            <motion.button
              key={index}
              onClick={() => onSelectDate(day.date)}
              className={`
                min-h-[100px] md:min-h-[80px] sm:min-h-[60px] flex flex-col p-2
                bg-[var(--card-bg)] border-none cursor-pointer relative text-left
                transition-all duration-200
                hover:bg-[var(--interactive-hover)]
                ${!day.isCurrentMonth ? 'opacity-30' : ''}
                ${day.isToday ? 'bg-[var(--interactive-active)]' : ''}
                ${isSelected ? 'bg-[var(--interactive-focus)] shadow-[inset_0_0_0_2px_var(--color-pink)]' : ''}
              `}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span
                className={`
                  text-sm font-semibold mb-2 inline-flex items-center justify-center
                  min-w-[32px] min-h-[32px] rounded-full
                  ${isSunday ? 'text-red-500' : isSaturday ? 'text-blue-500' : 'text-[var(--text-secondary)]'}
                  ${day.isToday ? 'bg-[var(--color-primary)] text-white font-bold shadow-md' : ''}
                `}
              >
                {day.date.getDate()}
              </span>

              {/* Event Text List (Desktop) */}
              {day.events.length > 0 && (
                <div className="hidden md:flex flex-col gap-[2px] flex-1 overflow-hidden">
                  {day.events.slice(0, 3).map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className="px-2 py-1 rounded-md text-[11px] font-semibold text-white whitespace-nowrap overflow-hidden text-ellipsis transition-all hover:brightness-110 hover:translate-x-[2px] hover:shadow-md"
                      style={{
                        backgroundColor: getEventColor(event),
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {day.events.length > 3 && (
                    <span className="text-[10px] text-[var(--text-muted)] mt-1">
                      +{day.events.length - 3}개
                    </span>
                  )}
                </div>
              )}

              {/* Event Dots (Mobile) */}
              {day.events.length > 0 && (
                <div className="flex md:hidden gap-1 flex-wrap mt-1">
                  {day.events.slice(0, 4).map((event, eventIndex) => (
                    <span
                      key={eventIndex}
                      className="w-2 h-2 rounded-full animate-pulse"
                      style={{
                        backgroundColor: getEventColor(event),
                        boxShadow: `0 0 6px ${getEventColor(event)}`,
                      }}
                    />
                  ))}
                  {day.events.length > 4 && (
                    <span className="text-[10px] text-[var(--text-muted)]">
                      +{day.events.length - 4}
                    </span>
                  )}
                </div>
              )}
            </motion.button>
          )
        })}
    </div>
  )
}
