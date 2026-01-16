'use client'

import { useEffect, useState } from 'react'
import { MessageSquare, Eye } from 'lucide-react'
import { DataTable, Column } from '@/components/admin'
import { usePosts } from '@/lib/context'
import type { PostItem } from '@/types/content'
import styles from '../shared.module.css'

export default function PostsPage() {
  const postsRepo = usePosts()
  const [posts, setPosts] = useState<PostItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<'all' | 'free' | 'vip'>('all')
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  useEffect(() => {
    const fetchPosts = async () => {
      setIsLoading(true)

      const data = await postsRepo.findAll()
      const filtered = activeCategory === 'all'
        ? data
        : data.filter((post) => post.boardType === activeCategory)
      setPosts(filtered)

      setIsLoading(false)
    }

    void fetchPosts()
  }, [postsRepo, activeCategory, refetchTrigger])

  const handleDelete = async (post: PostItem) => {
    if (!confirm('정말 삭제하시겠습니까? 댓글도 함께 삭제됩니다.')) return

    const ok = await postsRepo.delete(post.id)
    if (!ok) {
      alert('삭제에 실패했습니다.')
      return
    }
    setRefetchTrigger((prev) => prev + 1)
  }

  const handleView = (post: PostItem) => {
    window.open(`/community/${post.boardType}/${post.id}`, '_blank')
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const columns: Column<PostItem>[] = [
    { key: 'title', header: '제목' },
    { key: 'authorName', header: '작성자', width: '120px' },
    {
      key: 'boardType',
      header: '카테고리',
      width: '100px',
      render: (item) => (
        <span className={`${styles.badge} ${item.boardType === 'vip' ? styles.badgeAdmin : ''}`}>
          {item.boardType === 'vip' ? 'VIP' : '자유'}
        </span>
      ),
    },
    {
      key: 'viewCount',
      header: '조회',
      width: '80px',
      render: (item) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <Eye size={14} /> {item.viewCount}
        </span>
      ),
    },
    {
      key: 'commentCount',
      header: '댓글',
      width: '80px',
      render: (item) => (
        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
          <MessageSquare size={14} /> {item.commentCount}
        </span>
      ),
    },
    {
      key: 'createdAt',
      header: '작성일',
      width: '120px',
      render: (item) => formatDate(item.createdAt),
    },
  ]

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.headerLeft}>
          <MessageSquare size={24} className={styles.headerIcon} />
          <div>
            <h1 className={styles.title}>게시글 관리</h1>
            <p className={styles.subtitle}>커뮤니티 게시글 관리</p>
          </div>
        </div>
      </header>

      {/* Category Tabs */}
      <div className={styles.typeSelector}>
        <button
          onClick={() => setActiveCategory('all')}
          className={`${styles.typeButton} ${activeCategory === 'all' ? styles.active : ''}`}
        >
          전체
        </button>
        <button
          onClick={() => setActiveCategory('free')}
          className={`${styles.typeButton} ${activeCategory === 'free' ? styles.active : ''}`}
        >
          자유게시판
        </button>
        <button
          onClick={() => setActiveCategory('vip')}
          className={`${styles.typeButton} ${activeCategory === 'vip' ? styles.active : ''}`}
        >
          VIP게시판
        </button>
      </div>

      <DataTable
        data={posts}
        columns={columns}
        onView={handleView}
        onDelete={handleDelete}
        searchPlaceholder="제목 또는 작성자로 검색..."
        isLoading={isLoading}
      />
    </div>
  )
}
