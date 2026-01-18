'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { ArrowLeft, Plus, X, Save, Video, Trash2, User } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useSupabaseContext } from '@/lib/context'
import { useAlert } from '@/lib/hooks'
import styles from '../../shared.module.css'

interface Signature {
  id: number
  sigNumber: number
  title: string
  description: string
  thumbnailUrl: string
  unit: 'excel' | 'crew'
  isGroup: boolean
}

interface OrgMember {
  id: number
  name: string
  imageUrl: string | null
  unit: 'excel' | 'crew'
}

interface SignatureVideo {
  id: number
  signatureId: number
  memberId: number
  memberName: string
  memberImage: string | null
  videoUrl: string
  createdAt: string
}

export default function SignatureDetailPage() {
  const params = useParams()
  const router = useRouter()
  const supabase = useSupabaseContext()
  const { showConfirm, showError } = useAlert()
  const signatureId = Number(params.id)

  const [signature, setSignature] = useState<Signature | null>(null)
  const [videos, setVideos] = useState<SignatureVideo[]>([])
  const [members, setMembers] = useState<OrgMember[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingVideo, setEditingVideo] = useState<Partial<SignatureVideo> | null>(null)
  const [isNew, setIsNew] = useState(false)

  // Fetch signature details
  const fetchSignature = useCallback(async () => {
    const { data, error } = await supabase
      .from('signatures')
      .select('*')
      .eq('id', signatureId)
      .single()

    if (error || !data) {
      console.error('시그 로드 실패:', error)
      return
    }

    setSignature({
      id: data.id,
      sigNumber: data.sig_number,
      title: data.title,
      description: data.description || '',
      thumbnailUrl: data.thumbnail_url || '',
      unit: data.unit,
      isGroup: data.is_group,
    })
  }, [supabase, signatureId])

  // Fetch videos for this signature
  const fetchVideos = useCallback(async () => {
    const { data, error } = await supabase
      .from('signature_videos')
      .select(`
        id,
        signature_id,
        member_id,
        video_url,
        created_at,
        organization!member_id(name, image_url)
      `)
      .eq('signature_id', signatureId)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('영상 로드 실패:', error)
      return
    }

    setVideos(
      (data || []).map((v) => {
        const org = v.organization as unknown
        const member = org as { name: string; image_url: string | null } | null
        return {
          id: v.id,
          signatureId: v.signature_id,
          memberId: v.member_id,
          memberName: member?.name || '알 수 없음',
          memberImage: member?.image_url || null,
          videoUrl: v.video_url,
          createdAt: v.created_at,
        }
      })
    )
  }, [supabase, signatureId])

  // Fetch organization members
  const fetchMembers = useCallback(async () => {
    if (!signature) return

    const { data, error } = await supabase
      .from('organization')
      .select('id, name, image_url, unit')
      .eq('unit', signature.unit)
      .order('position_order')

    if (error) {
      console.error('멤버 로드 실패:', error)
      return
    }

    setMembers(
      (data || []).map((m) => ({
        id: m.id,
        name: m.name,
        imageUrl: m.image_url,
        unit: m.unit,
      }))
    )
  }, [supabase, signature])

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      await fetchSignature()
      await fetchVideos()
      setIsLoading(false)
    }
    loadData()
  }, [fetchSignature, fetchVideos])

  useEffect(() => {
    if (signature) {
      fetchMembers()
    }
  }, [signature, fetchMembers])

  // Get members that don't have videos yet
  const availableMembers = members.filter(
    (m) => !videos.some((v) => v.memberId === m.id)
  )

  const openAddModal = () => {
    if (availableMembers.length === 0) {
      showError('모든 멤버에게 영상이 등록되어 있습니다.')
      return
    }
    setEditingVideo({
      memberId: availableMembers[0]?.id,
      videoUrl: '',
    })
    setIsNew(true)
    setIsModalOpen(true)
  }

  const openEditModal = (video: SignatureVideo) => {
    setEditingVideo({
      id: video.id,
      memberId: video.memberId,
      videoUrl: video.videoUrl,
    })
    setIsNew(false)
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setEditingVideo(null)
  }

  const handleSave = async () => {
    if (!editingVideo?.memberId || !editingVideo?.videoUrl) {
      showError('멤버와 영상 URL을 입력해주세요.', '입력 오류')
      return
    }

    if (isNew) {
      const { error } = await supabase.from('signature_videos').insert({
        signature_id: signatureId,
        member_id: editingVideo.memberId,
        video_url: editingVideo.videoUrl,
      })
      if (error) {
        console.error('영상 등록 실패:', error)
        if (error.code === '23505') {
          showError('이 멤버의 영상이 이미 등록되어 있습니다.')
        } else {
          showError('등록에 실패했습니다.')
        }
        return
      }
    } else {
      const { error } = await supabase
        .from('signature_videos')
        .update({ video_url: editingVideo.videoUrl })
        .eq('id', editingVideo.id!)
      if (error) {
        console.error('영상 수정 실패:', error)
        showError('수정에 실패했습니다.')
        return
      }
    }

    closeModal()
    fetchVideos()
  }

  const handleDelete = async (video: SignatureVideo) => {
    const confirmed = await showConfirm(`${video.memberName}의 영상을\n삭제하시겠습니까?`, {
      title: '영상 삭제',
      variant: 'danger',
      confirmText: '삭제',
      cancelText: '취소',
    })
    if (!confirmed) return

    const { error } = await supabase
      .from('signature_videos')
      .delete()
      .eq('id', video.id)

    if (error) {
      console.error('영상 삭제 실패:', error)
      showError('삭제에 실패했습니다.')
      return
    }

    fetchVideos()
  }

  if (isLoading) {
    return (
      <div className={styles.page}>
        <div className={styles.loading}>로딩 중...</div>
      </div>
    )
  }

  if (!signature) {
    return (
      <div className={styles.page}>
        <div className={styles.error}>시그를 찾을 수 없습니다.</div>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Link href="/admin/signatures" className={styles.backButton}>
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className={styles.title}>
              #{signature.sigNumber} {signature.title}
            </h1>
            <p className={styles.subtitle}>
              {signature.unit === 'excel' ? '엑셀부' : '크루부'} · 멤버별 영상 관리
            </p>
          </div>
        </div>
        <button onClick={openAddModal} className={styles.addButton}>
          <Plus size={18} />
          영상 추가
        </button>
      </header>

      {/* Video List */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '1rem',
        marginTop: '1.5rem',
      }}>
        {videos.length === 0 ? (
          <div style={{
            gridColumn: '1 / -1',
            padding: '3rem',
            textAlign: 'center',
            color: 'var(--text-tertiary)',
            background: 'var(--surface)',
            borderRadius: '8px',
          }}>
            등록된 영상이 없습니다. "영상 추가" 버튼을 눌러 멤버별 영상을 등록하세요.
          </div>
        ) : (
          videos.map((video) => (
            <div
              key={video.id}
              style={{
                background: 'var(--surface)',
                borderRadius: '8px',
                overflow: 'hidden',
                border: '1px solid var(--border)',
              }}
            >
              {/* Member Info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                padding: '0.75rem 1rem',
                borderBottom: '1px solid var(--border)',
              }}>
                <div style={{
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  overflow: 'hidden',
                  background: 'var(--background)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  {video.memberImage ? (
                    <Image
                      src={video.memberImage}
                      alt={video.memberName}
                      width={36}
                      height={36}
                      style={{ objectFit: 'cover' }}
                      unoptimized
                    />
                  ) : (
                    <User size={18} style={{ color: 'var(--text-tertiary)' }} />
                  )}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {video.memberName}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                    {new Date(video.createdAt).toLocaleDateString('ko-KR')}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    onClick={() => openEditModal(video)}
                    style={{
                      padding: '6px',
                      background: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    <Video size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(video)}
                    style={{
                      padding: '6px',
                      background: 'var(--background)',
                      border: '1px solid var(--border)',
                      borderRadius: '4px',
                      cursor: 'pointer',
                      color: '#ef4444',
                    }}
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>

              {/* Video Preview */}
              <div style={{
                padding: '0.75rem 1rem',
              }}>
                <div style={{
                  fontSize: '0.8125rem',
                  color: 'var(--text-secondary)',
                  wordBreak: 'break-all',
                  display: '-webkit-box',
                  WebkitLineClamp: 2,
                  WebkitBoxOrient: 'vertical',
                  overflow: 'hidden',
                }}>
                  {video.videoUrl}
                </div>
                <a
                  href={video.videoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    marginTop: '0.5rem',
                    fontSize: '0.8125rem',
                    color: 'var(--primary)',
                    textDecoration: 'none',
                  }}
                >
                  영상 보기 →
                </a>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && editingVideo && (
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
                <h2>{isNew ? '멤버 영상 추가' : '영상 URL 수정'}</h2>
                <button onClick={closeModal} className={styles.closeButton}>
                  <X size={20} />
                </button>
              </div>

              <div className={styles.modalBody}>
                {isNew && (
                  <div className={styles.formGroup}>
                    <label>멤버 선택</label>
                    <select
                      value={editingVideo.memberId || ''}
                      onChange={(e) =>
                        setEditingVideo({ ...editingVideo, memberId: Number(e.target.value) })
                      }
                      className={styles.input}
                    >
                      {availableMembers.map((m) => (
                        <option key={m.id} value={m.id}>
                          {m.name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label>
                    <Video size={14} style={{ marginRight: '4px' }} />
                    영상 URL
                  </label>
                  <input
                    type="text"
                    value={editingVideo.videoUrl || ''}
                    onChange={(e) =>
                      setEditingVideo({ ...editingVideo, videoUrl: e.target.value })
                    }
                    className={styles.input}
                    placeholder="https://..."
                  />
                  <p style={{
                    marginTop: '0.5rem',
                    fontSize: '0.8125rem',
                    color: 'var(--text-tertiary)',
                  }}>
                    YouTube, Vimeo, 또는 직접 업로드한 영상 URL을 입력하세요.
                  </p>
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
