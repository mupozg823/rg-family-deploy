'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Film, Plus, X, Save, Play, ExternalLink } from 'lucide-react'
import { DataTable, Column } from '@/components/admin'
import { useSupabase } from '@/lib/hooks/useSupabase'
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
  const supabase = useSupabase()
  const [mediaList, setMediaList] = useState<Media[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMedia, setEditingMedia] = useState<Partial<Media> | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [activeType, setActiveType] = useState<'shorts' | 'vod'>('shorts')

  const fetchMedia = useCallback(async () => {
    setIsLoading(true)

    const { data, error } = await supabase
      .from('media_content')
      .select('*')
      .eq('content_type', activeType)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('미디어 데이터 로드 실패:', error)
    } else {
      setMediaList(
        (data || []).map((m) => ({
          id: m.id,
          title: m.title,
          description: m.description || '',
          contentType: m.content_type,
          videoUrl: m.video_url,
          thumbnailUrl: m.thumbnail_url || '',
          unit: m.unit,
          createdAt: m.created_at,
        }))
      )
    }

    setIsLoading(false)
  }, [supabase, activeType])

  useEffect(() => {
    fetchMedia()
  }, [fetchMedia])

  const handleAdd = () => {
    setEditingMedia({
      title: '',
      description: '',
      contentType: activeType,
      videoUrl: '',
      thumbnailUrl: '',
      unit: null,
    })
    setIsNew(true)
    setIsModalOpen(true)
  }

  const handleEdit = (media: Media) => {
    setEditingMedia(media)
    setIsNew(false)
    setIsModalOpen(true)
  }

  const handleDelete = async (media: Media) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    const { error } = await supabase.from('media_content').delete().eq('id', media.id)

    if (error) {
      console.error('미디어 삭제 실패:', error)
      alert('삭제에 실패했습니다.')
    } else {
      fetchMedia()
    }
  }

  const handleView = (media: Media) => {
    window.open(media.videoUrl, '_blank')
  }

  const handleSave = async () => {
    if (!editingMedia || !editingMedia.title || !editingMedia.videoUrl) {
      alert('제목과 영상 URL을 입력해주세요.')
      return
    }

    if (isNew) {
      const { error } = await supabase.from('media_content').insert({
        title: editingMedia.title!,
        description: editingMedia.description,
        content_type: editingMedia.contentType!,
        video_url: editingMedia.videoUrl!,
        thumbnail_url: editingMedia.thumbnailUrl,
        unit: editingMedia.unit,
      })

      if (error) {
        console.error('미디어 등록 실패:', error)
        alert('등록에 실패했습니다.')
        return
      }
    } else {
      const { error } = await supabase
        .from('media_content')
        .update({
          title: editingMedia.title,
          description: editingMedia.description,
          content_type: editingMedia.contentType,
          video_url: editingMedia.videoUrl,
          thumbnail_url: editingMedia.thumbnailUrl,
          unit: editingMedia.unit,
        })
        .eq('id', editingMedia.id!)

      if (error) {
        console.error('미디어 수정 실패:', error)
        alert('수정에 실패했습니다.')
        return
      }
    }

    setIsModalOpen(false)
    fetchMedia()
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
        <button onClick={handleAdd} className={styles.addButton}>
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
        onEdit={handleEdit}
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
                <h2>{isNew ? '미디어 추가' : '미디어 수정'}</h2>
                <button onClick={() => setIsModalOpen(false)} className={styles.closeButton}>
                  <X size={20} />
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>제목</label>
                  <input
                    type="text"
                    value={editingMedia.title}
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
                    value={editingMedia.videoUrl}
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
                    value={editingMedia.thumbnailUrl}
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
                    value={editingMedia.description}
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
