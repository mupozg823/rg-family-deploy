'use client'

import { useState, useEffect } from 'react'
import { Calendar, Plus, Image as ImageIcon } from 'lucide-react'
import { DataTable, Column, AdminModal } from '@/components/admin'
import { useAdminCRUD } from '@/lib/hooks'
import { useSeasons } from '@/lib/context'
import styles from '../shared.module.css'

interface TimelineItem {
  id: number
  eventDate: string
  title: string
  description: string | null
  imageUrl: string | null
  category: string | null
  seasonId: number | null
  unit: 'excel' | 'crew' | null
  orderIndex: number
}

interface Season {
  id: number
  name: string
}

// 카테고리 옵션
const CATEGORIES = [
  '행사',
  '생일',
  '기념일',
  '콜라보',
  '방송',
  '이벤트',
  '기타',
]

export default function TimelinePage() {
  const seasonsRepo = useSeasons()
  const [seasons, setSeasons] = useState<Season[]>([])
  const [filterCategory, setFilterCategory] = useState<string>('')
  const [filterUnit, setFilterUnit] = useState<string>('')

  // Fetch seasons for dropdown
  useEffect(() => {
    const fetchSeasons = async () => {
      const data = await seasonsRepo.findAll()
      setSeasons(
        (data || [])
          .map((s) => ({ id: s.id, name: s.name }))
          .sort((a, b) => b.id - a.id)
      )
    }
    void fetchSeasons()
  }, [seasonsRepo])

  const {
    items: events,
    isLoading,
    isModalOpen,
    isNew,
    editingItem,
    setEditingItem,
    openAddModal: baseOpenAddModal,
    openEditModal,
    closeModal,
    handleSave,
    handleDelete,
  } = useAdminCRUD<TimelineItem>({
    tableName: 'timeline_events',
    defaultItem: {
      eventDate: new Date().toISOString().split('T')[0],
      title: '',
      description: '',
      imageUrl: '',
      category: '기타',
      seasonId: null,
      unit: null,
      orderIndex: 0,
    },
    orderBy: { column: 'event_date', ascending: false },
    fromDbFormat: (row) => ({
      id: row.id as number,
      eventDate: row.event_date as string,
      title: row.title as string,
      description: row.description as string | null,
      imageUrl: row.image_url as string | null,
      category: row.category as string | null,
      seasonId: row.season_id as number | null,
      unit: row.unit as 'excel' | 'crew' | null,
      orderIndex: row.order_index as number,
    }),
    toDbFormat: (item) => ({
      event_date: item.eventDate,
      title: item.title,
      description: item.description || null,
      image_url: item.imageUrl || null,
      category: item.category || null,
      season_id: item.seasonId || null,
      unit: item.unit || null,
      order_index: item.orderIndex ?? 0,
    }),
    validate: (item) => {
      if (!item.title?.trim()) return '제목을 입력해주세요.'
      if (!item.eventDate) return '날짜를 선택해주세요.'
      return null
    },
  })

  // 필터링된 이벤트
  const filteredEvents = events.filter((e) => {
    if (filterCategory && e.category !== filterCategory) return false
    if (filterUnit && e.unit !== filterUnit) return false
    return true
  })

  const openAddModal = () => {
    baseOpenAddModal()
    setEditingItem((prev) =>
      prev ? { ...prev, orderIndex: events.length } : null
    )
  }

  // 시즌 이름 가져오기
  const getSeasonName = (seasonId: number | null) => {
    if (!seasonId) return '-'
    const season = seasons.find((s) => s.id === seasonId)
    return season ? season.name : '-'
  }

  const columns: Column<TimelineItem>[] = [
    {
      key: 'eventDate',
      header: '날짜',
      width: '120px',
      render: (item) => (
        <span style={{ fontFamily: 'monospace' }}>
          {item.eventDate}
        </span>
      ),
    },
    {
      key: 'title',
      header: '제목',
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {item.imageUrl && (
            <ImageIcon size={14} style={{ color: 'var(--color-primary)' }} />
          )}
          <span>{item.title}</span>
        </div>
      ),
    },
    {
      key: 'category',
      header: '분류',
      width: '100px',
      render: (item) => (
        <span className={styles.badge}>{item.category || '-'}</span>
      ),
    },
    {
      key: 'unit',
      header: '유닛',
      width: '100px',
      render: (item) => (
        <span className={`${styles.badge} ${item.unit === 'excel' ? styles.badgeExcel : item.unit === 'crew' ? styles.badgeCrew : ''}`}>
          {item.unit === 'excel' ? '엑셀부' : item.unit === 'crew' ? '크루부' : '전체'}
        </span>
      ),
    },
    {
      key: 'seasonId',
      header: '시즌',
      width: '120px',
      render: (item) => getSeasonName(item.seasonId),
    },
  ]

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Calendar size={24} className={styles.headerIcon} />
          <div>
            <h1 className={styles.title}>타임라인 관리</h1>
            <p className={styles.subtitle}>RG 패밀리 연혁 및 이벤트</p>
          </div>
        </div>
        <button onClick={openAddModal} className={styles.addButton}>
          <Plus size={18} />
          이벤트 추가
        </button>
      </header>

      {/* Filters */}
      <div className={styles.filterRow}>
        <select
          className={styles.filterSelect}
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
        >
          <option value="">전체 분류</option>
          {CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
        <select
          className={styles.filterSelect}
          value={filterUnit}
          onChange={(e) => setFilterUnit(e.target.value)}
        >
          <option value="">전체 유닛</option>
          <option value="excel">엑셀부</option>
          <option value="crew">크루부</option>
        </select>
      </div>

      <DataTable
        data={filteredEvents}
        columns={columns}
        onEdit={openEditModal}
        onDelete={handleDelete}
        searchPlaceholder="제목으로 검색..."
        isLoading={isLoading}
      />

      {/* Modal */}
      {editingItem && (
        <AdminModal
          isOpen={isModalOpen}
          title={isNew ? '이벤트 추가' : '이벤트 수정'}
          onClose={closeModal}
          onSave={handleSave}
          saveLabel={isNew ? '추가' : '저장'}
        >
          <div className={styles.formGroup}>
            <label>제목 *</label>
            <input
              type="text"
              value={editingItem.title || ''}
              onChange={(e) =>
                setEditingItem((prev) =>
                  prev ? { ...prev, title: e.target.value } : null
                )
              }
              placeholder="이벤트 제목"
            />
          </div>

          <div className={styles.formGroup}>
            <label>날짜 *</label>
            <input
              type="date"
              value={editingItem.eventDate || ''}
              onChange={(e) =>
                setEditingItem((prev) =>
                  prev ? { ...prev, eventDate: e.target.value } : null
                )
              }
            />
          </div>

          <div className={styles.formRow}>
            <div className={styles.formGroup}>
              <label>분류</label>
              <select
                value={editingItem.category || ''}
                onChange={(e) =>
                  setEditingItem((prev) =>
                    prev ? { ...prev, category: e.target.value || null } : null
                  )
                }
              >
                <option value="">선택하세요</option>
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div className={styles.formGroup}>
              <label>유닛</label>
              <select
                value={editingItem.unit || ''}
                onChange={(e) =>
                  setEditingItem((prev) =>
                    prev ? { ...prev, unit: (e.target.value || null) as 'excel' | 'crew' | null } : null
                  )
                }
              >
                <option value="">전체</option>
                <option value="excel">엑셀부</option>
                <option value="crew">크루부</option>
              </select>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>시즌</label>
            <select
              value={editingItem.seasonId || ''}
              onChange={(e) =>
                setEditingItem((prev) =>
                  prev ? { ...prev, seasonId: e.target.value ? Number(e.target.value) : null } : null
                )
              }
            >
              <option value="">시즌 선택</option>
              {seasons.map((season) => (
                <option key={season.id} value={season.id}>
                  {season.name}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>설명</label>
            <textarea
              value={editingItem.description || ''}
              onChange={(e) =>
                setEditingItem((prev) =>
                  prev ? { ...prev, description: e.target.value } : null
                )
              }
              placeholder="이벤트에 대한 설명을 입력하세요"
              rows={4}
            />
          </div>

          <div className={styles.formGroup}>
            <label>이미지 URL</label>
            <input
              type="url"
              value={editingItem.imageUrl || ''}
              onChange={(e) =>
                setEditingItem((prev) =>
                  prev ? { ...prev, imageUrl: e.target.value } : null
                )
              }
              placeholder="https://..."
            />
            {editingItem.imageUrl && (
              <div className={styles.imagePreview}>
                <img
                  src={editingItem.imageUrl}
                  alt="미리보기"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none'
                  }}
                />
              </div>
            )}
          </div>

          <div className={styles.formGroup}>
            <label>순서</label>
            <input
              type="number"
              value={editingItem.orderIndex ?? 0}
              onChange={(e) =>
                setEditingItem((prev) =>
                  prev ? { ...prev, orderIndex: Number(e.target.value) } : null
                )
              }
              min={0}
            />
          </div>
        </AdminModal>
      )}
    </div>
  )
}
