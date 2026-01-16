'use client'

import { useState } from 'react'
import {
  Image as ImageIcon,
  Plus,
  Eye,
  EyeOff,
  GripVertical,
  Link as LinkIcon,
  Trash2,
} from 'lucide-react'
import Image from 'next/image'
import { DataTable, Column, AdminModal } from '@/components/admin'
import { useAdminCRUD } from '@/lib/hooks'
import { useBanners } from '@/lib/context'
import styles from '../shared.module.css'
import bannerStyles from './page.module.css'

interface Banner {
  id: number
  title: string
  imageUrl: string
  linkUrl: string | null
  displayOrder: number
  isActive: boolean
  createdAt: string
}

export default function BannersPage() {
  const bannersRepo = useBanners()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const {
    items: banners,
    isLoading,
    isModalOpen,
    isNew,
    editingItem: editingBanner,
    setEditingItem: setEditingBanner,
    openAddModal: baseOpenAddModal,
    openEditModal: baseOpenEditModal,
    closeModal: baseCloseModal,
    handleSave,
    handleDelete,
    refetch,
  } = useAdminCRUD<Banner>({
    tableName: 'banners',
    defaultItem: {
      title: '',
      imageUrl: '',
      linkUrl: '',
      displayOrder: 0,
      isActive: true,
    },
    orderBy: { column: 'display_order', ascending: true },
    fromDbFormat: (row) => ({
      id: row.id as number,
      title: (row.title as string) || '',
      imageUrl: row.image_url as string,
      linkUrl: row.link_url as string | null,
      displayOrder: row.display_order as number,
      isActive: row.is_active as boolean,
      createdAt: row.created_at as string,
    }),
    toDbFormat: (item) => ({
      title: item.title || null,
      image_url: item.imageUrl,
      link_url: item.linkUrl || null,
      display_order: item.displayOrder,
      is_active: item.isActive ?? true,
    }),
    validate: (item) => {
      if (!item.imageUrl) return '이미지 URL을 입력해주세요.'
      return null
    },
  })

  // 배너 추가 - displayOrder 자동 계산
  const handleAdd = () => {
    const maxOrder = Math.max(0, ...banners.map(b => b.displayOrder))
    baseOpenAddModal()
    setEditingBanner(prev => prev ? { ...prev, displayOrder: maxOrder + 1 } : null)
    setPreviewUrl(null)
  }

  // 배너 수정 - 이미지 미리보기 설정
  const handleEdit = (banner: Banner) => {
    baseOpenEditModal(banner)
    setPreviewUrl(banner.imageUrl)
  }

  // 모달 닫기 - 미리보기 초기화
  const closeModal = () => {
    baseCloseModal()
    setPreviewUrl(null)
  }

  // 활성화 토글 (useAdminCRUD 외부 기능)
  const handleToggleActive = async (banner: Banner) => {
    const ok = await bannersRepo.toggleActive(banner.id)
    if (!ok) {
      alert('상태 변경에 실패했습니다.')
    } else {
      refetch()
    }
  }

  // 이미지 URL 변경 + 미리보기 동기화
  const handleImageUrlChange = (url: string) => {
    setEditingBanner(prev => prev ? { ...prev, imageUrl: url } : null)
    setPreviewUrl(url)
  }

  const columns: Column<Banner>[] = [
    {
      key: 'displayOrder',
      header: '순서',
      width: '60px',
      render: (banner) => (
        <div className={bannerStyles.orderCell}>
          <GripVertical size={14} />
          <span>{banner.displayOrder}</span>
        </div>
      ),
    },
    {
      key: 'imageUrl',
      header: '미리보기',
      width: '120px',
      render: (banner) => (
        <div className={bannerStyles.previewCell}>
          {banner.imageUrl ? (
            <Image
              src={banner.imageUrl}
              alt={banner.title || '배너'}
              width={100}
              height={50}
              className={bannerStyles.thumbnail}
            />
          ) : (
            <div className={bannerStyles.noImage}>
              <ImageIcon size={20} />
            </div>
          )}
        </div>
      ),
    },
    {
      key: 'title',
      header: '제목',
      render: (banner) => banner.title || '-',
    },
    {
      key: 'linkUrl',
      header: '링크',
      render: (banner) =>
        banner.linkUrl ? (
          <a
            href={banner.linkUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={bannerStyles.link}
          >
            <LinkIcon size={14} />
            <span>{banner.linkUrl.length > 30 ? `${banner.linkUrl.slice(0, 30)}...` : banner.linkUrl}</span>
          </a>
        ) : (
          '-'
        ),
    },
    {
      key: 'isActive',
      header: '상태',
      width: '80px',
      render: (banner) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleToggleActive(banner)
          }}
          className={`${bannerStyles.statusButton} ${banner.isActive ? bannerStyles.active : bannerStyles.inactive}`}
        >
          {banner.isActive ? <Eye size={14} /> : <EyeOff size={14} />}
          <span>{banner.isActive ? '활성' : '비활성'}</span>
        </button>
      ),
    },
    {
      key: 'actions',
      header: '',
      width: '50px',
      render: (banner) => (
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleDelete(banner)
          }}
          className={bannerStyles.deleteButton}
        >
          <Trash2 size={16} />
        </button>
      ),
    },
  ]

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <ImageIcon size={28} className={styles.headerIcon} />
          <div>
            <h1 className={styles.title}>배너 관리</h1>
            <p className={styles.subtitle}>메인 페이지 슬라이드 배너를 관리합니다</p>
          </div>
        </div>
        <button className={styles.addButton} onClick={handleAdd}>
          <Plus size={18} />
          <span>배너 추가</span>
        </button>
      </div>

      <DataTable
        columns={columns}
        data={banners}
        isLoading={isLoading}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Edit Modal */}
      {editingBanner && (
        <AdminModal
          isOpen={isModalOpen}
          title={isNew ? '배너 추가' : '배너 수정'}
          onClose={closeModal}
          onSave={handleSave}
          saveLabel={isNew ? '등록' : '저장'}
        >
          {/* Image Preview */}
          <div className={bannerStyles.imagePreview}>
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="배너 미리보기"
                fill
                className={bannerStyles.previewImage}
                onError={() => setPreviewUrl(null)}
              />
            ) : (
              <div className={bannerStyles.noPreview}>
                <ImageIcon size={48} />
                <span>이미지 URL을 입력하면 미리보기가 표시됩니다</span>
              </div>
            )}
          </div>

          <div className={styles.formRow}>
            <label className={styles.label}>
              이미지 URL <span className={styles.required}>*</span>
            </label>
            <input
              type="url"
              value={editingBanner.imageUrl || ''}
              onChange={(e) => handleImageUrlChange(e.target.value)}
              placeholder="https://example.com/banner.jpg"
              className={styles.input}
            />
          </div>

          <div className={styles.formRow}>
            <label className={styles.label}>제목 (선택)</label>
            <input
              type="text"
              value={editingBanner.title || ''}
              onChange={(e) =>
                setEditingBanner(prev => prev ? { ...prev, title: e.target.value } : null)
              }
              placeholder="배너 제목"
              className={styles.input}
            />
          </div>

          <div className={styles.formRow}>
            <label className={styles.label}>링크 URL (선택)</label>
            <input
              type="url"
              value={editingBanner.linkUrl || ''}
              onChange={(e) =>
                setEditingBanner(prev => prev ? { ...prev, linkUrl: e.target.value } : null)
              }
              placeholder="https://example.com"
              className={styles.input}
            />
          </div>

          <div className={styles.formRow}>
            <label className={styles.label}>표시 순서</label>
            <input
              type="number"
              value={editingBanner.displayOrder || 0}
              onChange={(e) =>
                setEditingBanner(prev => prev ? {
                  ...prev,
                  displayOrder: parseInt(e.target.value) || 0,
                } : null)
              }
              min="0"
              className={styles.input}
              style={{ width: '100px' }}
            />
          </div>

          <div className={styles.formRow}>
            <label className={styles.checkboxLabel}>
              <input
                type="checkbox"
                checked={editingBanner.isActive ?? true}
                onChange={(e) =>
                  setEditingBanner(prev => prev ? {
                    ...prev,
                    isActive: e.target.checked,
                  } : null)
                }
                className={styles.checkbox}
              />
              <span>활성화</span>
            </label>
          </div>
        </AdminModal>
      )}
    </div>
  )
}
