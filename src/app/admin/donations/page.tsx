'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, Plus, X, Save, Upload, List } from 'lucide-react'
import { DataTable, Column, CsvUploader } from '@/components/admin'
import { useSupabase } from '@/lib/hooks/useSupabase'
import type { JoinedProfile, JoinedSeason } from '@/types/common'
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
      (donationsData || []).map((d) => {
        const profile = d.profiles as JoinedProfile | null
        const season = d.seasons as JoinedSeason | null
        return {
          id: d.id,
          donorId: d.donor_id,
          donorName: profile?.nickname || '익명',
          amount: d.amount,
          message: d.message || '',
          seasonId: d.season_id,
          seasonName: season?.name || '',
          createdAt: d.created_at,
        }
      })
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

  // CSV 업로드 핸들러 (팬더티비 알림내역 형식 지원)
  // 팬더티비 CSV 컬럼: 종류, 일시, 닉네임(스트리머), ID(후원자), 하트, 팬랭킹순위, 팬등급, 내용, 알림음, 알림텍스트, 상태
  const handleCsvUpload = async (
    data: { [key: string]: string }[]
  ): Promise<{ success: number; errors: string[] }> => {
    const errors: string[] = []
    let successCount = 0

    // 현재 활성 시즌 가져오기
    const activeSeason = seasons[0]
    if (!activeSeason) {
      return { success: 0, errors: ['활성 시즌이 없습니다. 먼저 시즌을 생성해주세요.'] }
    }

    for (let i = 0; i < data.length; i++) {
      const row = data[i]
      const rowNum = i + 2 // CSV 헤더 + 0-based index

      // 팬더티비 형식 또는 기본 형식 지원
      const donorId = row['ID'] || row['donor_id'] || row['id'] || ''
      const donorName = donorId || row['donor_name'] || ''
      const amountStr = row['하트'] || row['amount'] || row['hearts'] || '0'
      const message = row['내용'] || row['message'] || ''
      const dateStr = row['일시'] || row['date'] || ''

      // 필수 필드 검증
      if (!donorName) {
        errors.push(`행 ${rowNum}: 후원자 ID/이름이 필요합니다.`)
        continue
      }

      const amount = parseInt(amountStr.replace(/,/g, ''), 10)
      if (isNaN(amount) || amount <= 0) {
        errors.push(`행 ${rowNum}: 유효하지 않은 하트 수입니다.`)
        continue
      }

      // 시즌 ID 결정
      let seasonId = activeSeason.id
      if (row.season_id) {
        const parsedSeasonId = parseInt(row.season_id, 10)
        if (!isNaN(parsedSeasonId) && seasons.some(s => s.id === parsedSeasonId)) {
          seasonId = parsedSeasonId
        }
      }

      // 후원자 프로필 찾기 (닉네임으로)
      const matchedProfile = profiles.find(
        p => p.nickname.toLowerCase() === donorName.toLowerCase()
      )

      // 날짜 파싱 (팬더티비 형식: 25.12.29 05:16:29)
      let createdAt = new Date().toISOString()
      if (dateStr) {
        try {
          const [datePart, timePart] = dateStr.split(' ')
          const [yy, mm, dd] = datePart.split('.')
          const year = parseInt(yy, 10) + 2000 // 25 -> 2025
          createdAt = new Date(`${year}-${mm}-${dd}T${timePart}Z`).toISOString()
        } catch {
          // 파싱 실패 시 현재 시간 사용
        }
      }

      try {
        const { error } = await supabase.from('donations').insert({
          donor_id: matchedProfile?.id || null,
          donor_name: donorName,
          amount: amount,
          message: message || null,
          season_id: seasonId,
          created_at: createdAt,
        })

        if (error) {
          errors.push(`행 ${rowNum}: ${error.message}`)
        } else {
          successCount++

          // 매칭된 프로필이 있으면 총 후원금 업데이트
          if (matchedProfile) {
            await supabase.rpc('update_donation_total', {
              p_donor_id: matchedProfile.id,
              p_amount: amount,
            })
          }
        }
      } catch {
        errors.push(`행 ${rowNum}: 데이터베이스 오류`)
      }
    }

    // 성공 시 데이터 새로고침
    if (successCount > 0) {
      fetchData()
    }

    return { success: successCount, errors }
  }

  // CSV 업로드 컬럼 정의 (팬더티비 형식 우선)
  const csvColumns = [
    { key: 'ID', label: '후원자ID', required: true },
    { key: '하트', label: '하트', required: true },
    { key: '일시', label: '일시', required: false },
    { key: '내용', label: '내용', required: false },
  ]

  const formatAmount = (amount: number) => {
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(1)}만 하트`
    }
    return `${amount.toLocaleString()} 하트`
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
        <div className={styles.headerActions}>
          <div className={styles.tabButtons}>
            <button
              onClick={() => setViewMode('list')}
              className={`${styles.tabButton} ${viewMode === 'list' ? styles.active : ''}`}
            >
              <List size={16} />
              목록
            </button>
            <button
              onClick={() => setViewMode('upload')}
              className={`${styles.tabButton} ${viewMode === 'upload' ? styles.active : ''}`}
            >
              <Upload size={16} />
              CSV 업로드
            </button>
          </div>
          {viewMode === 'list' && (
            <button onClick={handleAdd} className={styles.addButton}>
              <Plus size={18} />
              후원 등록
            </button>
          )}
        </div>
      </header>

      {viewMode === 'list' ? (
        <DataTable
          data={donations}
          columns={columns}
          onEdit={handleEdit}
          onDelete={handleDelete}
          searchPlaceholder="후원자 이름으로 검색..."
          isLoading={isLoading}
        />
      ) : (
        <div className={styles.uploadSection}>
          <div className={styles.uploadInfo}>
            <h3>CSV 파일로 대량 등록</h3>
            <p>아래 형식의 CSV 파일을 업로드하여 여러 후원 내역을 한 번에 등록할 수 있습니다.</p>
            <p className={styles.hint}>
              * 후원자명이 등록된 회원 닉네임과 일치하면 자동으로 연결됩니다.
            </p>
          </div>
          <CsvUploader
            columns={csvColumns}
            onUpload={handleCsvUpload}
            sampleFile="/samples/donations_sample.csv"
          />
        </div>
      )}

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
