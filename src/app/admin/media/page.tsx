'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Film, Plus, X, Save, ExternalLink } from 'lucide-react'
import { DataTable, Column } from '@/components/admin'
import { useAdminCRUD, useAlert } from '@/lib/hooks'
import { useSupabaseContext } from '@/lib/context'
import styles from '../shared.module.css'

type ContentType = 'shorts' | 'vod'

interface Media {
  id: number
  title: string
  description: string
  contentType: ContentType
  videoUrl: string
  thumbnailUrl: string
  unit: 'excel' | 'crew' | null
  createdAt: string
}

export default function MediaPage() {
  const supabase = useSupabaseContext()
  const alertHandler = useAlert()
  const [activeType, setActiveType] = useState<ContentType>('shorts')

  const {
    items: allMediaList,
    isLoading,
    isModalOpen,
    isNew,
    editingItem: editingMedia,
    setEditingItem: setEditingMedia,
    openAddModal: baseOpenAddModal,
    openEditModal,
    closeModal,
    handleSave,
    handleDelete,
    refetch,
  } = useAdminCRUD<Media>({
    tableName: 'media_content',
    defaultItem: {
      title: '',
      description: '',
      contentType: activeType,
      videoUrl: '',
      thumbnailUrl: '',
      unit: null,
    },
    orderBy: { column: 'created_at', ascending: false },
    fromDbFormat: (row) => ({
      id: row.id as number,
      title: row.title as string,
      description: (row.description as string) || '',
      contentType: row.content_type as ContentType,
      videoUrl: row.video_url as string,
      thumbnailUrl: (row.thumbnail_url as string) || '',
      unit: row.unit as 'excel' | 'crew' | null,
      createdAt: row.created_at as string,
    }),
    toDbFormat: (item) => ({
      title: item.title,
      description: item.description,
      content_type: item.contentType,
      video_url: item.videoUrl,
      thumbnail_url: item.thumbnailUrl,
      unit: item.unit,
    }),
    validate: (item) => {
      if (!item.title || !item.videoUrl) return '제목과 영상 URL을 입력해주세요.'
      return null
    },
    alertHandler,
  })

  // Filter by activeType
  const mediaList = allMediaList.filter((m) => m.contentType === activeType)

  // Refetch when activeType changes
  useEffect(() => {
    refetch()
  }, [activeType, refetch])

  const openAddModal = () => {
    baseOpenAddModal()
    setEditingMedia((prev) => prev ? { ...prev, contentType: activeType } : null)
  }

  const handleView = (media: Media) => {
    window.open(media.videoUrl, '_blank')
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const columns: Column<Media>[] = [
    { key: 'title', header: '제목' },
    {
      key: 'unit',
      header: '부서',
      width: '100px',
      render: (item) => (
        <span className={`${styles.badge} ${item.unit === 'excel' ? styles.badgeExcel : styles.badgeCrew}`}>
          {item.unit === 'excel' ? '엑셀부' : '크루부'}
        </span>
      ),
    },
    {
      key: 'videoUrl',
      header: '링크',
      width: '80px',
      render: (item) => (
        <a
          href={item.videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          style={{ color: 'var(--color-primary)' }}
        >
          <ExternalLink size={16} />
        </a>
      ),
    },
    {
      key: 'createdAt',
      header: '등록일',
      width: '120px',
      render: (item) => formatDate(item.createdAt),
    },
  ]

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Film size={24} className={styles.headerIcon} />
          <div>
            <h1 className={styles.title}>미디어 관리</h1>
            <p className={styles.subtitle}>숏폼/VOD 콘텐츠 관리</p>
          </div>
        </div>
        <button onClick={openAddModal} className={styles.addButton}>
          <Plus size={18} />
          미디어 추가
        </button>
      </header>

      {/* Type Tabs */}
      <div className={styles.typeSelector}>
        <button
          onClick={() => setActiveType('shorts')}
          className={`${styles.typeButton} ${activeType === 'shorts' ? styles.active : ''}`}
        >
          숏폼
        </button>
        <button
          onClick={() => setActiveType('vod')}
          className={`${styles.typeButton} ${activeType === 'vod' ? styles.active : ''}`}
        >
          VOD
        </button>
      </div>

      <DataTable
        data={mediaList}
        columns={columns}
        onView={handleView}
        onEdit={openEditModal}
        onDelete={handleDelete}
        searchPlaceholder="제목으로 검색..."
        isLoading={isLoading}
      />

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && editingMedia && (
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
                <h2>{isNew ? '미디어 추가' : '미디어 수정'}</h2>
                <button onClick={closeModal} className={styles.closeButton}>
                  <X size={20} />
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>제목</label>
                  <input
                    type="text"
                    value={editingMedia.title || ''}
                    onChange={(e) =>
                      setEditingMedia({ ...editingMedia, title: e.target.value })
                    }
                    className={styles.input}
                    placeholder="영상 제목을 입력하세요"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>콘텐츠 유형</label>
                  <div className={styles.typeSelector}>
                    <button
                      type="button"
                      onClick={() => setEditingMedia({ ...editingMedia, contentType: 'shorts' })}
                      className={`${styles.typeButton} ${editingMedia.contentType === 'shorts' ? styles.active : ''}`}
                    >
                      숏폼
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingMedia({ ...editingMedia, contentType: 'vod' })}
                      className={`${styles.typeButton} ${editingMedia.contentType === 'vod' ? styles.active : ''}`}
                    >
                      VOD
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>부서</label>
                  <div className={styles.typeSelector}>
                    <button
                      type="button"
                      onClick={() => setEditingMedia({ ...editingMedia, unit: 'excel' })}
                      className={`${styles.typeButton} ${editingMedia.unit === 'excel' ? styles.active : ''}`}
                    >
                      엑셀부
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingMedia({ ...editingMedia, unit: 'crew' })}
                      className={`${styles.typeButton} ${editingMedia.unit === 'crew' ? styles.active : ''}`}
                    >
                      크루부
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>영상 URL</label>
                  <input
                    type="text"
                    value={editingMedia.videoUrl || ''}
                    onChange={(e) =>
                      setEditingMedia({ ...editingMedia, videoUrl: e.target.value })
                    }
                    className={styles.input}
                    placeholder="https://youtube.com/..."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>썸네일 URL (선택)</label>
                  <input
                    type="text"
                    value={editingMedia.thumbnailUrl || ''}
                    onChange={(e) =>
                      setEditingMedia({ ...editingMedia, thumbnailUrl: e.target.value })
                    }
                    className={styles.input}
                    placeholder="https://..."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>설명 (선택)</label>
                  <textarea
                    value={editingMedia.description || ''}
                    onChange={(e) =>
                      setEditingMedia({ ...editingMedia, description: e.target.value })
                    }
                    className={styles.textarea}
                    placeholder="영상에 대한 설명..."
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
