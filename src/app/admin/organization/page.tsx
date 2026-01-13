'use client'

import { useState, useEffect } from 'react'
import { Building, Plus, GripVertical } from 'lucide-react'
import { DataTable, Column, AdminModal } from '@/components/admin'
import { useAdminCRUD } from '@/lib/hooks'
import { useProfiles } from '@/lib/context'
import styles from '../shared.module.css'

interface OrgMember {
  id: number
  profileId: string | null
  name: string
  unit: 'excel' | 'crew'
  role: string
  positionOrder: number
  parentId: number | null
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
    },
    orderBy: { column: 'position_order', ascending: true },
    fromDbFormat: (row) => ({
      id: row.id as number,
      profileId: row.profile_id as string | null,
      name: row.name as string,
      unit: row.unit as 'excel' | 'crew',
      role: row.role as string,
      positionOrder: row.position_order as number,
      parentId: row.parent_id as number | null,
    }),
    toDbFormat: (item) => ({
      name: item.name,
      role: item.role,
      unit: item.unit,
      profile_id: item.profileId,
      parent_id: item.parentId,
      position_order: item.positionOrder,
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
        </AdminModal>
      )}
    </div>
  )
}
