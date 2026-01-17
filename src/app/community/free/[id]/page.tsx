'use client'

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Eye, ThumbsUp, MessageSquare, Trash2, Edit3, Send, MoreVertical } from 'lucide-react'
import { PageLayout } from '@/components/layout'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useSupabaseContext, useAuthContext } from '@/lib/context'
import { createComment, deleteComment, deletePost } from '@/lib/actions/posts'
import { formatRelativeTime } from '@/lib/utils/format'
import { USE_MOCK_DATA } from '@/lib/config'
import { mockPosts, mockProfiles, mockComments } from '@/lib/mock'
import type { JoinedProfile } from '@/types/common'
import styles from './page.module.css'

interface PostDetail {
  id: number
  title: string
  content: string
  authorId: string
  authorName: string
  authorAvatar?: string
  viewCount: number
  likeCount: number
  commentCount: number
  createdAt: string
  isAnonymous: boolean
}

interface CommentItem {
  id: number
  content: string
  authorId: string
  authorName: string
  authorAvatar?: string
  createdAt: string
  isAnonymous: boolean
}

export default function PostDetailPage() {
  const params = useParams()
  const router = useRouter()
  const postId = Number(params.id)

  const supabase = useSupabaseContext()
  const { user, profile } = useAuthContext()

  const [post, setPost] = useState<PostDetail | null>(null)
  const [comments, setComments] = useState<CommentItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [commentText, setCommentText] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showMenu, setShowMenu] = useState(false)
  const [error, setError] = useState('')

  const fetchPost = useCallback(async () => {
    setIsLoading(true)

    if (USE_MOCK_DATA) {
      const mockPost = mockPosts.find(p => p.id === postId && p.board_type === 'free')
      if (mockPost) {
        const author = mockProfiles.find(pr => pr.id === mockPost.author_id)
        setPost({
          id: mockPost.id,
          title: mockPost.title,
          content: mockPost.content,
          authorId: mockPost.author_id,
          authorName: mockPost.is_anonymous ? '익명' : (author?.nickname || '익명'),
          authorAvatar: author?.avatar_url || undefined,
          viewCount: mockPost.view_count || 0,
          likeCount: mockPost.like_count || 0,
          commentCount: mockPost.comment_count || 0,
          createdAt: mockPost.created_at,
          isAnonymous: mockPost.is_anonymous || false,
        })

        // Mock 댓글
        const postComments = mockComments
          .filter(c => c.post_id === postId)
          .map(c => {
            const commentAuthor = mockProfiles.find(pr => pr.id === c.author_id)
            return {
              id: c.id,
              content: c.content,
              authorId: c.author_id,
              authorName: commentAuthor?.nickname || '익명',
              authorAvatar: commentAuthor?.avatar_url || undefined,
              createdAt: c.created_at,
              isAnonymous: false,
            }
          })
        setComments(postComments)
      }
      setIsLoading(false)
      return
    }

    // Supabase 쿼리
    const { data: postData, error: postError } = await supabase
      .from('posts')
      .select('*, profiles!author_id(id, nickname, avatar_url)')
      .eq('id', postId)
      .eq('board_type', 'free')
      .eq('is_deleted', false)
      .single()

    if (postError || !postData) {
      console.error('게시글 로드 실패:', postError)
      setIsLoading(false)
      return
    }

    const postProfile = postData.profiles as JoinedProfile | null
    setPost({
      id: postData.id,
      title: postData.title,
      content: postData.content,
      authorId: postData.author_id,
      authorName: postData.is_anonymous ? '익명' : (postProfile?.nickname || '익명'),
      authorAvatar: postProfile?.avatar_url || undefined,
      viewCount: postData.view_count || 0,
      likeCount: postData.like_count || 0,
      commentCount: postData.comment_count || 0,
      createdAt: postData.created_at,
      isAnonymous: postData.is_anonymous || false,
    })

    // 조회수 증가
    await supabase
      .from('posts')
      .update({ view_count: (postData.view_count || 0) + 1 })
      .eq('id', postId)

    // 댓글 조회
    const { data: commentsData } = await supabase
      .from('comments')
      .select('*, profiles!author_id(id, nickname, avatar_url)')
      .eq('post_id', postId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })

    if (commentsData) {
      setComments(
        commentsData.map(c => {
          const commentProfile = c.profiles as JoinedProfile | null
          const isAnon = (c as { is_anonymous?: boolean }).is_anonymous
          return {
            id: c.id,
            content: c.content,
            authorId: c.author_id,
            authorName: isAnon ? '익명' : (commentProfile?.nickname || '익명'),
            authorAvatar: commentProfile?.avatar_url || undefined,
            createdAt: c.created_at,
            isAnonymous: isAnon || false,
          }
        })
      )
    }

    setIsLoading(false)
  }, [supabase, postId])

  useEffect(() => {
    if (postId) {
      fetchPost()
    }
  }, [postId, fetchPost])

  const handleSubmitComment = async () => {
    if (!user) {
      setError('로그인이 필요합니다.')
      return
    }

    if (!commentText.trim()) {
      setError('댓글 내용을 입력해주세요.')
      return
    }

    setIsSubmitting(true)
    setError('')

    const result = await createComment({
      post_id: postId,
      content: commentText.trim(),
    })

    if (result.data) {
      setCommentText('')
      // 댓글 목록 새로고침
      fetchPost()
    } else {
      setError(result.error || '댓글 작성에 실패했습니다.')
    }

    setIsSubmitting(false)
  }

  const handleDeleteComment = async (commentId: number) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return

    const result = await deleteComment(commentId)
    if (result.data !== undefined && !result.error) {
      fetchPost()
    } else {
      alert(result.error || '삭제에 실패했습니다.')
    }
  }

  const handleDeletePost = async () => {
    if (!confirm('게시글을 삭제하시겠습니까?')) return

    const result = await deletePost(postId)
    if (result.data !== undefined && !result.error) {
      router.push('/community/free')
    } else {
      alert(result.error || '삭제에 실패했습니다.')
    }
  }

  const isAuthor = user && post && user.id === post.authorId
  const isAdmin = profile && ['admin', 'superadmin', 'moderator'].includes(profile.role)

  if (isLoading) {
    return (
      <PageLayout>
        <div className={styles.main}>
          <Navbar />
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <span>게시글을 불러오는 중...</span>
          </div>
          <Footer />
        </div>
      </PageLayout>
    )
  }

  if (!post) {
    return (
      <PageLayout>
        <div className={styles.main}>
          <Navbar />
          <div className={styles.notFound}>
            <h2>게시글을 찾을 수 없습니다</h2>
            <p>삭제되었거나 존재하지 않는 게시글입니다.</p>
            <Link href="/community/free" className={styles.backLink}>
              목록으로 돌아가기
            </Link>
          </div>
          <Footer />
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className={styles.main}>
        <Navbar />

        <div className={styles.container}>
          {/* Back Button */}
          <Link href="/community/free" className={styles.backBtn}>
            <ArrowLeft size={18} />
            목록으로
          </Link>

          {/* Post Card */}
          <article className={styles.postCard}>
            {/* Post Header */}
            <header className={styles.postHeader}>
              <h1 className={styles.postTitle}>{post.title}</h1>
              <div className={styles.postMeta}>
                <div className={styles.authorInfo}>
                  {post.authorAvatar && !post.isAnonymous ? (
                    <img src={post.authorAvatar} alt="" className={styles.avatar} />
                  ) : (
                    <div className={styles.avatarPlaceholder}>
                      {post.authorName.charAt(0)}
                    </div>
                  )}
                  <span className={styles.authorName}>{post.authorName}</span>
                  <span className={styles.dot}>·</span>
                  <span className={styles.date}>{formatRelativeTime(post.createdAt)}</span>
                </div>
                <div className={styles.stats}>
                  <span><Eye size={14} /> {post.viewCount}</span>
                  <span><ThumbsUp size={14} /> {post.likeCount}</span>
                  <span><MessageSquare size={14} /> {comments.length}</span>
                </div>
              </div>

              {/* Actions Menu */}
              {(isAuthor || isAdmin) && (
                <div className={styles.menuWrapper}>
                  <button
                    className={styles.menuBtn}
                    onClick={() => setShowMenu(!showMenu)}
                  >
                    <MoreVertical size={18} />
                  </button>
                  {showMenu && (
                    <div className={styles.menuDropdown}>
                      {isAuthor && (
                        <Link
                          href={`/community/free/${post.id}/edit`}
                          className={styles.menuItem}
                        >
                          <Edit3 size={14} />
                          수정
                        </Link>
                      )}
                      <button
                        className={styles.menuItem}
                        onClick={handleDeletePost}
                      >
                        <Trash2 size={14} />
                        삭제
                      </button>
                    </div>
                  )}
                </div>
              )}
            </header>

            {/* Post Content */}
            <div className={styles.postContent}>
              {post.content.split('\n').map((line, i) => (
                <p key={i}>{line || <br />}</p>
              ))}
            </div>
          </article>

          {/* Comments Section */}
          <section className={styles.commentsSection}>
            <h2 className={styles.commentsTitle}>
              댓글 <span>{comments.length}</span>
            </h2>

            {/* Comment Form */}
            {user ? (
              <div className={styles.commentForm}>
                <div className={styles.commentInputWrapper}>
                  <textarea
                    placeholder="댓글을 입력하세요"
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className={styles.commentInput}
                    rows={3}
                  />
                  <div className={styles.commentActions}>
                    <div />
                    <button
                      onClick={handleSubmitComment}
                      disabled={isSubmitting || !commentText.trim()}
                      className={styles.submitBtn}
                    >
                      {isSubmitting ? (
                        <span className={styles.spinner} />
                      ) : (
                        <Send size={16} />
                      )}
                      등록
                    </button>
                  </div>
                </div>
                {error && <p className={styles.errorMessage}>{error}</p>}
              </div>
            ) : (
              <div className={styles.loginPrompt}>
                <p>댓글을 작성하려면 <Link href="/login">로그인</Link>이 필요합니다.</p>
              </div>
            )}

            {/* Comments List */}
            <div className={styles.commentsList}>
              {comments.length === 0 ? (
                <div className={styles.noComments}>
                  첫 번째 댓글을 남겨보세요!
                </div>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className={styles.commentItem}>
                    <div className={styles.commentHeader}>
                      <div className={styles.commentAuthor}>
                        {comment.authorAvatar && !comment.isAnonymous ? (
                          <img src={comment.authorAvatar} alt="" className={styles.commentAvatar} />
                        ) : (
                          <div className={styles.commentAvatarPlaceholder}>
                            {comment.authorName.charAt(0)}
                          </div>
                        )}
                        <span className={styles.commentAuthorName}>{comment.authorName}</span>
                        <span className={styles.commentDate}>{formatRelativeTime(comment.createdAt)}</span>
                      </div>
                      {(user?.id === comment.authorId || isAdmin) && (
                        <button
                          className={styles.deleteCommentBtn}
                          onClick={() => handleDeleteComment(comment.id)}
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                    <p className={styles.commentContent}>{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </section>
        </div>

        <Footer />
      </div>
    </PageLayout>
  )
}
