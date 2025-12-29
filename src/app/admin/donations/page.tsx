'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Plus, X, Save, Trash2, Upload, List } from 'lucide-react'
import { DataTable, Column, CsvUploader } from '@/components/admin'
import { useSupabase } from '@/lib/hooks/useSupabase'
import styles from '../shared.module.css'

interface Donation {
  id: number
  donorId: string | null
  donorName: string
  amount: number
  message: string
  seasonId: number
  seasonName: string
  createdAt: string
}

interface Season {
  id: number
  name: string
}

interface Profile {
  id: string
  nickname: string
}

type ViewMode = 'list' | 'upload'

export default function DonationsPage() {
  const supabase = useSupabase()
  const [donations, setDonations] = useState<Donation[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDonation, setEditingDonation] = useState<Partial<Donation> | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('list')

  const fetchData = useCallback(async () => {
    setIsLoading(true)

    // 후원 목록
    const { data: donationsData } = await supabase
      .from('donations')
      .select('*, profiles!donor_id(nickname), seasons(name)')
      .order('created_at', { ascending: false })

    // 시즌 목록
    const { data: seasonsData } = await supabase
      .from('seasons')
      .select('id, name')
      .order('start_date', { ascending: false })

    // 프로필 목록
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, nickname')
      .order('nickname')

    setDonations(
      (donationsData || []).map((d) => ({
        id: d.id,
        donorId: d.donor_id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        donorName: (d.profiles as any)?.nickname || '익명',
        amount: d.amount,
        message: d.message || '',
        seasonId: d.season_id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        seasonName: (d.seasons as any)?.name || '',
        createdAt: d.created_at,
      }))
    )

    setSeasons(seasonsData || [])
    setProfiles(profilesData || [])
    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const handleAdd = () => {
    setEditingDonation({
      donorId: '',
      amount: 0,
      message: '',
      seasonId: seasons[0]?.id,
    })
    setIsNew(true)
    setIsModalOpen(true)
  }

  const handleEdit = (donation: Donation) => {
    setEditingDonation(donation)
    setIsNew(false)
    setIsModalOpen(true)
  }

  const handleDelete = async (donation: Donation) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    const { error } = await supabase.from('donations').delete().eq('id', donation.id)

    if (error) {
      console.error('후원 삭제 실패:', error)
      alert('삭제에 실패했습니다.')
    } else {
      fetchData()
    }
  }

  const handleSave = async () => {
    if (!editingDonation || !editingDonation.donorId || !editingDonation.amount) {
      alert('후원자와 금액을 입력해주세요.')
      return
    }

    if (isNew) {
      // Get donor name from profiles
      const selectedProfile = profiles.find(p => p.id === editingDonation.donorId)
      const donorName = selectedProfile?.nickname || '익명'

      const { error } = await supabase.from('donations').insert({
        donor_id: editingDonation.donorId,
        donor_name: donorName,
        amount: editingDonation.amount!,
        message: editingDonation.message,
        season_id: editingDonation.seasonId!,
      })

      if (error) {
        console.error('후원 등록 실패:', error)
        alert('등록에 실패했습니다.')
        return
      }

      // 프로필 총 후원금 업데이트
      if (editingDonation.donorId) {
        await supabase.rpc('update_donation_total', {
          p_donor_id: editingDonation.donorId,
          p_amount: editingDonation.amount!,
        })
      }
    } else {
      const { error } = await supabase
        .from('donations')
        .update({
          amount: editingDonation.amount,
          message: editingDonation.message,
          season_id: editingDonation.seasonId,
        })
        .eq('id', editingDonation.id!)

      if (error) {
        console.error('후원 수정 실패:', error)
        alert('수정에 실패했습니다.')
        return
      }
    }

    setIsModalOpen(false)
    fetchData()
  }

  const formatAmount = (amount: number) => {
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(0)}만원`
    }
    return `${amount.toLocaleString()}원`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const columns: Column<Donation>[] = [
    { key: 'donorName', header: '후원자', width: '150px' },
    {
      key: 'amount',
      header: '금액',
      width: '120px',
      render: (item) => (
        <span className={styles.amountCell}>{formatAmount(item.amount)}</span>
      ),
    },
    {
      key: 'message',
      header: '메시지',
      render: (item) => (
        <span className={styles.messageCell}>{item.message || '-'}</span>
      ),
    },
    {
      key: 'seasonName',
      header: '시즌',
      width: '120px',
      render: (item) => (
        <span className={styles.badge}>{item.seasonName || '-'}</span>
      ),
    },
    {
      key: 'createdAt',
      header: '일시',
      width: '120px',
      render: (item) => formatDate(item.createdAt),
    },
  ]

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Heart size={24} className={styles.headerIcon} />
          <div>
            <h1 className={styles.title}>후원 관리</h1>
            <p className={styles.subtitle}>후원 내역 관리</p>
          </div>
        </div>
        <button onClick={handleAdd} className={styles.addButton}>
          <Plus size={18} />
          후원 등록
        </button>
      </header>

      <DataTable
        data={donations}
        columns={columns}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="후원자 이름으로 검색..."
        isLoading={isLoading}
      />

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && editingDonation && (
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
                <h2>{isNew ? '후원 등록' : '후원 수정'}</h2>
                <button onClick={() => setIsModalOpen(false)} className={styles.closeButton}>
                  <X size={20} />
                </button>
              </div>

              <div className={styles.modalBody}>
                {isNew && (
                  <div className={styles.formGroup}>
                    <label>후원자</label>
                    <select
                      value={editingDonation.donorId || ''}
                      onChange={(e) =>
                        setEditingDonation({ ...editingDonation, donorId: e.target.value || null })
                      }
                      className={styles.select}
                    >
                      <option value="">선택하세요</option>
                      {profiles.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.nickname}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                <div className={styles.formGroup}>
                  <label>금액 (원)</label>
                  <input
                    type="number"
                    value={editingDonation.amount}
                    onChange={(e) =>
                      setEditingDonation({
                        ...editingDonation,
                        amount: parseInt(e.target.value) || 0,
                      })
                    }
                    className={styles.input}
                    placeholder="10000"
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>시즌</label>
                  <select
                    value={editingDonation.seasonId}
                    onChange={(e) =>
                      setEditingDonation({
                        ...editingDonation,
                        seasonId: parseInt(e.target.value),
                      })
                    }
                    className={styles.select}
                  >
                    {seasons.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>메시지 (선택)</label>
                  <textarea
                    value={editingDonation.message}
                    onChange={(e) =>
                      setEditingDonation({ ...editingDonation, message: e.target.value })
                    }
                    className={styles.textarea}
                    placeholder="후원 메시지를 입력하세요..."
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
                  {isNew ? '등록' : '저장'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
