/**
 * 캘린더 타입
 *
 * 일정 및 캘린더 관련 타입 정의
 */

/** 캘린더 일자 정보 */
export interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  events: ScheduleEvent[]
}

/** 일정 이벤트 */
export interface ScheduleEvent {
  id: number
  title: string
  description: string | null
  unit: 'excel' | 'crew' | null
  eventType: 'broadcast' | 'collab' | 'event' | 'notice' | '休'
  startDatetime: string
  endDatetime: string | null
  color: string | null
  isAllDay: boolean
}
