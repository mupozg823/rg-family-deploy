'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Image as ImageIcon, Plus, X, Save, Video, FileImage } from 'lucide-react'
import { DataTable, Column } from '@/components/admin'
import { useSupabase } from '@/lib/hooks/useSupabase'
import styles from '../shared.module.css'

type MediaType = 'video' | 'image' | 'gif'

interface Signature {
  id: number
  title: string
  description: string
  memberName: string
  mediaType: MediaType
  mediaUrl: string
  thumbnailUrl: string
  unit: 'excel' | 'crew'
  tags: string[]
  createdAt: string
}

export default function SignaturesPage() {
  const supabase = useSupabase()
  const [signatures, setSignatures] = useState<Signature[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingSignature, setEditingSignature] = useState<Partial<Signature> | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [activeUnit, setActiveUnit] = useState<'excel' | 'crew'>('excel')
  const [tagInput, setTagInput] = useState('')

  const fetchSignatures = useCallback(async () => {
    setIsLoading(true)

    const { data, error } = await supabase
      .from('signatures')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('시그니처 데이터 로드 실패:', error)
    } else {
      setSignatures(
        (data || []).map((s) => ({
          id: s.id,
          title: s.title,
          description: s.description || '',
          memberName: s.member_name,
          mediaType: s.media_type,
          mediaUrl: s.media_url,
          thumbnailUrl: s.thumbnail_url || '',
          unit: s.unit,
          tags: s.tags || [],
          createdAt: s.created_at,
        }))
      )
    }

    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchSignatures()
  }, [fetchSignatures])

  const filteredSignatures = signatures.filter((s) => s.unit === activeUnit)

  const handleAdd = () => {
    setEditingSignature({
      title: '',
      description: '',
      memberName: '',
      mediaType: 'video',
      mediaUrl: '',
      thumbnailUrl: '',
      unit: activeUnit,
      tags: [],
    })
    setTagInput('')
    setIsNew(true)
    setIsModalOpen(true)
  }

  const handleEdit = (sig: Signature) => {
    setEditingSignature(sig)
    setTagInput(sig.tags.join(', '))
    setIsNew(false)
    setIsModalOpen(true)
  }

  const handleDelete = async (sig: Signature) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    const { error } = await supabase.from('signatures').delete().eq('id', sig.id)

    if (error) {
      console.error('시그니처 삭제 실패:', error)
      alert('삭제에 실패했습니다.')
    } else {
      fetchSignatures()
    }
  }

  const handleSave = async () => {
    if (!editingSignature || !editingSignature.title || !editingSignature.mediaUrl) {
      alert('제목과 미디어 URL을 입력해주세요.')
      return
    }

    const tags = tagInput
      .split(',')
      .map((t) => t.trim())
      .filter((t) => t)

    if (isNew) {
      const { error } = await supabase.from('signatures').insert({
        title: editingSignature.title!,
        description: editingSignature.description,
        member_name: editingSignature.memberName || '',
        media_type: editingSignature.mediaType!,
        media_url: editingSignature.mediaUrl!,
        thumbnail_url: editingSignature.thumbnailUrl,
        unit: editingSignature.unit!,
        tags,
      })

      if (error) {
        console.error('시그니처 등록 실패:', error)
        alert('등록에 실패했습니다.')
        return
      }
    } else {
      const { error } = await supabase
        .from('signatures')
        .update({
          title: editingSignature.title,
          description: editingSignature.description,
          member_name: editingSignature.memberName,
          media_type: editingSignature.mediaType,
          media_url: editingSignature.mediaUrl,
          thumbnail_url: editingSignature.thumbnailUrl,
          unit: editingSignature.unit,
          tags,
        })
        .eq('id', editingSignature.id!)

      if (error) {
        console.error('시그니처 수정 실패:', error)
        alert('수정에 실패했습니다.')
        return
      }
    }

    setIsModalOpen(false)
    fetchSignatures()
  }

  const columns: Column<Signature>[] = [
    { key: 'title', header: '제목' },
    {
      key: 'mediaType',
      header: '유형',
      width: '100px',
      render: (item) => (
        <span className={styles.badge}>
          {item.mediaType === 'video' ? (
            <>
              <Video size={14} /> 영상
            </>
          ) : (
            <>
              <FileImage size={14} /> 이미지
            </>
          )}
        </span>
      ),
    },
    {
      key: 'tags',
      header: '태그',
      render: (item) => (
        <div style={{ display: 'flex', gap: '0.25rem', flexWrap: 'wrap' }}>
          {item.tags.slice(0, 3).map((tag) => (
            <span key={tag} className={styles.badge}>
              {tag}
            </span>
          ))}
          {item.tags.length > 3 && (
            <span className={styles.badge}>+{item.tags.length - 3}</span>
          )}
        </div>
      ),
    },
  ]

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <ImageIcon size={24} className={styles.headerIcon} />
          <div>
            <h1 className={styles.title}>시그니처 관리</h1>
            <p className={styles.subtitle}>시그 영상/이미지 관리</p>
          </div>
        </div>
        <button onClick={handleAdd} className={styles.addButton}>
          <Plus size={18} />
          시그 추가
        </button>
      </header>

      {/* Unit Tabs */}
      <div className={styles.typeSelector}>
        <button
          onClick={() => setActiveUnit('excel')}
          className={`${styles.typeButton} ${activeUnit === 'excel' ? styles.active : ''}`}
        >
          엑셀부
        </button>
        <button
          onClick={() => setActiveUnit('crew')}
          className={`${styles.typeButton} ${activeUnit === 'crew' ? styles.active : ''}`}
        >
          크루부
        </button>
      </div>

      <DataTable
        data={filteredSignatures}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="시그 제목으로 검색..."
        isLoading={isLoading}
      />

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && editingSignature && (
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
                <h2>{isNew ? '시그 추가' : '시그 수정'}</h2>
                <button onClick={() => setIsModalOpen(false)} className={styles.closeButton}>
                  <X size={20} />
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>제목</label>
                  <input
                    type="text"
                    value={editingSignature.title}
                    onChange={(e) =>
                      setEditingSignature({ ...editingSignature, title: e.target.value })
                    }
                    className={styles.input}
                    placeholder="시그 제목을 입력하세요"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>미디어 유형</label>
                  <div className={styles.typeSelector}>
                    <button
                      type="button"
                      onClick={() => setEditingSignature({ ...editingSignature, mediaType: 'video' })}
                      className={`${styles.typeButton} ${editingSignature.mediaType === 'video' ? styles.active : ''}`}
                    >
                      <Video size={16} /> 영상
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingSignature({ ...editingSignature, mediaType: 'image' })}
                      className={`${styles.typeButton} ${editingSignature.mediaType === 'image' ? styles.active : ''}`}
                    >
                      <FileImage size={16} /> 이미지
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>부서</label>
                  <div className={styles.typeSelector}>
                    <button
                      type="button"
                      onClick={() => setEditingSignature({ ...editingSignature, unit: 'excel' })}
                      className={`${styles.typeButton} ${editingSignature.unit === 'excel' ? styles.active : ''}`}
                    >
                      엑셀부
                    </button>
                    <button
                      type="button"
                      onClick={() => setEditingSignature({ ...editingSignature, unit: 'crew' })}
                      className={`${styles.typeButton} ${editingSignature.unit === 'crew' ? styles.active : ''}`}
                    >
                      크루부
                    </button>
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>미디어 URL</label>
                  <input
                    type="text"
                    value={editingSignature.mediaUrl}
                    onChange={(e) =>
                      setEditingSignature({ ...editingSignature, mediaUrl: e.target.value })
                    }
                    className={styles.input}
                    placeholder="https://..."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>썸네일 URL (선택)</label>
                  <input
                    type="text"
                    value={editingSignature.thumbnailUrl}
                    onChange={(e) =>
                      setEditingSignature({ ...editingSignature, thumbnailUrl: e.target.value })
                    }
                    className={styles.input}
                    placeholder="https://..."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>태그 (쉼표로 구분)</label>
                  <input
                    type="text"
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    className={styles.input}
                    placeholder="태그1, 태그2, 태그3..."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>설명 (선택)</label>
                  <textarea
                    value={editingSignature.description}
                    onChange={(e) =>
                      setEditingSignature({ ...editingSignature, description: e.target.value })
                    }
                    className={styles.textarea}
                    placeholder="시그에 대한 설명..."
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
