'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSupabase } from './useSupabase'
import type { Schedule } from '@/types/database'
import type { CalendarDay, ScheduleEvent, UnitFilter } from '@/types/common'

interface UseScheduleReturn {
  events: Schedule[]
  currentMonth: Date
  selectedDate: Date | null
  unitFilter: UnitFilter
  isLoading: boolean
  error: string | null
  calendarDays: CalendarDay[]
  selectedDateEvents: ScheduleEvent[]
  setMonth: (date: Date) => void
  setSelectedDate: (date: Date | null) => void
  setUnitFilter: (filter: UnitFilter) => void
  nextMonth: () => void
  prevMonth: () => void
  refetch: () => Promise<void>
}

export function useSchedule(): UseScheduleReturn {
  const supabase = useSupabase()
  const [events, setEvents] = useState<Schedule[]>([])
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [unitFilter, setUnitFilter] = useState<UnitFilter>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchEvents = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      const startOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      const endOfMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

      let query = supabase
        .from('schedules')
        .select('*')
        .gte('start_datetime', startOfMonth.toISOString())
        .lte('start_datetime', endOfMonth.toISOString())
        .order('start_datetime', { ascending: true })

      if (unitFilter !== 'all') {
        query = query.or(`unit.eq.${unitFilter},unit.is.null`)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError
      setEvents(data || [])
    } catch (err) {
      setError(err instanceof Error ? err.message : '일정을 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, currentMonth, unitFilter])

  useEffect(() => {
    fetchEvents()
  }, [fetchEvents])

  const getCalendarDays = useCallback((): CalendarDay[] => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)

    const days: CalendarDay[] = []

    // 이전 달의 날짜들
    const startDayOfWeek = firstDay.getDay()
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const date = new Date(year, month, -i)
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        events: [],
      })
    }

    // 현재 달의 날짜들
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(year, month, day)
      const dayEvents = events.filter(event => {
        const eventDate = new Date(event.start_datetime)
        return eventDate.getDate() === day &&
               eventDate.getMonth() === month &&
               eventDate.getFullYear() === year
      }).map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        unit: event.unit,
        eventType: event.event_type,
        startDatetime: event.start_datetime,
        endDatetime: event.end_datetime,
        color: event.color,
        isAllDay: event.is_all_day,
      }))

      days.push({
        date,
        isCurrentMonth: true,
        isToday: date.getTime() === today.getTime(),
        events: dayEvents,
      })
    }

    // 다음 달의 날짜들 (6주 맞추기)
    const remainingDays = 42 - days.length
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(year, month + 1, i)
      days.push({
        date,
        isCurrentMonth: false,
        isToday: false,
        events: [],
      })
    }

    return days
  }, [currentMonth, events])

  const getSelectedDateEvents = useCallback((): ScheduleEvent[] => {
    if (!selectedDate) return []

    return events
      .filter(event => {
        const eventDate = new Date(event.start_datetime)
        return eventDate.getDate() === selectedDate.getDate() &&
               eventDate.getMonth() === selectedDate.getMonth() &&
               eventDate.getFullYear() === selectedDate.getFullYear()
      })
      .map(event => ({
        id: event.id,
        title: event.title,
        description: event.description,
        unit: event.unit,
        eventType: event.event_type,
        startDatetime: event.start_datetime,
        endDatetime: event.end_datetime,
        color: event.color,
        isAllDay: event.is_all_day,
      }))
  }, [selectedDate, events])

  const nextMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }, [])

  const prevMonth = useCallback(() => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }, [])

  return {
    events,
    currentMonth,
    selectedDate,
    unitFilter,
    isLoading,
    error,
    calendarDays: getCalendarDays(),
    selectedDateEvents: getSelectedDateEvents(),
    setMonth: setCurrentMonth,
    setSelectedDate,
    setUnitFilter,
    nextMonth,
    prevMonth,
    refetch: fetchEvents,
  }
}
