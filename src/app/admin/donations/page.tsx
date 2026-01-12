'use client'

import { useState } from 'react'
import { Heart, Plus, Upload, List } from 'lucide-react'
import { DataTable, Column, CsvUploader, DonationModal } from '@/components/admin'
import { useDonationsData, type DonationItem } from '@/lib/hooks'
import { formatAmount } from '@/lib/utils/format'
import styles from '../shared.module.css'

type ViewMode = 'list' | 'upload'

export default function DonationsPage() {
  const {
    donations,
    seasons,
    profiles,
    isLoading,
    addDonation,
    updateDonation,
    deleteDonation,
    uploadCsv,
  } = useDonationsData()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingDonation, setEditingDonation] = useState<Partial<DonationItem> | null>(null)
  const [isNew, setIsNew] = useState(false)
  const [viewMode, setViewMode] = useState<ViewMode>('list')

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

  const handleEdit = (donation: DonationItem) => {
    setEditingDonation(donation)
    setIsNew(false)
    setIsModalOpen(true)
  }

  const handleDelete = async (donation: DonationItem) => {
    if (!confirm('정말 삭제하시겠습니까?')) return
    const success = await deleteDonation(donation.id)
    if (!success) {
      alert('삭제에 실패했습니다.')
    }
  }

  const handleSave = async () => {
    if (!editingDonation || !editingDonation.donorId || !editingDonation.amount) {
      alert('후원자와 금액을 입력해주세요.')
      return
    }

    const success = isNew
      ? await addDonation(editingDonation)
      : await updateDonation(editingDonation)

    if (success) {
      setIsModalOpen(false)
    } else {
      alert(isNew ? '등록에 실패했습니다.' : '수정에 실패했습니다.')
    }
  }

  const formatHeart = (amount: number) => formatAmount(amount, '하트')

  const formatShortDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const csvColumns = [
    { key: 'ID', label: '후원자ID', required: true },
    { key: '하트', label: '하트', required: true },
    { key: '일시', label: '일시', required: false },
    { key: '내용', label: '내용', required: false },
  ]

  const columns: Column<DonationItem>[] = [
    { key: 'donorName', header: '후원자', width: '150px' },
    {
      key: 'amount',
      header: '금액',
      width: '120px',
      render: (item) => (
        <span className={styles.amountCell}>{formatHeart(item.amount)}</span>
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
      render: (item) => formatShortDate(item.createdAt),
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
            onUpload={uploadCsv}
            sampleFile="/samples/donations_sample.csv"
          />
        </div>
      )}

      <DonationModal
        isOpen={isModalOpen}
        isNew={isNew}
        donation={editingDonation}
        seasons={seasons}
        profiles={profiles}
        onChange={setEditingDonation}
        onSave={handleSave}
        onClose={() => setIsModalOpen(false)}
      />
    </div>
  )
}
