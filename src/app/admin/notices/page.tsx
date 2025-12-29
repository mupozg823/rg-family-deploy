'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Megaphone, Plus, X, Save, Pin } from 'lucide-react'
import { DataTable, Column } from '@/components/admin'
import { useSupabase } from '@/lib/hooks/useSupabase'
import styles from '../shared.module.css'

interface Notice {
  id: number
  title: string
  content: string
  category: 'official' | 'excel' | 'crew'
  isPinned: boolean
  createdAt: string
}

export default function NoticesPage() {
  const supabase = useSupabase()
  const [notices, setNotices] = useState<Notice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingNotice, setEditingNotice] = useState<Partial<Notice> | null>(null)
  const [isNew, setIsNew] = useState(false)

  const fetchNotices = useCallback(async () => {
    setIsLoading(true)

    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('공지사항 데이터 로드 실패:', error)
    } else {
      setNotices(
        (data || []).map((n) => ({
          id: n.id,
          title: n.title,
          content: n.content || '',
          category: n.category,
          isPinned: n.is_pinned,
          createdAt: n.created_at,
        }))
      )
    }

    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchNotices()
  }, [fetchNotices])

  const handleAdd = () => {
    setEditingNotice({
      title: '',
      content: '',
      category: 'official',
      isPinned: false,
    })
    setIsNew(true)
    setIsModalOpen(true)
  }

  const handleEdit = (notice: Notice) => {
    setEditingNotice(notice)
    setIsNew(false)
    setIsModalOpen(true)
  }

  const handleDelete = async (notice: Notice) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    const { error } = await supabase.from('notices').delete().eq('id', notice.id)

    if (error) {
      console.error('공지사항 삭제 실패:', error)
      alert('삭제에 실패했습니다.')
    } else {
      fetchNotices()
    }
  }

  const handleSave = async () => {
    if (!editingNotice || !editingNotice.title) {
      alert('제목을 입력해주세요.')
      return
    }

    if (isNew) {
      const { error } = await supabase.from('notices').insert({
        title: editingNotice.title!,
        content: editingNotice.content!,
        category: editingNotice.category!,
        is_pinned: editingNotice.isPinned,
      })

      if (error) {
        console.error('공지사항 등록 실패:', error)
        alert('등록에 실패했습니다.')
        return
      }
    } else {
      const { error } = await supabase
        .from('notices')
        .update({
          title: editingNotice.title,
          content: editingNotice.content,
          category: editingNotice.category,
          is_pinned: editingNotice.isPinned,
        })
        .eq('id', editingNotice.id!)

      if (error) {
        console.error('공지사항 수정 실패:', error)
        alert('수정에 실패했습니다.')
        return
      }
    }

    setIsModalOpen(false)
    fetchNotices()
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const columns: Column<Notice>[] = [
    {
      key: 'isPinned',
      header: '',
      width: '40px',
      render: (item) =>
        item.isPinned ? <Pin size={16} style={{ color: 'var(--color-primary)' }} /> : null,
    },
    { key: 'title', header: '제목' },
    {
      key: 'createdAt',
      header: '작성일',
      width: '150px',
      render: (item) => formatDate(item.createdAt),
    },
  ]

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Megaphone size={24} className={styles.headerIcon} />
          <div>
            <h1 className={styles.title}>공지사항 관리</h1>
            <p className={styles.subtitle}>공지사항 작성 및 관리</p>
          </div>
        </div>
        <button onClick={handleAdd} className={styles.addButton}>
          <Plus size={18} />
          공지 작성
        </button>
      </header>

      <DataTable
        data={notices}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="제목으로 검색..."
        isLoading={isLoading}
      />

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && editingNotice && (
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
              style={{ maxWidth: '640px' }}
            >
              <div className={styles.modalHeader}>
                <h2>{isNew ? '공지 작성' : '공지 수정'}</h2>
                <button onClick={() => setIsModalOpen(false)} className={styles.closeButton}>
                  <X size={20} />
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>제목</label>
                  <input
                    type="text"
                    value={editingNotice.title}
                    onChange={(e) =>
                      setEditingNotice({ ...editingNotice, title: e.target.value })
                    }
                    className={styles.input}
                    placeholder="공지사항 제목을 입력하세요"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>내용</label>
                  <textarea
                    value={editingNotice.content}
                    onChange={(e) =>
                      setEditingNotice({ ...editingNotice, content: e.target.value })
                    }
                    className={styles.textarea}
                    placeholder="공지사항 내용을 입력하세요..."
                    rows={10}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label className={styles.checkboxLabel}>
                    <input
                      type="checkbox"
                      checked={editingNotice.isPinned}
                      onChange={(e) =>
                        setEditingNotice({ ...editingNotice, isPinned: e.target.checked })
                      }
                      className={styles.checkbox}
                    />
                    <span>상단 고정</span>
                  </label>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button onClick={() => setIsModalOpen(false)} className={styles.cancelButton}>
                  취소
                </button>
                <button onClick={handleSave} className={styles.saveButton}>
                  <Save size={16} />
                  {isNew ? '작성' : '저장'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
