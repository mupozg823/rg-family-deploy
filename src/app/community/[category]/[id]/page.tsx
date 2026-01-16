'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Eye, Calendar, User, MessageSquare, Send, Heart } from 'lucide-react'
import { useAuthContext, useComments, usePosts } from '@/lib/context'
import { formatDate } from '@/lib/utils/format'
import type { CommentItem, PostItem } from '@/types/content'
import styles from './page.module.css'

export default function PostDetailPage({
  params,
}: {
  params: Promise<{ category: string; id: string }>
}) {
  const { category, id } = use(params)
  const router = useRouter()
  const postsRepo = usePosts()
  const commentsRepo = useComments()
  const { user } = useAuthContext()
  const [post, setPost] = useState<PostItem | null>(null)
  const [comments, setComments] = useState<CommentItem[]>([])
  const [newComment, setNewComment] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isLiked, setIsLiked] = useState(false)
  const [likeCount, setLikeCount] = useState(0)
  const [isLiking, setIsLiking] = useState(false)

  const fetchPost = async (shouldIncrementView = true) => {
    setIsLoading(true)

    const postData = await postsRepo.findById(parseInt(id))
    if (!postData) {
      setIsLoading(false)
      return
    }

    let viewCount = postData.viewCount
    if (shouldIncrementView) {
      const updatedCount = await postsRepo.incrementViewCount(postData.id, postData.viewCount)
      viewCount = updatedCount ?? postData.viewCount
    }

    setPost({ ...postData, viewCount })
    setLikeCount(postData.likeCount)

    // 좋아요 상태 확인
    if (user) {
      const liked = await postsRepo.hasUserLiked(postData.id, user.id)
      setIsLiked(liked)
    }

    const postComments = await commentsRepo.findByPostId(parseInt(id))
    setComments(postComments)

    setIsLoading(false)
  }

  const handleLike = async () => {
    if (!user || !post || isLiking) return

    setIsLiking(true)
    const result = await postsRepo.toggleLike(post.id, user.id)

    if (result) {
      setIsLiked(result.liked)
      setLikeCount(result.likeCount)
    }

    setIsLiking(false)
  }

  useEffect(() => {
    void fetchPost(true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id])

  // 로그인 상태 변경 시 좋아요 상태 갱신
  useEffect(() => {
    if (post && user) {
      postsRepo.hasUserLiked(post.id, user.id).then(setIsLiked)
    } else if (!user) {
      setIsLiked(false)
    }
  }, [user, post?.id, postsRepo])

  const handleSubmitComment = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user || !newComment.trim()) return

    setIsSubmitting(true)

    const created = await commentsRepo.create({
      post_id: parseInt(id),
      author_id: user.id,
      content: newComment.trim(),
    })

    if (!created) {
      alert('댓글 작성에 실패했습니다.')
    } else {
      setNewComment('')
      fetchPost(false) // 댓글 새로고침
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

          {/* Article Actions */}
          <div className={styles.articleActions}>
            <button
              onClick={handleLike}
              disabled={!user || isLiking}
              className={`${styles.likeButton} ${isLiked ? styles.liked : ''}`}
              title={!user ? '로그인이 필요합니다' : isLiked ? '좋아요 취소' : '좋아요'}
            >
              <Heart size={18} />
              <span>좋아요 {likeCount > 0 ? likeCount : ''}</span>
            </button>
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
