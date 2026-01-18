'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, Plus, X, Save } from 'lucide-react'
import { DataTable, Column } from '@/components/admin'
import { useAdminCRUD, useAlert } from '@/lib/hooks'
import styles from '../shared.module.css'

type EventType = 'broadcast' | 'collab' | 'event' | 'notice' | '休'

interface Schedule {
  id: number
  title: string
  description: string
  startDatetime: string
  endDatetime: string | null
  eventType: EventType
  unit: 'excel' | 'crew' | null
  isAllDay: boolean
  createdAt: string
}

const eventTypeLabels: Record<EventType, string> = {
  broadcast: '방송',
  collab: '콜라보',
  event: '이벤트',
  notice: '공지',
  '休': '휴식',
}

const eventTypeColors: Record<EventType, string> = {
  broadcast: 'rgba(196, 30, 127, 0.15)',
  collab: 'rgba(96, 165, 250, 0.15)',
  event: 'rgba(59, 130, 246, 0.15)',
  notice: 'rgba(234, 179, 8, 0.15)',
  '休': 'rgba(148, 163, 184, 0.15)',
}

export default function SchedulesPage() {
  const alertHandler = useAlert()

  const getDefaultStartDatetime = () => {
    const now = new Date()
    now.setHours(20, 0, 0, 0)
    return now.toISOString()
  }

  const {
    items: schedules,
    isLoading,
    isModalOpen,
    isNew,
    editingItem: editingSchedule,
    setEditingItem: setEditingSchedule,
    openAddModal,
    openEditModal,
    closeModal,
    handleSave,
    handleDelete,
  } = useAdminCRUD<Schedule>({
    tableName: 'schedules',
    defaultItem: {
      title: '',
      description: '',
      startDatetime: getDefaultStartDatetime(),
      endDatetime: null,
      eventType: 'broadcast',
      unit: null,
      isAllDay: false,
    },
    orderBy: { column: 'start_datetime', ascending: false },
    fromDbFormat: (row) => ({
      id: row.id as number,
      title: row.title as string,
      description: (row.description as string) || '',
      startDatetime: row.start_datetime as string,
      endDatetime: row.end_datetime as string | null,
      eventType: row.event_type as EventType,
      unit: row.unit as 'excel' | 'crew' | null,
      isAllDay: row.is_all_day as boolean,
      createdAt: row.created_at as string,
    }),
    toDbFormat: (item) => ({
      title: item.title,
      description: item.description,
      start_datetime: item.startDatetime,
      end_datetime: item.endDatetime,
      event_type: item.eventType,
      unit: item.unit,
      is_all_day: item.isAllDay,
    }),
    validate: (item) => {
      if (!item.title) return '일정 제목을 입력해주세요.'
      return null
    },
    alertHandler,
  })

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const formatTime = (dateStr: string) => {
    return new Date(dateStr).toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const columns: Column<Schedule>[] = [
    { key: 'title', header: '제목' },
    {
      key: 'eventType',
      header: '유형',
      width: '100px',
      render: (item) => (
        <span
          className={styles.badge}
          style={{ background: eventTypeColors[item.eventType], color: 'var(--color-text)' }}
        >
          {eventTypeLabels[item.eventType]}
        </span>
      ),
    },
    {
      key: 'unit',
      header: '대상',
      width: '100px',
      render: (item) => (
        <span className={`${styles.badge} ${item.unit === 'excel' ? styles.badgeExcel : item.unit === 'crew' ? styles.badgeCrew : ''}`}>
          {item.unit === null ? '전체' : item.unit === 'excel' ? '엑셀부' : '크루부'}
        </span>
      ),
    },
    {
      key: 'startDatetime',
      header: '날짜',
      width: '150px',
      render: (item) => formatDate(item.startDatetime),
    },
    {
      key: 'startDatetime',
      header: '시간',
      width: '100px',
      render: (item) => (item.isAllDay ? '종일' : formatTime(item.startDatetime)),
    },
  ]

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <CalendarDays size={24} className={styles.headerIcon} />
          <div>
            <h1 className={styles.title}>일정 관리</h1>
            <p className={styles.subtitle}>방송/이벤트/공지 일정 관리</p>
          </div>
        </div>
        <button onClick={openAddModal} className={styles.addButton}>
          <Plus size={18} />
          일정 추가
        </button>
      </header>

      <DataTable
        data={schedules}
        columns={columns}
        onEdit={openEditModal}
        onDelete={handleDelete}
        searchPlaceholder="일정 제목으로 검색..."
        isLoading={isLoading}
      />

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && editingSchedule && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeModal}
          >
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2>{isNew ? '일정 추가' : '일정 수정'}</h2>
                <button onClick={closeModal} className={styles.closeButton}>
                  <X size={20} />
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>제목</label>
                  <input
                    type="text"
                    value={editingSchedule.title || ''}
                    onChange={(e) =>
                      setEditingSchedule({ ...editingSchedule, title: e.target.value })
                    }
                    className={styles.input}
                    placeholder="일정 제목을 입력하세요"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>유형</label>
                  <div className={styles.typeSelector}>
                    {(['broadcast', 'collab', 'event', 'notice', '休'] as EventType[]).map((type) => (
                      <button
                        key={type}
                        type="button"
                        onClick={() => setEditingSchedule({ ...editingSchedule, eventType: type })}
                        className={`${styles.typeButton} ${editingSchedule.eventType === type ? styles.active : ''}`}
                      >
                        {eventTypeLabels[type]}
                      </button>
                    ))}
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>대상</label>
                  <select
                    value={editingSchedule.unit || ''}
                    onChange={(e) =>
                      setEditingSchedule({
                        ...editingSchedule,
                        unit: e.target.value === '' ? null : (e.target.value as 'excel' | 'crew'),
                      })
                    }
                    className={styles.select}
                  >
                    <option value="">전체</option>
                    <option value="excel">엑셀부</option>
                    <option value="crew">크루부</option>
                  </select>
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>시작 일시</label>
                    <input
                      type="datetime-local"
                      value={editingSchedule.startDatetime?.slice(0, 16) || ''}
                      onChange={(e) =>
                        setEditingSchedule({
                          ...editingSchedule,
                          startDatetime: new Date(e.target.value).toISOString(),
                        })
                      }
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label className={styles.checkboxLabel}>
                      <input
                        type="checkbox"
                        checked={editingSchedule.isAllDay || false}
                        onChange={(e) =>
                          setEditingSchedule({ ...editingSchedule, isAllDay: e.target.checked })
                        }
                        className={styles.checkbox}
                      />
                      <span>종일</span>
                    </label>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>설명 (선택)</label>
                  <textarea
                    value={editingSchedule.description || ''}
                    onChange={(e) =>
                      setEditingSchedule({ ...editingSchedule, description: e.target.value })
                    }
                    className={styles.textarea}
                    placeholder="일정에 대한 추가 설명..."
                    rows={3}
                  />
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button onClick={closeModal} className={styles.cancelButton}>
                  취소
                </button>
                <button onClick={handleSave} className={styles.saveButton}>
                  <Save size={16} />
                  {isNew ? '추가' : '저장'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
