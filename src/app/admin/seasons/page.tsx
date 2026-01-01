'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Calendar, Plus, X, Save } from 'lucide-react'
import { DataTable, Column } from '@/components/admin'
import { useSupabaseContext } from '@/lib/context'
import styles from '../shared.module.css'

interface Season {
  id: number
  name: string
  startDate: string
  endDate: string | null
  isActive: boolean
  createdAt: string
}

export default function SeasonsPage() {
  const supabase = useSupabaseContext()
  const [seasons, setSeasons] = useState<Season[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSeason, setEditingSeason] = useState<Partial<Season> | null>(null)
  const [isNew, setIsNew] = useState(false)

  const fetchSeasons = useCallback(async () => {
    setIsLoading(true)

    const { data, error } = await supabase
      .from('seasons')
      .select('*')
      .order('start_date', { ascending: false })

    if (error) {
      console.error('시즌 데이터 로드 실패:', error)
    } else {
      setSeasons(
        (data || []).map((s) => ({
          id: s.id,
          name: s.name,
          startDate: s.start_date,
          endDate: s.end_date,
          isActive: s.is_active,
          createdAt: s.created_at,
        }))
      )
    }

    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchSeasons()
  }, [fetchSeasons])

  const handleAdd = () => {
    const today = new Date().toISOString().split('T')[0]
    setEditingSeason({
      name: '',
      startDate: today,
      endDate: today,
      isActive: false,
    })
    setIsNew(true)
    setIsModalOpen(true)
  }

  const handleEdit = (season: Season) => {
    setEditingSeason(season)
    setIsNew(false)
    setIsModalOpen(true)
  }

  const handleDelete = async (season: Season) => {
    if (!confirm('정말 삭제하시겠습니까? 관련된 모든 데이터가 삭제됩니다.')) return

    const { error } = await supabase.from('seasons').delete().eq('id', season.id)

    if (error) {
      console.error('시즌 삭제 실패:', error)
      alert('삭제에 실패했습니다.')
    } else {
      fetchSeasons()
    }
  }

  const handleSave = async () => {
    if (!editingSeason || !editingSeason.name) {
      alert('시즌 이름을 입력해주세요.')
      return
    }

    // 활성화 시 다른 시즌 비활성화
    if (editingSeason.isActive) {
      await supabase.from('seasons').update({ is_active: false }).neq('id', editingSeason.id || 0)
    }

    if (isNew) {
      const { error } = await supabase.from('seasons').insert({
        name: editingSeason.name!,
        start_date: editingSeason.startDate!,
        end_date: editingSeason.endDate,
        is_active: editingSeason.isActive,
      })

      if (error) {
        console.error('시즌 등록 실패:', error)
        alert('등록에 실패했습니다.')
        return
      }
    } else {
      const { error } = await supabase
        .from('seasons')
        .update({
          name: editingSeason.name,
          start_date: editingSeason.startDate,
          end_date: editingSeason.endDate,
          is_active: editingSeason.isActive,
        })
        .eq('id', editingSeason.id!)

      if (error) {
        console.error('시즌 수정 실패:', error)
        alert('수정에 실패했습니다.')
        return
      }
    }

    setIsModalOpen(false)
    fetchSeasons()
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const columns: Column<Season>[] = [
    { key: 'name', header: '시즌명', width: '200px' },
    {
      key: 'startDate',
      header: '시작일',
      width: '150px',
      render: (item) => formatDate(item.startDate),
    },
    {
      key: 'endDate',
      header: '종료일',
      width: '150px',
      render: (item) => item.endDate ? formatDate(item.endDate) : '-',
    },
    {
      key: 'isActive',
      header: '상태',
      width: '100px',
      render: (item) => (
        <span className={`${styles.statusBadge} ${item.isActive ? styles.active : styles.inactive}`}>
          {item.isActive ? '진행중' : '종료'}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: '생성일',
      width: '150px',
      render: (item) => formatDate(item.createdAt),
    },
  ]

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Calendar size={24} className={styles.headerIcon} />
          <div>
            <h1 className={styles.title}>시즌 관리</h1>
            <p className={styles.subtitle}>후원 시즌 관리</p>
          </div>
        </div>
        <button onClick={handleAdd} className={styles.addButton}>
          <Plus size={18} />
          시즌 추가
        </button>
      </header>

      <DataTable
        data={seasons}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="시즌명으로 검색..."
        isLoading={isLoading}
      />

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && editingSeason && (
          <motion.div
            className={styles.modalOverlay}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsModalOpen(false)}
          >
            <motion.div
              className={styles.modal}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
            >
              <div className={styles.modalHeader}>
                <h2>{isNew ? '시즌 추가' : '시즌 수정'}</h2>
                <button onClick={() => setIsModalOpen(false)} className={styles.closeButton}>
                  <X size={20} />
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>시즌명</label>
                  <input
                    type="text"
                    value={editingSeason.name}
                    onChange={(e) =>
                      setEditingSeason({ ...editingSeason, name: e.target.value })
                    }
                    className={styles.input}
                    placeholder="예: 2024년 1분기"
                  />
                </div>

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>시작일</label>
                    <input
                      type="date"
                      value={editingSeason.startDate}
                      onChange={(e) =>
                        setEditingSeason({ ...editingSeason, startDate: e.target.value })
                      }
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>종료일</label>
                    <input
                      type="date"
                      value={editingSeason.endDate || ''}
                      onChange={(e) =>
                        setEditingSeason({ ...editingSeason, endDate: e.target.value || null })
                      }
                      className={styles.input}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={editingSeason.isActive}
                      onChange={(e) =>
                        setEditingSeason({ ...editingSeason, isActive: e.target.checked })
                      }
                      className={styles.checkbox}
                    />
                    <span>활성 시즌으로 설정</span>
                  </label>
                  <p className={styles.hint}>활성화 시 다른 시즌은 자동으로 비활성화됩니다.</p>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button onClick={() => setIsModalOpen(false)} className={styles.cancelButton}>
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
