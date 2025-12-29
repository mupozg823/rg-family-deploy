'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { MessageSquare, Eye, ChevronRight } from 'lucide-react'
import { useSupabase } from '@/lib/hooks/useSupabase'
import TabFilter from '@/components/community/TabFilter'
import styles from './page.module.css'

interface Post {
  id: number
  title: string
  authorName: string
  viewCount: number
  commentCount: number
  createdAt: string
}

export default function FreeBoardPage() {
  const supabase = useSupabase()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const tabs = [
    { label: '자유게시판 (FREE)', value: 'free', path: '/community/free' },
    { label: 'VIP 라운지 (VIP)', value: 'vip', path: '/community/vip' },
  ]

  const fetchPosts = useCallback(async () => {
    setIsLoading(true)

    const { data, error } = await supabase
      .from('posts')
      .select('id, title, view_count, created_at, profiles!author_id(nickname), comments(id)')
      .eq('board_type', 'free')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('게시글 로드 실패:', error)
    } else {
      setPosts(
        (data || []).map((p) => ({
          id: p.id,
          title: p.title,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          authorName: (p.profiles as any)?.nickname || '익명',
          viewCount: p.view_count || 0,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          commentCount: (p.comments as any[])?.length || 0,
          createdAt: p.created_at,
        }))
      )
    }

    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60))

    if (diffHours < 24) {
      return date.toLocaleTimeString('ko-KR', { hour: '2-digit', minute: '2-digit' })
    }
    return date.toLocaleDateString('ko-KR', { month: '2-digit', day: '2-digit' })
  }

  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1>COMMUNITY</h1>
        <p>팬들과 소통하는 자유 공간</p>
      </header>

      <div className={styles.container}>
        <TabFilter tabs={tabs} activeTab="free" />

        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <span>게시글을 불러오는 중...</span>
          </div>
        ) : posts.length === 0 ? (
          <div className={styles.empty}>
            <p>등록된 게시글이 없습니다</p>
          </div>
        ) : (
          <div className={styles.board}>
            <div className={styles.boardHeader}>
              <span>제목</span>
              <span className={styles.pcOnly}>작성자</span>
              <span className={styles.pcOnly}>조회</span>
              <span className={styles.pcOnly}>날짜</span>
            </div>
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/community/free/${post.id}`}
                className={styles.post}
              >
                <span className={styles.postTitle}>
                  {post.title}
                  {post.commentCount > 0 && (
                    <span className={styles.commentBadge}>
                      <MessageSquare size={12} />
                      {post.commentCount}
                    </span>
                  )}
                </span>
                <span className={styles.postAuthor}>{post.authorName}</span>
                <span className={styles.postViews}>
                  <Eye size={14} />
                  {post.viewCount}
                </span>
                <span className={styles.postDate}>{formatDate(post.createdAt)}</span>
                <ChevronRight size={16} className={styles.arrow} />
              </Link>
            ))}
          </div>
        )}

        <div className={styles.actions}>
          <button className={styles.writeBtn}>글쓰기</button>
        </div>
      </div>
    </main>
  )
}
