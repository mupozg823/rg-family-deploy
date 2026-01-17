'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, Eye, EyeOff } from 'lucide-react'
import { PageLayout } from '@/components/layout'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuthContext } from '@/lib/context'
import { createPost } from '@/lib/actions/posts'
import styles from './page.module.css'

export default function WritePostPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuthContext()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isAnonymous, setIsAnonymous] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!user) {
      setError('로그인이 필요합니다.')
      return
    }

    if (!title.trim()) {
      setError('제목을 입력해주세요.')
      return
    }

    if (!content.trim()) {
      setError('내용을 입력해주세요.')
      return
    }

    if (title.trim().length < 2) {
      setError('제목은 2자 이상 입력해주세요.')
      return
    }

    if (content.trim().length < 10) {
      setError('내용은 10자 이상 입력해주세요.')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createPost({
        title: title.trim(),
        content: content.trim(),
        board_type: 'free',
        is_anonymous: isAnonymous,
      })

      if (result.data) {
        router.push(`/community/free/${result.data.id}`)
      } else {
        setError(result.error || '게시글 작성에 실패했습니다.')
      }
    } catch (err) {
      console.error('게시글 작성 오류:', err)
      setError('게시글 작성 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 로그인 체크
  if (!authLoading && !user) {
    return (
      <PageLayout>
        <div className={styles.main}>
          <Navbar />
          <div className={styles.authRequired}>
            <div className={styles.authCard}>
              <h2>로그인이 필요합니다</h2>
              <p>게시글을 작성하려면 로그인해주세요.</p>
              <Link href="/login" className={styles.loginBtn}>
                로그인하기
              </Link>
            </div>
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

        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.pageTitle}>글쓰기</h1>
            <p className={styles.subtitle}>자유롭게 이야기를 나눠보세요</p>
          </div>
        </section>

        <div className={styles.container}>
          {/* Back Button */}
          <Link href="/community/free" className={styles.backBtn}>
            <ArrowLeft size={18} />
            목록으로
          </Link>

          {/* Write Form */}
          <form onSubmit={handleSubmit} className={styles.writeForm}>
            {/* Header Row */}
            <div className={styles.formHeader}>
              {/* Anonymous Toggle */}
              <button
                type="button"
                onClick={() => setIsAnonymous(!isAnonymous)}
                className={`${styles.anonymousToggle} ${isAnonymous ? styles.active : ''}`}
              >
                {isAnonymous ? <EyeOff size={16} /> : <Eye size={16} />}
                {isAnonymous ? '익명' : '닉네임'}
              </button>
            </div>

            {/* Title Input */}
            <div className={styles.inputGroup}>
              <input
                type="text"
                placeholder="제목을 입력하세요"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={styles.titleInput}
                maxLength={100}
              />
              <span className={styles.charCount}>{title.length}/100</span>
            </div>

            {/* Content Textarea */}
            <div className={styles.inputGroup}>
              <textarea
                placeholder="내용을 입력하세요"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className={styles.contentTextarea}
                rows={15}
              />
            </div>

            {/* Error Message */}
            {error && (
              <div className={styles.errorMessage}>
                {error}
              </div>
            )}

            {/* Submit Buttons */}
            <div className={styles.formActions}>
              <Link href="/community/free" className={styles.cancelBtn}>
                취소
              </Link>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <span className={styles.spinner} />
                    등록 중...
                  </>
                ) : (
                  <>
                    <Send size={16} />
                    등록하기
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        <Footer />
      </div>
    </PageLayout>
  )
}
