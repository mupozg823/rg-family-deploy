'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { MessageSquare, Eye, ChevronRight, Crown, Lock } from 'lucide-react'
import { useSupabase } from '@/lib/hooks/useSupabase'
import { useAuth } from '@/lib/hooks/useAuth'
import { mockPosts, mockProfiles } from '@/lib/mock/data'
import { USE_MOCK_DATA } from '@/lib/config'
import { formatRelativeTime } from '@/lib/utils/format'
import TabFilter from '@/components/community/TabFilter'
import type { JoinedProfile } from '@/types/common'
import styles from '../free/page.module.css'

interface Post {
  id: number
  title: string
  authorName: string
  viewCount: number
  commentCount: number
  createdAt: string
}

export default function VipBoardPage() {
  const supabase = useSupabase()
  const { user, profile } = useAuth()
  const [posts, setPosts] = useState<Post[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const tabs = [
    { label: '자유게시판 (FREE)', value: 'free', path: '/community/free' },
    { label: 'VIP 라운지 (VIP)', value: 'vip', path: '/community/vip' },
  ]

  // VIP 권한 체크 (후원 금액 기준 또는 역할) - Mock 모드에서는 항상 true
  const isVip = USE_MOCK_DATA ? true : (profile && (profile.total_donation >= 100000 || ['admin', 'superadmin'].includes(profile.role)))

  const fetchPosts = useCallback(async () => {
    if (!isVip) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    if (USE_MOCK_DATA) {
      const vipPosts = mockPosts
        .filter((p) => p.board_type === 'vip')
        .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        .slice(0, 20)
      setPosts(
        vipPosts.map((p) => {
          const author = mockProfiles.find((pr) => pr.id === p.author_id)
          return {
            id: p.id,
            title: p.title,
            authorName: p.is_anonymous ? '익명' : (author?.nickname || '익명'),
            viewCount: p.view_count || 0,
            commentCount: p.comment_count || 0,
            createdAt: p.created_at,
          }
        })
      )
      setIsLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('posts')
      .select('id, title, view_count, created_at, profiles!author_id(nickname), comments(id)')
      .eq('board_type', 'vip')
      .order('created_at', { ascending: false })
      .limit(20)

    if (error) {
      console.error('게시글 로드 실패:', error)
    } else {
      setPosts(
        (data || []).map((p) => {
          const profile = p.profiles as JoinedProfile | null
          const comments = p.comments as unknown[] | null
          return {
            id: p.id,
            title: p.title,
            authorName: profile?.nickname || '익명',
            viewCount: p.view_count || 0,
            commentCount: comments?.length || 0,
            createdAt: p.created_at,
          }
        })
      )
    }

    setIsLoading(false)
  }, [supabase, isVip])

  useEffect(() => {
    fetchPosts()
  }, [fetchPosts])


  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1>
          <Crown size={32} style={{ color: '#ffd700', marginRight: '0.5rem' }} />
          VIP LOUNGE
        </h1>
        <p>VIP 후원자 전용 라운지</p>
      </header>

      <div className={styles.container}>
        <TabFilter tabs={tabs} activeTab="vip" />

        {!user ? (
          <div className={styles.locked}>
            <Lock size={48} />
            <h3>로그인이 필요합니다</h3>
            <p>VIP 라운지에 접근하려면 로그인해주세요.</p>
            <Link href="/login" className={styles.loginBtn}>로그인</Link>
          </div>
        ) : !isVip ? (
          <div className={styles.locked}>
            <Crown size={48} style={{ color: '#ffd700' }} />
            <h3>VIP 전용 공간입니다</h3>
            <p>10만원 이상 후원 시 VIP 라운지 이용이 가능합니다.</p>
            <Link href="/ranking" className={styles.loginBtn}>후원 랭킹 보기</Link>
          </div>
        ) : isLoading ? (
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
                href={`/community/vip/${post.id}`}
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
                <span className={styles.postDate}>{formatRelativeTime(post.createdAt)}</span>
                <ChevronRight size={16} className={styles.arrow} />
              </Link>
            ))}
          </div>
        )}

        {isVip && (
          <div className={styles.actions}>
            <button className={styles.writeBtn}>글쓰기</button>
          </div>
        )}
      </div>
    </main>
  )
}
