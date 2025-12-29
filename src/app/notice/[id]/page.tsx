'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft, Pin, Calendar } from 'lucide-react'
import { useSupabase } from '@/lib/hooks/useSupabase'
import { mockNotices } from '@/lib/mock/data'
import styles from './page.module.css'

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || true

interface NoticeDetail {
  id: number
  title: string
  content: string
  isPinned: boolean
  createdAt: string
}

export default function NoticeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const supabase = useSupabase()
  const [notice, setNotice] = useState<NoticeDetail | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchNotice = useCallback(async () => {
    setIsLoading(true)

    if (USE_MOCK) {
      const found = mockNotices.find((n) => n.id === parseInt(id))
      if (found) {
        setNotice({
          id: found.id,
          title: found.title,
          content: found.content || '',
          isPinned: found.is_pinned,
          createdAt: found.created_at,
        })
      }
      setIsLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('notices')
      .select('id, title, content, is_pinned, created_at')
      .eq('id', parseInt(id))
      .single()

    if (error) {
      console.error('공지사항 로드 실패:', error)
    } else if (data) {
      setNotice({
        id: data.id,
        title: data.title,
        content: data.content || '',
        isPinned: data.is_pinned,
        createdAt: data.created_at,
      })
    }

    setIsLoading(false)
  }, [supabase, id])

  useEffect(() => {
    fetchNotice()
  }, [fetchNotice])

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  if (isLoading) {
    return (
      <main className={styles.main}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>공지사항을 불러오는 중...</span>
        </div>
      </main>
    )
  }

  if (!notice) {
    return (
      <main className={styles.main}>
        <div className={styles.empty}>
          <p>공지사항을 찾을 수 없습니다</p>
          <Link href="/notice" className={styles.backLink}>
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
            <span>목록</span>
          </button>
        </header>

        {/* Article */}
        <article className={styles.article}>
          {/* Title Area */}
          <div className={styles.titleArea}>
            {notice.isPinned && (
              <span className={styles.pinnedBadge}>
                <Pin size={14} />
                중요 공지
              </span>
            )}
            <h1 className={styles.title}>{notice.title}</h1>
            <div className={styles.meta}>
              <Calendar size={14} />
              <span>{formatDate(notice.createdAt)}</span>
            </div>
          </div>

          {/* Content */}
          <div className={styles.content}>
            {notice.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph || '\u00A0'}</p>
            ))}
          </div>
        </article>

        {/* Footer */}
        <footer className={styles.footer}>
          <Link href="/notice" className={styles.listButton}>
            목록으로
          </Link>
        </footer>
      </div>
    </main>
  )
}
