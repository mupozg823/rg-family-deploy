'use client'

import { useState, useEffect } from 'react'
import { Building, Plus, GripVertical } from 'lucide-react'
import { DataTable, Column, AdminModal } from '@/components/admin'
import { useAdminCRUD } from '@/lib/hooks'
import { useProfiles } from '@/lib/context'
import styles from '../shared.module.css'

interface MemberProfile {
  nickname?: string
  mbti?: string
  age?: number
  height?: number
  weight?: number
  birthday?: string
  bloodType?: string
  hobby?: string
  specialty?: string
  favoriteFood?: string
  introduction?: string
}

interface OrgMember {
  id: number
  profileId: string | null
  name: string
  unit: 'excel' | 'crew'
  role: string
  positionOrder: number
  parentId: number | null
  memberProfile: MemberProfile | null
}

interface Profile {
  id: string
  nickname: string
}

export default function OrganizationPage() {
  const profilesRepo = useProfiles()
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [activeUnit, setActiveUnit] = useState<'excel' | 'crew'>('excel')

  // Fetch profiles for linking
  useEffect(() => {
    const fetchProfiles = async () => {
      const data = await profilesRepo.findAll()
      setProfiles(
        (data || [])
          .map((profile) => ({ id: profile.id, nickname: profile.nickname }))
          .sort((a, b) => a.nickname.localeCompare(b.nickname, 'ko-KR'))
      )
    }
    void fetchProfiles()
  }, [profilesRepo])

  const {
    items: members,
    isLoading,
    isModalOpen,
    isNew,
    editingItem: editingMember,
    setEditingItem: setEditingMember,
    openAddModal: baseOpenAddModal,
    openEditModal,
    closeModal,
    handleSave,
    handleDelete,
  } = useAdminCRUD<OrgMember>({
    tableName: 'organization',
    defaultItem: {
      profileId: null,
      name: '',
      unit: activeUnit,
      role: '',
      positionOrder: 0,
      parentId: null,
      memberProfile: null,
    },
    orderBy: { column: 'position_order', ascending: true },
    fromDbFormat: (row) => {
      let memberProfile: MemberProfile | null = null
      if (row.member_profile) {
        if (typeof row.member_profile === 'string') {
          try {
            memberProfile = JSON.parse(row.member_profile)
          } catch {
            memberProfile = null
          }
        } else if (typeof row.member_profile === 'object') {
          memberProfile = row.member_profile as MemberProfile
        }
      }
      return {
        id: row.id as number,
        profileId: row.profile_id as string | null,
        name: row.name as string,
        unit: row.unit as 'excel' | 'crew',
        role: row.role as string,
        positionOrder: row.position_order as number,
        parentId: row.parent_id as number | null,
        memberProfile,
      }
    },
    toDbFormat: (item) => ({
      name: item.name,
      role: item.role,
      unit: item.unit,
      profile_id: item.profileId,
      parent_id: item.parentId,
      position_order: item.positionOrder,
      member_profile: item.memberProfile,
    }),
    validate: (item) => {
      if (!item.name || !item.role) return '이름과 직책을 입력해주세요.'
      return null
    },
  })

  const filteredMembers = members.filter((m) => m.unit === activeUnit)

  const openAddModal = () => {
    baseOpenAddModal()
    // Override unit with current activeUnit
    setEditingMember((prev) => prev ? { ...prev, unit: activeUnit, positionOrder: filteredMembers.length } : null)
  }

  const columns: Column<OrgMember>[] = [
    {
      key: 'positionOrder',
      header: '순서',
      width: '80px',
      render: (item) => (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <GripVertical size={16} style={{ color: 'var(--color-text-secondary)' }} />
          {item.positionOrder + 1}
        </div>
      ),
    },
    { key: 'name', header: '이름', width: '150px' },
    { key: 'role', header: '직책' },
  ]

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Building size={24} className={styles.headerIcon} />
          <div>
            <h1 className={styles.title}>조직도 관리</h1>
            <p className={styles.subtitle}>RG 패밀리 조직도</p>
          </div>
        </div>
        <button onClick={openAddModal} className={styles.addButton}>
          <Plus size={18} />
          멤버 추가
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
        data={filteredMembers}
        columns={columns}
        onEdit={openEditModal}
        onDelete={handleDelete}
        searchPlaceholder="이름으로 검색..."
        isLoading={isLoading}
      />

      {/* Modal */}
      {editingMember && (
        <AdminModal
          isOpen={isModalOpen}
          title={isNew ? '멤버 추가' : '멤버 수정'}
          onClose={closeModal}
          onSave={handleSave}
          saveLabel={isNew ? '추가' : '저장'}
        >
          <div className={styles.formGroup}>
            <label>이름 *</label>
            <input
              type="text"
              value={editingMember.name || ''}
              onChange={(e) =>
                setEditingMember({ ...editingMember, name: e.target.value })
              }
              className={styles.input}
              placeholder="멤버 이름"
            />
          </div>

          <div className={styles.formGroup}>
            <label>직책 *</label>
            <input
              type="text"
              value={editingMember.role || ''}
              onChange={(e) =>
                setEditingMember({ ...editingMember, role: e.target.value })
              }
              className={styles.input}
              placeholder="예: PRESIDENT, DIRECTOR, MEMBER..."
            />
          </div>

          <div className={styles.formGroup}>
            <label>부서</label>
            <div className={styles.typeSelector}>
              <button
                type="button"
                onClick={() => setEditingMember({ ...editingMember, unit: 'excel' })}
                className={`${styles.typeButton} ${editingMember.unit === 'excel' ? styles.active : ''}`}
              >
                엑셀부
              </button>
              <button
                type="button"
                onClick={() => setEditingMember({ ...editingMember, unit: 'crew' })}
                className={`${styles.typeButton} ${editingMember.unit === 'crew' ? styles.active : ''}`}
              >
                크루부
              </button>
            </div>
          </div>

          <div className={styles.formGroup}>
            <label>연결된 회원 (선택)</label>
            <select
              value={editingMember.profileId || ''}
              onChange={(e) =>
                setEditingMember({ ...editingMember, profileId: e.target.value || null })
              }
              className={styles.select}
            >
              <option value="">연결 안함</option>
              {profiles.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nickname}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>순서</label>
            <input
              type="number"
              value={editingMember.positionOrder ?? 0}
              onChange={(e) =>
                setEditingMember({
                  ...editingMember,
                  positionOrder: parseInt(e.target.value) || 0,
                })
              }
              className={styles.input}
              min={0}
            />
          </div>

          {/* 개인정보 섹션 */}
          <div className={styles.formSection}>
            <h3 className={styles.formSectionTitle}>개인정보</h3>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>별명</label>
                <input
                  type="text"
                  value={editingMember.memberProfile?.nickname || ''}
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      memberProfile: {
                        ...editingMember.memberProfile,
                        nickname: e.target.value || undefined,
                      },
                    })
                  }
                  className={styles.input}
                  placeholder="예: 린린"
                />
              </div>

              <div className={styles.formGroup}>
                <label>MBTI</label>
                <select
                  value={editingMember.memberProfile?.mbti || ''}
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      memberProfile: {
                        ...editingMember.memberProfile,
                        mbti: e.target.value || undefined,
                      },
                    })
                  }
                  className={styles.select}
                >
                  <option value="">선택</option>
                  {['ISTJ', 'ISFJ', 'INFJ', 'INTJ', 'ISTP', 'ISFP', 'INFP', 'INTP',
                    'ESTP', 'ESFP', 'ENFP', 'ENTP', 'ESTJ', 'ESFJ', 'ENFJ', 'ENTJ'].map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>나이</label>
                <input
                  type="number"
                  value={editingMember.memberProfile?.age || ''}
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      memberProfile: {
                        ...editingMember.memberProfile,
                        age: e.target.value ? parseInt(e.target.value) : undefined,
                      },
                    })
                  }
                  className={styles.input}
                  placeholder="예: 26"
                  min={0}
                  max={100}
                />
              </div>

              <div className={styles.formGroup}>
                <label>키 (cm)</label>
                <input
                  type="number"
                  value={editingMember.memberProfile?.height || ''}
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      memberProfile: {
                        ...editingMember.memberProfile,
                        height: e.target.value ? parseInt(e.target.value) : undefined,
                      },
                    })
                  }
                  className={styles.input}
                  placeholder="예: 165"
                  min={100}
                  max={250}
                />
              </div>

              <div className={styles.formGroup}>
                <label>몸무게 (kg)</label>
                <input
                  type="number"
                  value={editingMember.memberProfile?.weight || ''}
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      memberProfile: {
                        ...editingMember.memberProfile,
                        weight: e.target.value ? parseInt(e.target.value) : undefined,
                      },
                    })
                  }
                  className={styles.input}
                  placeholder="예: 50"
                  min={30}
                  max={150}
                />
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>생일</label>
                <input
                  type="text"
                  value={editingMember.memberProfile?.birthday || ''}
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      memberProfile: {
                        ...editingMember.memberProfile,
                        birthday: e.target.value || undefined,
                      },
                    })
                  }
                  className={styles.input}
                  placeholder="예: 03-15"
                />
              </div>

              <div className={styles.formGroup}>
                <label>혈액형</label>
                <select
                  value={editingMember.memberProfile?.bloodType || ''}
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      memberProfile: {
                        ...editingMember.memberProfile,
                        bloodType: e.target.value || undefined,
                      },
                    })
                  }
                  className={styles.select}
                >
                  <option value="">선택</option>
                  <option value="A">A형</option>
                  <option value="B">B형</option>
                  <option value="AB">AB형</option>
                  <option value="O">O형</option>
                </select>
              </div>
            </div>

            <div className={styles.formRow}>
              <div className={styles.formGroup}>
                <label>취미</label>
                <input
                  type="text"
                  value={editingMember.memberProfile?.hobby || ''}
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      memberProfile: {
                        ...editingMember.memberProfile,
                        hobby: e.target.value || undefined,
                      },
                    })
                  }
                  className={styles.input}
                  placeholder="예: 노래, 댄스"
                />
              </div>

              <div className={styles.formGroup}>
                <label>특기</label>
                <input
                  type="text"
                  value={editingMember.memberProfile?.specialty || ''}
                  onChange={(e) =>
                    setEditingMember({
                      ...editingMember,
                      memberProfile: {
                        ...editingMember.memberProfile,
                        specialty: e.target.value || undefined,
                      },
                    })
                  }
                  className={styles.input}
                  placeholder="예: 랩"
                />
              </div>
            </div>

            <div className={styles.formGroup}>
              <label>좋아하는 음식</label>
              <input
                type="text"
                value={editingMember.memberProfile?.favoriteFood || ''}
                onChange={(e) =>
                  setEditingMember({
                    ...editingMember,
                    memberProfile: {
                      ...editingMember.memberProfile,
                      favoriteFood: e.target.value || undefined,
                    },
                  })
                }
                className={styles.input}
                placeholder="예: 떡볶이"
              />
            </div>

            <div className={styles.formGroup}>
              <label>자기소개</label>
              <textarea
                value={editingMember.memberProfile?.introduction || ''}
                onChange={(e) =>
                  setEditingMember({
                    ...editingMember,
                    memberProfile: {
                      ...editingMember.memberProfile,
                      introduction: e.target.value || undefined,
                    },
                  })
                }
                className={styles.textarea}
                placeholder="자기소개를 입력해주세요"
                rows={3}
              />
            </div>
          </div>
        </AdminModal>
      )}
    </div>
  )
}
