'use client'

import { motion } from 'framer-motion'
import type { CalendarDay } from '@/types/common'

interface CalendarGridProps {
  days: CalendarDay[]
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
}

const EVENT_COLORS: Record<string, string> = {
  broadcast: '#ff0050', // Brand pink
  collab: '#ff8ed4', // light pink (collaboration)
  event: '#d4af37', // gold
  notice: '#fd68ba', // signature pink
  '休': '#6b7280', // gray
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
                min-h-[120px] md:min-h-[100px] sm:min-h-[80px] flex flex-col p-3
                bg-[var(--card-bg)] border-none cursor-pointer relative text-left
                transition-all duration-200
                hover:bg-[var(--interactive-hover)]
                ${!day.isCurrentMonth ? 'opacity-30' : ''}
                ${day.isToday ? 'bg-[var(--interactive-active)]' : ''}
                ${isSelected ? 'bg-[var(--interactive-focus)] shadow-[inset_0_0_0_2px_var(--color-pink)]' : ''}
              `}
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
            >
              <span
                className={`
                  text-base font-bold mb-2 inline-flex items-center justify-center
                  min-w-[36px] min-h-[36px] rounded-full
                  ${isSunday ? 'text-red-500' : isSaturday ? 'text-[var(--color-pink)]' : 'text-[var(--text-primary)]'}
                  ${day.isToday ? 'bg-[var(--color-pink)] text-white font-bold shadow-lg' : ''}
                `}
              >
                {day.date.getDate()}
              </span>

              {/* Event Text List (Desktop) */}
              {day.events.length > 0 && (
                <div className="hidden md:flex flex-col gap-1 flex-1 overflow-hidden">
                  {day.events.slice(0, 3).map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className="px-2 py-1.5 rounded-md text-xs font-semibold text-white whitespace-nowrap overflow-hidden text-ellipsis transition-all hover:brightness-110 hover:translate-x-[2px] hover:shadow-md"
                      style={{
                        backgroundColor: getEventColor(event),
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {day.events.length > 3 && (
                    <span className="text-xs text-[var(--text-muted)] mt-1 font-medium">
                      +{day.events.length - 3}개
                    </span>
                  )}
                </div>
              )}

              {/* Event Dots (Mobile) */}
              {day.events.length > 0 && (
                <div className="flex md:hidden gap-1.5 flex-wrap mt-2">
                  {day.events.slice(0, 4).map((event, eventIndex) => (
                    <span
                      key={eventIndex}
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: getEventColor(event),
                        boxShadow: `0 0 8px ${getEventColor(event)}`,
                      }}
                    />
                  ))}
                  {day.events.length > 4 && (
                    <span className="text-xs text-[var(--text-muted)] font-medium">
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
