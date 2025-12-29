'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Crown, Plus, X, Save } from 'lucide-react'
import { DataTable, Column } from '@/components/admin'
import { useSupabase } from '@/lib/hooks/useSupabase'
import styles from '../shared.module.css'

interface VipReward {
  id: number
  profileId: string
  nickname: string
  seasonId: number
  seasonName: string
  rank: number
  personalMessage: string
  dedicationVideoUrl: string
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

export default function VipRewardsPage() {
  const supabase = useSupabase()
  const [rewards, setRewards] = useState<VipReward[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingReward, setEditingReward] = useState<Partial<VipReward> | null>(null)
  const [isNew, setIsNew] = useState(false)

  const fetchData = useCallback(async () => {
    setIsLoading(true)

    const { data: rewardsData } = await supabase
      .from('vip_rewards')
      .select('*, profiles(nickname), seasons(name)')
      .order('created_at', { ascending: false })

    const { data: seasonsData } = await supabase
      .from('seasons')
      .select('id, name')
      .order('start_date', { ascending: false })

    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, nickname')
      .order('total_donation', { ascending: false })
      .limit(50)

    setRewards(
      (rewardsData || []).map((r) => ({
        id: r.id,
        profileId: r.profile_id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        nickname: (r.profiles as any)?.nickname || '',
        seasonId: r.season_id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        seasonName: (r.seasons as any)?.name || '',
        rank: r.rank,
        personalMessage: r.personal_message || '',
        dedicationVideoUrl: r.dedication_video_url || '',
        createdAt: r.created_at,
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
    setEditingReward({
      profileId: '',
      seasonId: seasons[0]?.id,
      rank: 1,
      personalMessage: '',
      dedicationVideoUrl: '',
    })
    setIsNew(true)
    setIsModalOpen(true)
  }

  const handleEdit = (reward: VipReward) => {
    setEditingReward(reward)
    setIsNew(false)
    setIsModalOpen(true)
  }

  const handleDelete = async (reward: VipReward) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    const { error } = await supabase.from('vip_rewards').delete().eq('id', reward.id)

    if (error) {
      console.error('VIP 보상 삭제 실패:', error)
      alert('삭제에 실패했습니다.')
    } else {
      fetchData()
    }
  }

  const handleSave = async () => {
    if (!editingReward || !editingReward.profileId) {
      alert('VIP 회원을 선택해주세요.')
      return
    }

    if (isNew) {
      const { error } = await supabase.from('vip_rewards').insert({
        profile_id: editingReward.profileId!,
        season_id: editingReward.seasonId!,
        rank: editingReward.rank!,
        personal_message: editingReward.personalMessage,
        dedication_video_url: editingReward.dedicationVideoUrl,
      })

      if (error) {
        console.error('VIP 보상 등록 실패:', error)
        alert('등록에 실패했습니다.')
        return
      }
    } else {
      const { error } = await supabase
        .from('vip_rewards')
        .update({
          profile_id: editingReward.profileId,
          season_id: editingReward.seasonId,
          rank: editingReward.rank,
          personal_message: editingReward.personalMessage,
          dedication_video_url: editingReward.dedicationVideoUrl,
        })
        .eq('id', editingReward.id!)

      if (error) {
        console.error('VIP 보상 수정 실패:', error)
        alert('수정에 실패했습니다.')
        return
      }
    }

    setIsModalOpen(false)
    fetchData()
  }

  const handleView = (reward: VipReward) => {
    window.open(`/ranking/vip/${reward.profileId}`, '_blank')
  }

  const getRankBadge = (rank: number) => {
    if (rank === 1) return { background: 'rgba(255, 215, 0, 0.2)', color: '#ffd700' }
    if (rank === 2) return { background: 'rgba(192, 192, 192, 0.2)', color: '#c0c0c0' }
    if (rank === 3) return { background: 'rgba(205, 127, 50, 0.2)', color: '#cd7f32' }
    return { background: 'var(--color-background)', color: 'var(--color-text-secondary)' }
  }

  const columns: Column<VipReward>[] = [
    {
      key: 'rank',
      header: '순위',
      width: '80px',
      render: (item) => {
        const { background, color } = getRankBadge(item.rank)
        return (
          <span className={styles.badge} style={{ background, color, fontWeight: 700 }}>
            {item.rank}위
          </span>
        )
      },
    },
    { key: 'nickname', header: 'VIP', width: '150px' },
    { key: 'seasonName', header: '시즌', width: '150px' },
    {
      key: 'personalMessage',
      header: '개인 메시지',
      render: (item) => (
        <span className={styles.messageCell}>
          {item.personalMessage || '-'}
        </span>
      ),
    },
    {
      key: 'dedicationVideoUrl',
      header: '헌정 영상',
      width: '100px',
      render: (item) => (
        item.dedicationVideoUrl ? (
          <span className={styles.badge} style={{ background: 'rgba(34, 197, 94, 0.15)', color: '#22c55e' }}>
            등록됨
          </span>
        ) : (
          <span className={styles.badge}>미등록</span>
        )
      ),
    },
  ]

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Crown size={24} className={styles.headerIcon} />
          <div>
            <h1 className={styles.title}>VIP 보상 관리</h1>
            <p className={styles.subtitle}>VIP 개인 페이지 보상 관리</p>
          </div>
        </div>
        <button onClick={handleAdd} className={styles.addButton}>
          <Plus size={18} />
          VIP 보상 추가
        </button>
      </header>

      <DataTable
        data={rewards}
        columns={columns}
        onView={handleView}
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="VIP 이름으로 검색..."
        isLoading={isLoading}
      />

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && editingReward && (
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
                <h2>{isNew ? 'VIP 보상 추가' : 'VIP 보상 수정'}</h2>
                <button onClick={() => setIsModalOpen(false)} className={styles.closeButton}>
                  <X size={20} />
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>VIP 회원</label>
                  <select
                    value={editingReward.profileId}
                    onChange={(e) =>
                      setEditingReward({ ...editingReward, profileId: e.target.value })
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

                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>시즌</label>
                    <select
                      value={editingReward.seasonId}
                      onChange={(e) =>
                        setEditingReward({
                          ...editingReward,
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
                    <label>순위</label>
                    <input
                      type="number"
                      value={editingReward.rank}
                      onChange={(e) =>
                        setEditingReward({
                          ...editingReward,
                          rank: parseInt(e.target.value) || 1,
                        })
                      }
                      className={styles.input}
                      min={1}
                    />
                  </div>
                </div>

                <div className={styles.formGroup}>
                  <label>헌정 영상 URL (선택)</label>
                  <input
                    type="text"
                    value={editingReward.dedicationVideoUrl}
                    onChange={(e) =>
                      setEditingReward({ ...editingReward, dedicationVideoUrl: e.target.value })
                    }
                    className={styles.input}
                    placeholder="https://..."
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>개인 메시지 (선택)</label>
                  <textarea
                    value={editingReward.personalMessage}
                    onChange={(e) =>
                      setEditingReward({ ...editingReward, personalMessage: e.target.value })
                    }
                    className={styles.textarea}
                    placeholder="VIP에게 전하는 감사 메시지..."
                    rows={5}
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
