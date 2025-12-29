'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, X, Save } from 'lucide-react'
import { DataTable, Column } from '@/components/admin'
import { useSupabase } from '@/lib/hooks/useSupabase'
import styles from '../shared.module.css'

interface Member {
  id: string
  nickname: string
  email: string
  role: 'member' | 'vip' | 'moderator' | 'admin' | 'superadmin'
  unit: 'excel' | 'crew' | null
  totalDonation: number
  createdAt: string
}

export default function MembersPage() {
  const supabase = useSupabase()
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingMember, setEditingMember] = useState<Member | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const fetchMembers = useCallback(async () => {
    setIsLoading(true)

    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('회원 데이터 로드 실패:', error)
    } else {
      setMembers(
        (data || []).map((m) => ({
          id: m.id,
          nickname: m.nickname,
          email: m.email || '',
          role: m.role,
          unit: m.unit,
          totalDonation: m.total_donation,
          createdAt: m.created_at,
        }))
      )
    }

    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchMembers()
  }, [fetchMembers])

  const handleEdit = (member: Member) => {
    setEditingMember(member)
    setIsModalOpen(true)
  }

  const handleSave = async () => {
    if (!editingMember) return

    const { error } = await supabase
      .from('profiles')
      .update({
        nickname: editingMember.nickname,
        role: editingMember.role as 'member' | 'vip' | 'moderator' | 'admin' | 'superadmin',
        unit: editingMember.unit as 'excel' | 'crew' | null,
      })
      .eq('id', editingMember.id)

    if (error) {
      console.error('회원 수정 실패:', error)
      alert('수정에 실패했습니다.')
    } else {
      setIsModalOpen(false)
      fetchMembers()
    }
  }

  const formatAmount = (amount: number) => {
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(0)}만원`
    }
    return `${amount.toLocaleString()}원`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR')
  }

  const getRoleBadge = (role: string) => {
    const roleStyles: Record<string, string> = {
      superadmin: styles.badgeSuperadmin,
      admin: styles.badgeAdmin,
      moderator: styles.badgeModerator,
      member: styles.badgeMember,
    }
    const roleNames: Record<string, string> = {
      superadmin: '최고관리자',
      admin: '관리자',
      moderator: '운영자',
      member: '회원',
    }
    return (
      <span className={`${styles.badge} ${roleStyles[role] || ''}`}>
        {roleNames[role] || role}
      </span>
    )
  }

  const getUnitBadge = (unit: 'excel' | 'crew' | null) => {
    return (
      <span className={`${styles.badge} ${unit === 'excel' ? styles.badgeExcel : styles.badgeCrew}`}>
        {unit === 'excel' ? '엑셀부' : unit === 'crew' ? '크루부' : '-'}
      </span>
    )
  }

  const columns: Column<Member>[] = [
    { key: 'nickname', header: '닉네임', width: '150px' },
    { key: 'email', header: '이메일' },
    {
      key: 'role',
      header: '역할',
      width: '120px',
      render: (item) => getRoleBadge(item.role),
    },
    {
      key: 'unit',
      header: '부서',
      width: '100px',
      render: (item) => getUnitBadge(item.unit),
    },
    {
      key: 'totalDonation',
      header: '총 후원',
      width: '120px',
      render: (item) => (
        <span className={styles.amountCell}>{formatAmount(item.totalDonation)}</span>
      ),
    },
    {
      key: 'createdAt',
      header: '가입일',
      width: '120px',
      render: (item) => formatDate(item.createdAt),
    },
  ]

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <Users size={24} className={styles.headerIcon} />
          <div>
            <h1 className={styles.title}>회원 관리</h1>
            <p className={styles.subtitle}>RG 패밀리 회원 목록</p>
          </div>
        </div>
      </header>

      <DataTable
        data={members}
        columns={columns}
        onEdit={handleEdit}
        searchPlaceholder="닉네임 또는 이메일로 검색..."
        isLoading={isLoading}
      />

      {/* Edit Modal */}
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
                <h2>회원 수정</h2>
                <button onClick={() => setIsModalOpen(false)} className={styles.closeButton}>
                  <X size={20} />
                </button>
              </div>

              <div className={styles.modalBody}>
                <div className={styles.formGroup}>
                  <label>닉네임</label>
                  <input
                    type="text"
                    value={editingMember.nickname}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, nickname: e.target.value })
                    }
                    className={styles.input}
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>역할</label>
                  <select
                    value={editingMember.role}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, role: e.target.value as 'member' | 'vip' | 'moderator' | 'admin' | 'superadmin' })
                    }
                    className={styles.select}
                  >
                    <option value="member">회원</option>
                    <option value="vip">VIP</option>
                    <option value="moderator">운영자</option>
                    <option value="admin">관리자</option>
                    <option value="superadmin">최고관리자</option>
                  </select>
                </div>

                <div className={styles.formGroup}>
                  <label>부서</label>
                  <select
                    value={editingMember.unit || ''}
                    onChange={(e) =>
                      setEditingMember({ ...editingMember, unit: e.target.value === '' ? null : (e.target.value as 'excel' | 'crew') })
                    }
                    className={styles.select}
                  >
                    <option value="">미지정</option>
                    <option value="excel">엑셀부</option>
                    <option value="crew">크루부</option>
                  </select>
                </div>
              </div>

              <div className={styles.modalFooter}>
                <button onClick={() => setIsModalOpen(false)} className={styles.cancelButton}>
                  취소
                </button>
                <button onClick={handleSave} className={styles.saveButton}>
                  <Save size={16} />
                  저장
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
