'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Eye, Calendar, User, MessageSquare, Send } from 'lucide-react'
import { useSupabase } from '@/lib/hooks/useSupabase'
import { useAuth } from '@/lib/hooks/useAuth'
import { mockPosts, mockProfiles } from '@/lib/mock/data'
import { USE_MOCK_DATA } from '@/lib/config'
import { formatDate } from '@/lib/utils/format'
import styles from './page.module.css'

interface PostDetail {
  id: number
  title: string
  content: string
  authorId: string
  authorName: string
  authorAvatar: string | null
  viewCount: number
  createdAt: string
}

interface Comment {
  id: number
  content: string
  authorId: string
  authorName: string
  authorAvatar: string | null
  createdAt: string
}

// Mock 댓글 데이터
const mockComments = [
  { id: 1, post_id: 1, author_id: 'user-2', content: '완전 공감이에요! 저도 그 부분에서 빵터졌어요 ㅋㅋ', created_at: '2024-12-20T23:00:00Z' },
  { id: 2, post_id: 1, author_id: 'user-3', content: '다음 방송도 기대됩니다~', created_at: '2024-12-20T23:30:00Z' },
  { id: 3, post_id: 2, author_id: 'user-1', content: '와 너무 예쁘게 그리셨네요!', created_at: '2024-12-19T16:00:00Z' },
  { id: 4, post_id: 2, author_id: 'user-4', content: '다음 작품도 기대할게요!', created_at: '2024-12-19T17:00:00Z' },
  { id: 5, post_id: 3, author_id: 'user-2', content: 'VIP 굿즈 퀄리티 진짜 대박이죠', created_at: '2024-12-18T11:00:00Z' },
]

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ category: string; id: string }>
}) {
  const { category, id } = use(params)
  const router = useRouter()
  const supabase = useSupabase()
  const { user, profile } = useAuth()
  const [post, setPost] = useState<PostDetail | null>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const fetchPost = useCallback(async () => {
    setIsLoading(true)

    if (USE_MOCK_DATA) {
      const foundPost = mockPosts.find((p) => p.id === parseInt(id))
      if (foundPost) {
        const author = mockProfiles.find((pr) => pr.id === foundPost.author_id)
        setPost({
          id: foundPost.id,
          title: foundPost.title,
          content: foundPost.content || '',
          authorId: foundPost.author_id,
          authorName: foundPost.is_anonymous ? '익명' : (author?.nickname || '익명'),
          authorAvatar: author?.avatar_url || null,
          viewCount: (foundPost.view_count || 0) + 1,
          createdAt: foundPost.created_at,
        })

        // Mock 댓글 필터링
        const postComments = mockComments
          .filter((c) => c.post_id === parseInt(id))
          .map((c) => {
            const commentAuthor = mockProfiles.find((pr) => pr.id === c.author_id)
            return {
              id: c.id,
              content: c.content,
              authorId: c.author_id,
              authorName: commentAuthor?.nickname || '익명',
              authorAvatar: commentAuthor?.avatar_url || null,
              createdAt: c.created_at,
            }
          })
        setComments(postComments)
      }
      setIsLoading(false)
      return
    }

    // 게시글 조회
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .select('*, profiles!author_id(id, nickname, avatar_url)')
      .eq('id', parseInt(id))
      .single()

    if (postError || !postData) {
      console.error('게시글 로드 실패:', postError)
      setIsLoading(false)
      return
    }

    // 조회수 증가
    await supabase
      .from('posts')
      .update({ view_count: (postData.view_count || 0) + 1 })
      .eq('id', parseInt(id))

    setPost({
      id: postData.id,
      title: postData.title,
      content: postData.content || '',
      authorId: postData.author_id,
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      authorName: (postData.profiles as any)?.nickname || '익명',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      authorAvatar: (postData.profiles as any)?.avatar_url,
      viewCount: (postData.view_count || 0) + 1,
      createdAt: postData.created_at,
    })

    // 댓글 조회
    const { data: commentsData } = await supabase
      .from('comments')
      .select('*, profiles!author_id(id, nickname, avatar_url)')
      .eq('post_id', parseInt(id))
      .order('created_at', { ascending: true })

    setComments(
      (commentsData || []).map((c) => ({
        id: c.id,
        content: c.content,
        authorId: c.author_id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        authorName: (c.profiles as any)?.nickname || '익명',
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        authorAvatar: (c.profiles as any)?.avatar_url,
        createdAt: c.created_at,
      }))
    )

    setIsLoading(false)
  }, [supabase, id])

  useEffect(() => {
    fetchPost()
  }, [fetchPost])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newComment.trim()) return

    setIsSubmitting(true)

    const { error } = await supabase.from('comments').insert({
      post_id: parseInt(id),
      author_id: user.id,
      content: newComment.trim(),
    })

    if (error) {
      console.error('댓글 작성 실패:', error)
      alert('댓글 작성에 실패했습니다.')
    } else {
      setNewComment('')
      fetchPost() // 댓글 새로고침
    }

    setIsSubmitting(false)
  }


  const getCategoryLabel = () => {
    return category === 'vip' ? 'VIP 라운지' : '자유게시판'
  }

  if (isLoading) {
    return (
      <main className={styles.main}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>게시글을 불러오는 중...</span>
        </div>
      </main>
    )
  }

  if (!post) {
    return (
      <main className={styles.main}>
        <div className={styles.empty}>
          <p>게시글을 찾을 수 없습니다</p>
          <Link href={`/community/${category}`} className={styles.backLink}>
            목록으로 돌아가기
          </Link>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        {/* Header */}
        <header className={styles.header}>
          <button onClick={() => router.back()} className={styles.backButton}>
            <ArrowLeft size={20} />
            <span>{getCategoryLabel()}</span>
          </button>
        </header>

        {/* Article */}
        <article className={styles.article}>
          {/* Title Area */}
          <div className={styles.titleArea}>
            <h1 className={styles.title}>{post.title}</h1>
            <div className={styles.meta}>
              <div className={styles.author}>
                <div className={styles.authorAvatar}>
                  {post.authorAvatar ? (
                    <Image
                      src={post.authorAvatar}
                      alt={post.authorName}
                      fill
                      className={styles.avatarImage}
                    />
                  ) : (
                    <User size={20} />
                  )}
                </div>
                <span>{post.authorName}</span>
              </div>
              <div className={styles.metaItems}>
                <span>
                  <Calendar size={14} />
                  {formatDate(post.createdAt)}
                </span>
                <span>
                  <Eye size={14} />
                  {post.viewCount}
                </span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className={styles.content}>
            {post.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph || '\u00A0'}</p>
            ))}
          </div>
        </article>

        {/* Comments */}
        <section className={styles.comments}>
          <h2 className={styles.commentsHeader}>
            <MessageSquare size={20} />
            댓글 {comments.length}
          </h2>

          {/* Comment Form */}
          {user ? (
            <form onSubmit={handleSubmitComment} className={styles.commentForm}>
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="댓글을 입력하세요..."
                className={styles.commentInput}
                rows={3}
              />
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className={styles.submitButton}
              >
                <Send size={16} />
                등록
              </button>
            </form>
          ) : (
            <div className={styles.loginPrompt}>
              <p>댓글을 작성하려면 로그인이 필요합니다.</p>
              <Link href="/login" className={styles.loginLink}>로그인</Link>
            </div>
          )}

          {/* Comments List */}
          <div className={styles.commentsList}>
            {comments.length === 0 ? (
              <p className={styles.noComments}>첫 댓글을 작성해보세요!</p>
            ) : (
              comments.map((comment) => (
                <div key={comment.id} className={styles.commentItem}>
                  <div className={styles.commentAuthor}>
                    <div className={styles.commentAvatar}>
                      {comment.authorAvatar ? (
                        <Image
                          src={comment.authorAvatar}
                          alt={comment.authorName}
                          fill
                          className={styles.avatarImage}
                        />
                      ) : (
                        <User size={16} />
                      )}
                    </div>
                    <span className={styles.commentAuthorName}>{comment.authorName}</span>
                    <span className={styles.commentDate}>
                      {formatDate(comment.createdAt)}
                    </span>
                  </div>
                  <p className={styles.commentContent}>{comment.content}</p>
                </div>
              ))
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className={styles.footer}>
          <Link href={`/community/${category}`} className={styles.listButton}>
            목록으로
          </Link>
        </footer>
      </div>
    </main>
  )
}
