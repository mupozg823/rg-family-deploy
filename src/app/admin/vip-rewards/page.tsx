'use client'

import { useState, useEffect } from 'react'
import { Crown, Plus } from 'lucide-react'
import { DataTable, Column, AdminModal } from '@/components/admin'
import { useAdminCRUD } from '@/lib/hooks'
import { useProfiles, useSeasons } from '@/lib/context'
import type { JoinedProfile, JoinedSeason } from '@/types/common'
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
  const seasonsRepo = useSeasons()
  const profilesRepo = useProfiles()
  const [seasons, setSeasons] = useState<Season[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])

  // Fetch related data
  useEffect(() => {
    const fetchRelatedData = async () => {
      const [seasonsData, profilesData] = await Promise.all([
        seasonsRepo.findAll(),
        profilesRepo.findAll(),
      ])
      const sortedSeasons = [...seasonsData].sort((a, b) =>
        new Date(b.start_date).getTime() - new Date(a.start_date).getTime()
      )
      const sortedProfiles = [...profilesData]
        .sort((a, b) => (b.total_donation || 0) - (a.total_donation || 0))
        .slice(0, 50)
        .map((profile) => ({ id: profile.id, nickname: profile.nickname }))

      setSeasons(sortedSeasons.map((season) => ({ id: season.id, name: season.name })))
      setProfiles(sortedProfiles)
    }
    void fetchRelatedData()
  }, [profilesRepo, seasonsRepo])

  const {
    items: rewards,
    isLoading,
    isModalOpen,
    isNew,
    editingItem: editingReward,
    setEditingItem: setEditingReward,
    openAddModal: baseOpenAddModal,
    openEditModal,
    closeModal,
    handleSave,
    handleDelete,
  } = useAdminCRUD<VipReward>({
    tableName: 'vip_rewards',
    defaultItem: {
      profileId: '',
      seasonId: seasons[0]?.id || 0,
      rank: 1,
      personalMessage: '',
      dedicationVideoUrl: '',
    },
    orderBy: { column: 'created_at', ascending: false },
    fromDbFormat: (row) => {
      const profile = row.profiles as JoinedProfile | null
      const season = row.seasons as JoinedSeason | null
      return {
        id: row.id as number,
        profileId: row.profile_id as string,
        nickname: profile?.nickname || '',
        seasonId: row.season_id as number,
        seasonName: season?.name || '',
        rank: row.rank as number,
        personalMessage: (row.personal_message as string) || '',
        dedicationVideoUrl: (row.dedication_video_url as string) || '',
        createdAt: row.created_at as string,
      }
    },
    toDbFormat: (item) => ({
      profile_id: item.profileId,
      season_id: item.seasonId,
      rank: item.rank,
      personal_message: item.personalMessage,
      dedication_video_url: item.dedicationVideoUrl,
    }),
    validate: (item) => {
      if (!item.profileId) return 'VIP 회원을 선택해주세요.'
      return null
    },
  })

  const openAddModal = () => {
    baseOpenAddModal()
    setEditingReward((prev) => prev ? { ...prev, seasonId: seasons[0]?.id || 0 } : null)
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
        <button onClick={openAddModal} className={styles.addButton}>
          <Plus size={18} />
          VIP 보상 추가
        </button>
      </header>

      <DataTable
        data={rewards}
        columns={columns}
        onView={handleView}
        onEdit={openEditModal}
        onDelete={handleDelete}
        searchPlaceholder="VIP 이름으로 검색..."
        isLoading={isLoading}
      />

      {/* Modal */}
      {editingReward && (
        <AdminModal
          isOpen={isModalOpen}
          title={isNew ? 'VIP 보상 추가' : 'VIP 보상 수정'}
          onClose={closeModal}
          onSave={handleSave}
          saveLabel={isNew ? '추가' : '저장'}
        >
          <div className={styles.formGroup}>
            <label>VIP 회원</label>
            <select
              value={editingReward.profileId || ''}
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
                value={editingReward.seasonId || ''}
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
                value={editingReward.rank || 1}
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
              value={editingReward.dedicationVideoUrl || ''}
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
              value={editingReward.personalMessage || ''}
              onChange={(e) =>
                setEditingReward({ ...editingReward, personalMessage: e.target.value })
              }
              className={styles.textarea}
              placeholder="VIP에게 전하는 감사 메시지..."
              rows={5}
            />
          </div>
        </AdminModal>
      )}
    </div>
  )
}
