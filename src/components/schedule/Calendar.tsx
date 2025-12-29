'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useSchedule } from '@/lib/hooks/useSchedule'
import CalendarGrid from './CalendarGrid'
import EventList from './EventList'
import styles from './Calendar.module.css'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']

export default function Calendar() {
  const {
    currentMonth,
    selectedDate,
    unitFilter,
    isLoading,
    calendarDays,
    selectedDateEvents,
    setSelectedDate,
    setUnitFilter,
    nextMonth,
    prevMonth,
  } = useSchedule()

  const monthYear = currentMonth.toLocaleDateString('ko-KR', {
    year: 'numeric',
    month: 'long',
  })

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.navigation}>
          <button onClick={prevMonth} className={styles.navButton}>
            <ChevronLeft size={24} />
          </button>
          <motion.h2
            key={monthYear}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={styles.monthTitle}
          >
            {monthYear}
          </motion.h2>
          <button onClick={nextMonth} className={styles.navButton}>
            <ChevronRight size={24} />
          </button>
        </div>

        <div className={styles.filters}>
          {(['all', 'excel', 'crew'] as const).map((filter) => (
            <button
              key={filter}
              onClick={() => setUnitFilter(filter)}
              className={`${styles.filterButton} ${unitFilter === filter ? styles.active : ''}`}
              data-unit={filter}
            >
              {filter === 'all' ? '전체' : filter === 'excel' ? '엑셀부' : '크루부'}
            </button>
          ))}
        </div>
      </div>

      {/* Weekday Labels */}
      <div className={styles.weekdays}>
        {WEEKDAYS.map((day, index) => (
          <div
            key={day}
            className={`${styles.weekday} ${index === 0 ? styles.sunday : ''} ${index === 6 ? styles.saturday : ''}`}
          >
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      {isLoading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>일정을 불러오는 중...</span>
        </div>
      ) : (
        <CalendarGrid
          days={calendarDays}
          selectedDate={selectedDate}
          onSelectDate={setSelectedDate}
        />
      )}

      {/* Selected Date Events */}
      <AnimatePresence>
        {selectedDate && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className={styles.eventSection}
          >
            <EventList
              date={selectedDate}
              events={selectedDateEvents}
              onClose={() => setSelectedDate(null)}
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
