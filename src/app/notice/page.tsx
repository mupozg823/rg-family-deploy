'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Pin, ChevronRight } from 'lucide-react'
import { useSupabase } from '@/lib/hooks/useSupabase'
import { mockNotices } from '@/lib/mock/data'
import { USE_MOCK_DATA } from '@/lib/config'
import { formatShortDate } from '@/lib/utils/format'
import styles from './page.module.css'

interface NoticeItem {
  id: number
  title: string
  isPinned: boolean
  createdAt: string
}

export default function NoticePage() {
  const supabase = useSupabase()
  const [notices, setNotices] = useState<NoticeItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchNotices = useCallback(async () => {
    setIsLoading(true)

    if (USE_MOCK_DATA) {
      const sortedNotices = [...mockNotices]
        .sort((a, b) => {
          if (a.is_pinned !== b.is_pinned) return a.is_pinned ? -1 : 1
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        })
      setNotices(
        sortedNotices.map((n) => ({
          id: n.id,
          title: n.title,
          isPinned: n.is_pinned,
          createdAt: n.created_at,
        }))
      )
      setIsLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('notices')
      .select('id, title, is_pinned, created_at')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })

    if (error) {
      console.error('공지사항 로드 실패:', error)
    } else {
      setNotices(
        (data || []).map((n) => ({
          id: n.id,
          title: n.title,
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


  return (
    <main className={styles.main}>
      <header className={styles.header}>
        <h1>NOTICE</h1>
        <p>RG FAMILY 공식 공지사항</p>
      </header>

      <div className={styles.container}>
        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <span>공지사항을 불러오는 중...</span>
          </div>
        ) : notices.length === 0 ? (
          <div className={styles.empty}>
            <p>등록된 공지사항이 없습니다</p>
          </div>
        ) : (
          <div className={styles.list}>
            {notices.map((notice) => (
              <Link
                key={notice.id}
                href={`/notice/${notice.id}`}
                className={styles.item}
              >
                <div className={styles.itemContent}>
                  <div className={styles.meta}>
                    {notice.isPinned && (
                      <>
                        <span className={`${styles.badge} ${styles.pinned}`}>
                          중요
                        </span>
                        <Pin size={14} className={styles.pin} />
                      </>
                    )}
                  </div>
                  <h3 className={styles.title}>{notice.title}</h3>
                  <span className={styles.date}>{formatShortDate(notice.createdAt)}</span>
                </div>
                <ChevronRight size={20} className={styles.arrow} />
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
