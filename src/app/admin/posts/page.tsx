'use client'

import { useEffect, useState, useCallback } from 'react'
import { MessageSquare, Eye, Trash2 } from 'lucide-react'
import { DataTable, Column } from '@/components/admin'
import { useSupabase } from '@/lib/hooks/useSupabase'
import styles from '../shared.module.css'

interface Post {
  id: number
  title: string
  authorName: string
  boardType: 'free' | 'vip'
  viewCount: number
  commentCount: number
  createdAt: string
}

export default function PostsPage() {
  const supabase = useSupabase()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState<'all' | 'free' | 'vip'>('all')

  const fetchPosts = useCallback(async () => {
    setIsLoading(true)

    let query = supabase
      .from('posts')
      .select('*, profiles!author_id(nickname), comments(id)')
      .order('created_at', { ascending: false })

    if (activeCategory !== 'all') {
      query = query.eq('board_type', activeCategory)
    }

    const { data, error } = await query

    if (error) {
      console.error('게시글 데이터 로드 실패:', error)
    } else {
      setPosts(
        (data || []).map((p) => ({
          id: p.id,
          title: p.title,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          authorName: (p.profiles as any)?.nickname || '익명',
          boardType: p.board_type,
          viewCount: p.view_count || 0,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          commentCount: (p.comments as any[])?.length || 0,
          createdAt: p.created_at,
        }))
      )
    }

    setIsLoading(false)
  }, [supabase, activeCategory])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const handleDelete = async (post: Post) => {
    if (!confirm('정말 삭제하시겠습니까? 댓글도 함께 삭제됩니다.')) return

    const { error } = await supabase.from('posts').delete().eq('id', post.id)

    if (error) {
      console.error('게시글 삭제 실패:', error)
      alert('삭제에 실패했습니다.')
    } else {
      fetchPosts()
    }
  }

  const handleView = (post: Post) => {
    window.open(`/community/${post.boardType}/${post.id}`, '_blank')
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  const columns: Column<Post>[] = [
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
