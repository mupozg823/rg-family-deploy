'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { Pin, ChevronRight } from 'lucide-react'
import { useSupabase } from '@/lib/hooks/useSupabase'
import { mockNotices } from '@/lib/mock/data'
import styles from './Notice.module.css'

interface NoticeItem {
  id: number
  title: string
  content: string
  isPinned: boolean
  createdAt: string
}

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || true

export default function Notice() {
  const supabase = useSupabase()
  const [notices, setNotices] = useState<NoticeItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchNotices = useCallback(async () => {
    setIsLoading(true)

    if (USE_MOCK) {
      // 즉시 로드
      const sorted = [...mockNotices]
        .sort((a, b) => {
          if (a.is_pinned !== b.is_pinned) return b.is_pinned ? 1 : -1
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
        .slice(0, 3)
      setNotices(
        sorted.map((n) => ({
          id: n.id,
          title: n.title,
          content: n.content || '',
          isPinned: n.is_pinned,
          createdAt: n.created_at,
        }))
      )
      setIsLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('notices')
      .select('id, title, content, is_pinned, created_at')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .limit(3)

    if (error) {
      console.error('공지사항 로드 실패:', error)
    } else {
      setNotices(
        (data || []).map((n) => ({
          id: n.id,
          title: n.title,
          content: n.content || '',
          isPinned: n.is_pinned,
          createdAt: n.created_at,
        }))
      )
    }

    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchNotices()
  }, [fetchNotices])

  const getPreviewLines = (content: string, maxLines: number = 2) => {
    return content.split('\n').slice(0, maxLines)
  }

  if (isLoading) {
    return (
      <section className={styles.section}>
        <div className={styles.header}>
          <h3>전체 공지 (NOTICE)</h3>
          <div className={styles.line} />
        </div>
        <div className={styles.loading}>로딩 중...</div>
      </section>
    )
  }

  if (notices.length === 0) {
    return (
      <section className={styles.section}>
        <div className={styles.header}>
          <h3>전체 공지 (NOTICE)</h3>
          <div className={styles.line} />
        </div>
        <div className={styles.empty}>등록된 공지사항이 없습니다</div>
      </section>
    )
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h3>전체 공지 (NOTICE)</h3>
        <div className={styles.line} />
        <Link href="/notice" className={styles.viewAll}>
          전체보기 <ChevronRight size={16} />
        </Link>
      </div>

      <div className={styles.list}>
        {notices.map((notice) => (
          <Link
            key={notice.id}
            href={`/notice/${notice.id}`}
            className={styles.item}
          >
            {notice.isPinned && (
              <div className={styles.pinBadge}>
                <Pin size={18} className={styles.pin} />
              </div>
            )}
            <div className={styles.itemHeader}>
              <span
                className={styles.tag}
                style={{ color: notice.isPinned ? '#ff5555' : 'var(--color-primary)' }}
              >
                {notice.isPinned ? '중요 공지' : '전체 공지'}
              </span>
            </div>
            <div className={styles.content}>
              {getPreviewLines(notice.content).map((line, idx) => (
                <p key={idx}>{line || '\u00A0'}</p>
              ))}
            </div>
            <span className={styles.more}>자세히 보기</span>
          </Link>
        ))}
      </div>
    </section>
  )
}
