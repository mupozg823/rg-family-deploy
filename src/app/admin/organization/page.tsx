'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Building, Plus, X, Save, GripVertical } from 'lucide-react'
import { DataTable, Column } from '@/components/admin'
import { useSupabaseContext } from '@/lib/context'
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
  const supabase = useSupabaseContext()
  const [members, setMembers] = useState<OrgMember[]>([])
  const [profiles, setProfiles] = useState<Profile[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingMember, setEditingMember] = useState<Partial<OrgMember> | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [activeUnit, setActiveUnit] = useState<'excel' | 'crew'>('excel')

  const fetchData = useCallback(async () => {
    setIsLoading(true)

    const { data: orgData } = await supabase
      .from('organization')
      .select('*, profiles(nickname)')
      .order('position_order')

    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, nickname')
      .order('nickname')

    setMembers(
      (orgData || []).map((m) => ({
        id: m.id,
        profileId: m.profile_id,
        name: m.name,
        unit: m.unit,
        role: m.role,
        positionOrder: m.position_order,
        parentId: m.parent_id,
      }))
    )

    setProfiles(profilesData || [])
    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const filteredMembers = members.filter((m) => m.unit === activeUnit)

  const handleAdd = () => {
    setEditingMember({
      profileId: null,
      name: '',
      unit: activeUnit,
      role: '',
      positionOrder: filteredMembers.length,
      parentId: null,
    })
    setIsNew(true)
    setIsModalOpen(true)
  }

  const handleEdit = (member: OrgMember) => {
    setEditingMember(member)
    setIsNew(false)
    setIsModalOpen(true)
  }

  const handleDelete = async (member: OrgMember) => {
    if (!confirm('정말 삭제하시겠습니까?')) return

    const { error } = await supabase.from('organization').delete().eq('id', member.id)

    if (error) {
      console.error('조직도 삭제 실패:', error)
      alert('삭제에 실패했습니다.')
    } else {
      fetchData()
    }
  }

  const handleSave = async () => {
    if (!editingMember || !editingMember.name || !editingMember.role) {
      alert('이름과 직책을 입력해주세요.')
      return
    }

    if (isNew) {
      const { error } = await supabase.from('organization').insert({
        name: editingMember.name,
        role: editingMember.role,
        unit: editingMember.unit!,
        profile_id: editingMember.profileId,
        parent_id: editingMember.parentId,
        position_order: editingMember.positionOrder,
      })

      if (error) {
        console.error('조직도 등록 실패:', error)
        alert('등록에 실패했습니다.')
        return
      }
    } else {
      const { error } = await supabase
        .from('organization')
        .update({
          name: editingMember.name,
          role: editingMember.role,
          unit: editingMember.unit,
          profile_id: editingMember.profileId,
          parent_id: editingMember.parentId,
          position_order: editingMember.positionOrder,
        })
        .eq('id', editingMember.id!)

      if (error) {
        console.error('조직도 수정 실패:', error)
        alert('수정에 실패했습니다.')
        return
      }
    }

    setIsModalOpen(false)
    fetchData()
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
        <button onClick={handleAdd} className={styles.addButton}>
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
        onEdit={handleEdit}
        onDelete={handleDelete}
        searchPlaceholder="이름으로 검색..."
        isLoading={isLoading}
      />

      {/* Modal */}
      <AnimatePresence>
        {isModalOpen && editingMember && (
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
                <h2>{isNew ? '멤버 추가' : '멤버 수정'}</h2>
                <button onClick={() => setIsModalOpen(false)} className={styles.closeButton}>
                  <X size={20} />
                </button>
              </div>

              <div className={styles.modalBody}>
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
                    value={editingMember.positionOrder}
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
