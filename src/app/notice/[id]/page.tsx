'use client'

import { useState, useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowLeft, Pin, Calendar, Eye, Tag, ChevronLeft, ChevronRight, Share2 } from 'lucide-react'
import { useNotices } from '@/lib/context'
import { formatDate } from '@/lib/utils/format'
import styles from './page.module.css'

interface NoticeDetail {
  id: number
  title: string
  content: string
  category: string
  thumbnailUrl: string | null
  isPinned: boolean
  viewCount: number
  createdAt: string
}

interface NavNotice {
  id: number
  title: string
}

const CATEGORY_LABELS: Record<string, string> = {
  official: '공식',
  excel: '엑셀부',
  crew: '크루부',
  event: '이벤트',
}

export default function NoticeDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const router = useRouter()
  const noticesRepo = useNotices()
  const [notice, setNotice] = useState<NoticeDetail | null>(null)
  const [prevNotice, setPrevNotice] = useState<NavNotice | null>(null)
  const [nextNotice, setNextNotice] = useState<NavNotice | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchNotice = async () => {
      setIsLoading(true)
      const currentId = parseInt(id)

      const allNotices = await noticesRepo.findAll()
      const sortedNotices = [...allNotices].sort(
        (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      )
      const found = sortedNotices.find((n) => n.id === currentId)

      if (found) {
        setNotice({
          id: found.id,
          title: found.title,
          content: found.content || '',
          category: found.category || 'official',
          thumbnailUrl: found.thumbnail_url,
          isPinned: found.is_pinned,
          viewCount: found.view_count || 0,
          createdAt: found.created_at,
        })
      }

      const currentIndex = sortedNotices.findIndex((n) => n.id === currentId)
      if (currentIndex > 0) {
        const prev = sortedNotices[currentIndex - 1]
        setNextNotice({ id: prev.id, title: prev.title })
      } else {
        setNextNotice(null)
      }

      if (currentIndex < sortedNotices.length - 1) {
        const next = sortedNotices[currentIndex + 1]
        setPrevNotice({ id: next.id, title: next.title })
      } else {
        setPrevNotice(null)
      }

      setIsLoading(false)
    }

    void fetchNotice()
  }, [noticesRepo, id])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: notice?.title,
          url: window.location.href,
        })
      } catch {
        // 사용자가 공유 취소
      }
    } else {
      await navigator.clipboard.writeText(window.location.href)
      alert('링크가 복사되었습니다.')
    }
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
      {/* Hero Section with Thumbnail */}
      <div className={styles.hero}>
        {notice.thumbnailUrl && (
          <div className={styles.heroImage}>
            <Image
              src={notice.thumbnailUrl}
              alt={notice.title}
              fill
              style={{ objectFit: 'cover' }}
              priority
              unoptimized
            />
            <div className={styles.heroOverlay} />
          </div>
        )}

        <div className={styles.heroContent}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {/* Navigation */}
            <button onClick={() => router.back()} className={styles.backButton}>
              <ArrowLeft size={18} />
              <span>목록</span>
            </button>

            {/* Badges */}
            <div className={styles.badges}>
              {notice.isPinned && (
                <span className={styles.pinnedBadge}>
                  <Pin size={12} />
                  중요
                </span>
              )}
              <span className={styles.categoryBadge} data-category={notice.category}>
                <Tag size={12} />
                {CATEGORY_LABELS[notice.category] || notice.category}
              </span>
            </div>

            {/* Title */}
            <h1 className={styles.heroTitle}>{notice.title}</h1>

            {/* Meta */}
            <div className={styles.heroMeta}>
              <span className={styles.metaItem}>
                <Calendar size={14} />
                {formatDate(notice.createdAt)}
              </span>
              <span className={styles.metaItem}>
                <Eye size={14} />
                조회 {notice.viewCount.toLocaleString()}
              </span>
            </div>
          </motion.div>
        </div>
      </div>

      <div className={styles.container}>
        {/* Article */}
        <motion.article
          className={styles.article}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className={styles.content}>
            {notice.content.split('\n').map((paragraph, index) => (
              <p key={index}>{paragraph || '\u00A0'}</p>
            ))}
          </div>

          {/* Share Button */}
          <div className={styles.actions}>
            <button onClick={handleShare} className={styles.shareBtn}>
              <Share2 size={16} />
              공유하기
            </button>
          </div>
        </motion.article>

        {/* Navigation */}
        <div className={styles.navigation}>
          {prevNotice ? (
            <Link href={`/notice/${prevNotice.id}`} className={styles.navItem}>
              <ChevronLeft size={16} />
              <div className={styles.navContent}>
                <span className={styles.navLabel}>이전 글</span>
                <span className={styles.navTitle}>{prevNotice.title}</span>
              </div>
            </Link>
          ) : (
            <div className={styles.navPlaceholder} />
          )}

          <Link href="/notice" className={styles.listBtn}>
            목록
          </Link>

          {nextNotice ? (
            <Link href={`/notice/${nextNotice.id}`} className={`${styles.navItem} ${styles.navRight}`}>
              <div className={styles.navContent}>
                <span className={styles.navLabel}>다음 글</span>
                <span className={styles.navTitle}>{nextNotice.title}</span>
              </div>
              <ChevronRight size={16} />
            </Link>
          ) : (
            <div className={styles.navPlaceholder} />
          )}
        </div>
      </div>
    </main>
  )
}
