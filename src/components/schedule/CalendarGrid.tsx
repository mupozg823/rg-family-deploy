'use client'

import { motion } from 'framer-motion'
import type { CalendarDay } from '@/types/common'

interface CalendarGridProps {
  days: CalendarDay[]
  selectedDate: Date | null
  onSelectDate: (date: Date) => void
}

const EVENT_COLORS: Record<string, string> = {
  broadcast: '#22c55e', // green-500 (방송)
  collab: '#3b82f6', // blue-500 (콜라보)
  event: '#f59e0b', // amber-500 (이벤트)
  notice: '#a855f7', // purple-500 (공지)
  '休': '#6b7280', // gray-500 (휴방)
  excel: '#22c55e', // green-500 (Excel Unit)
  crew: '#3b82f6', // blue-500 (Crew Unit)
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
    return event.color || EVENT_COLORS[event.eventType || ''] || '#6b7280'
  }

  return (
    <div className="grid grid-cols-7 gap-[1px] bg-zinc-700/50">
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
                ${isSelected ? 'bg-[var(--interactive-focus)] shadow-[inset_0_0_0_2px_var(--color-primary)]' : ''}
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
                <div className="hidden md:flex flex-col gap-1 flex-1 overflow-hidden">
                  {day.events.slice(0, 3).map((event, eventIndex) => (
                    <div
                      key={eventIndex}
                      className="px-2 py-1.5 rounded text-xs font-medium text-white whitespace-nowrap overflow-hidden text-ellipsis transition-all hover:brightness-110 hover:scale-[1.02] shadow-sm"
                      style={{
                        backgroundColor: getEventColor(event),
                      }}
                    >
                      {event.title}
                    </div>
                  ))}
                  {day.events.length > 3 && (
                    <span className="text-xs text-[var(--text-muted)] font-medium mt-0.5">
                      +{day.events.length - 3}개 더보기
                    </span>
                  )}
                </div>
              )}

              {/* Event Dots (Mobile) */}
              {day.events.length > 0 && (
                <div className="flex md:hidden gap-1.5 flex-wrap mt-auto">
                  {day.events.slice(0, 4).map((event, eventIndex) => (
                    <span
                      key={eventIndex}
                      className="w-2.5 h-2.5 rounded-full"
                      style={{
                        backgroundColor: getEventColor(event),
                        boxShadow: `0 0 4px ${getEventColor(event)}40`,
                      }}
                    />
                  ))}
                  {day.events.length > 4 && (
                    <span className="text-[10px] text-[var(--text-muted)] font-medium">
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
