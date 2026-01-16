'use client'

import { useState, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, AlertCircle } from 'lucide-react'
import { PageLayout } from '@/components/layout'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuthContext } from '@/lib/context/AuthContext'
import { createPost } from '@/lib/actions/posts'
import styles from './page.module.css'

function WritePostContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isAuthenticated, profile } = useAuthContext()

  // URL에서 게시판 타입 가져오기 (기본: free)
  const initialBoard = searchParams.get('board') as 'free' | 'vip' || 'free'

  const [formData, setFormData] = useState({
    board_type: initialBoard,
    title: '',
    content: '',
    is_anonymous: false,
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // VIP 게시판 접근 권한 체크 (Top 50 또는 VIP 이상)
  const canAccessVip = profile?.role && ['vip', 'moderator', 'admin', 'superadmin'].includes(profile.role)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!formData.title.trim()) {
      setError('제목을 입력해주세요.')
      return
    }

    if (formData.title.length > 100) {
      setError('제목은 100자 이내로 입력해주세요.')
      return
    }

    if (!formData.content.trim()) {
      setError('내용을 입력해주세요.')
      return
    }

    if (formData.board_type === 'vip' && !canAccessVip) {
      setError('VIP 라운지는 VIP 등급 이상만 작성할 수 있습니다.')
      return
    }

    setIsSubmitting(true)

    try {
      const result = await createPost({
        board_type: formData.board_type,
        title: formData.title.trim(),
        content: formData.content.trim(),
        is_anonymous: formData.is_anonymous,
      })

      if (result.error) {
        setError(result.error)
        return
      }

      // 성공 시 해당 게시판으로 이동
      router.push(`/community/${formData.board_type}`)
    } catch {
      setError('게시글 작성 중 오류가 발생했습니다.')
    } finally {
      setIsSubmitting(false)
    }
  }

  // 비로그인 사용자 안내
  if (!isAuthenticated) {
    return (
      <PageLayout>
        <div className={styles.main}>
          <Navbar />
          <section className={styles.hero}>
            <div className={styles.heroContent}>
              <h1 className={styles.title}>글쓰기</h1>
              <p className={styles.subtitle}>로그인이 필요합니다</p>
            </div>
          </section>
          <div className={styles.container}>
            <div className={styles.authRequired}>
              <AlertCircle size={48} />
              <h2>로그인이 필요합니다</h2>
              <p>게시글을 작성하려면 먼저 로그인해주세요.</p>
              <div className={styles.authButtons}>
                <Link href="/login" className={styles.loginBtn}>
                  로그인
                </Link>
                <Link href="/signup" className={styles.signupBtn}>
                  회원가입
                </Link>
              </div>
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
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>글쓰기</h1>
            <p className={styles.subtitle}>커뮤니티에 새 글을 작성합니다</p>
          </div>
        </section>

        <div className={styles.container}>
          <form onSubmit={handleSubmit} className={styles.writeForm}>
            {/* 게시판 선택 */}
            <div className={styles.formGroup}>
              <label className={styles.label}>게시판 선택</label>
              <div className={styles.boardSelect}>
                <button
                  type="button"
                  className={`${styles.boardOption} ${formData.board_type === 'free' ? styles.active : ''}`}
                  onClick={() => setFormData(prev => ({ ...prev, board_type: 'free' }))}
                >
                  자유게시판
                </button>
                <button
                  type="button"
                  className={`${styles.boardOption} ${formData.board_type === 'vip' ? styles.active : ''} ${!canAccessVip ? styles.disabled : ''}`}
                  onClick={() => canAccessVip && setFormData(prev => ({ ...prev, board_type: 'vip' }))}
                  disabled={!canAccessVip}
                  title={!canAccessVip ? 'VIP 등급 이상만 작성 가능' : ''}
                >
                  VIP 라운지
                  {!canAccessVip && <span className={styles.lockIcon}>🔒</span>}
                </button>
              </div>
            </div>

            {/* 제목 */}
            <div className={styles.formGroup}>
              <label htmlFor="title" className={styles.label}>
                제목 <span className={styles.required}>*</span>
              </label>
              <input
                type="text"
                id="title"
                className={styles.input}
                placeholder="제목을 입력하세요 (최대 100자)"
                maxLength={100}
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              />
              <span className={styles.charCount}>{formData.title.length}/100</span>
            </div>

            {/* 내용 */}
            <div className={styles.formGroup}>
              <label htmlFor="content" className={styles.label}>
                내용 <span className={styles.required}>*</span>
              </label>
              <textarea
                id="content"
                className={styles.textarea}
                placeholder="내용을 입력하세요"
                rows={15}
                value={formData.content}
                onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              />
            </div>

            {/* 익명 옵션 */}
            <div className={styles.formGroup}>
              <label className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={formData.is_anonymous}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_anonymous: e.target.checked }))}
                />
                <span>익명으로 작성</span>
              </label>
            </div>

            {/* 에러 메시지 */}
            {error && (
              <div className={styles.errorMessage}>
                <AlertCircle size={16} />
                {error}
              </div>
            )}

            {/* 버튼 영역 */}
            <div className={styles.formActions}>
              <Link
                href={`/community/${formData.board_type}`}
                className={styles.cancelBtn}
              >
                <ArrowLeft size={16} />
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
                    작성 중...
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

// Loading fallback for Suspense
function WritePostLoading() {
  return (
    <PageLayout>
      <div className={styles.main}>
        <Navbar />
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <h1 className={styles.title}>글쓰기</h1>
            <p className={styles.subtitle}>로딩 중...</p>
          </div>
        </section>
        <div className={styles.container}>
          <div className={styles.authRequired}>
            <div className={styles.spinner} />
          </div>
        </div>
        <Footer />
      </div>
    </PageLayout>
  )
}

// Main export with Suspense boundary
export default function WritePostPage() {
  return (
    <Suspense fallback={<WritePostLoading />}>
      <WritePostContent />
    </Suspense>
  )
}
