'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Send, Crown, Lock } from 'lucide-react'
import { PageLayout } from '@/components/layout'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { useAuthContext } from '@/lib/context'
import { useVipStatus } from '@/lib/hooks'
import { createPost } from '@/lib/actions/posts'
import styles from '../../free/write/page.module.css'

export default function VipWritePostPage() {
  const router = useRouter()
  const { user, isLoading: authLoading } = useAuthContext()
  const { isVip, isLoading: vipLoading } = useVipStatus()

  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (!user) {
      setError('로그인이 필요합니다.')
      return
    }

    if (!isVip) {
      setError('VIP 권한이 필요합니다.')
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
        board_type: 'vip',
        is_anonymous: false, // VIP 게시판은 익명 불가
      })

      if (result.data) {
        router.push(`/community/vip/${result.data.id}`)
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

  // 로딩 중
  if (authLoading || vipLoading) {
    return (
      <PageLayout>
        <div className={styles.main}>
          <Navbar />
          <div className={styles.authRequired}>
            <div className={styles.authCard}>
              <div className={styles.spinner} />
              <p>권한 확인 중...</p>
            </div>
          </div>
          <Footer />
        </div>
      </PageLayout>
    )
  }

  // 로그인 필요
  if (!user) {
    return (
      <PageLayout>
        <div className={styles.main}>
          <Navbar />
          <div className={styles.authRequired}>
            <div className={styles.authCard}>
              <Lock size={48} style={{ color: 'var(--text-muted)', marginBottom: '1rem' }} />
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

  // VIP 아님
  if (!isVip) {
    return (
      <PageLayout>
        <div className={styles.main}>
          <Navbar />
          <div className={styles.authRequired}>
            <div className={styles.authCard}>
              <Crown size={48} style={{ color: '#ffd700', marginBottom: '1rem' }} />
              <h2>VIP 전용 공간입니다</h2>
              <p>후원 랭킹 Top 50만 VIP 라운지 글쓰기가 가능합니다.</p>
              <Link href="/ranking" className={styles.loginBtn}>
                후원 랭킹 보기
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

        {/* VIP Hero Section */}
        <section className={styles.hero} style={{ background: 'linear-gradient(180deg, rgba(255, 215, 0, 0.05) 0%, var(--hero-bg) 100%)' }}>
          <div className={styles.heroContent}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Crown size={24} style={{ color: '#ffd700' }} />
              <h1 className={styles.pageTitle}>VIP 글쓰기</h1>
            </div>
            <p className={styles.subtitle}>VIP 후원자 전용 프리미엄 게시판</p>
          </div>
        </section>

        <div className={styles.container}>
          {/* Back Button */}
          <Link href="/community/vip" className={styles.backBtn}>
            <ArrowLeft size={18} />
            목록으로
          </Link>

          {/* Write Form */}
          <form onSubmit={handleSubmit} className={styles.writeForm} style={{ borderColor: 'rgba(255, 215, 0, 0.2)' }}>
            {/* VIP Badge */}
            <div style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.5rem 1rem',
              background: 'rgba(255, 215, 0, 0.1)',
              border: '1px solid rgba(255, 215, 0, 0.3)',
              borderRadius: '6px',
              marginBottom: '1rem',
              color: '#ffd700',
              fontSize: '0.875rem'
            }}>
              <Crown size={14} />
              VIP 전용 게시글
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
              <Link href="/community/vip" className={styles.cancelBtn}>
                취소
              </Link>
              <button
                type="submit"
                className={styles.submitBtn}
                disabled={isSubmitting}
                style={{ background: 'linear-gradient(135deg, #ffd700 0%, #ffb700 100%)' }}
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
