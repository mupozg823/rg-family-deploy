'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Image from 'next/image'
import { Play, ChevronLeft, ChevronRight } from 'lucide-react'
import { useSupabase } from '@/lib/hooks/useSupabase'
import styles from './Shorts.module.css'

interface ShortItem {
  id: number
  title: string
  videoUrl: string
  thumbnailUrl: string
  unit: 'excel' | 'crew' | null
}

export default function Shorts() {
  const supabase = useSupabase()
  const [shorts, setShorts] = useState<ShortItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const scrollRef = useRef<HTMLDivElement>(null)

  const fetchShorts = useCallback(async () => {
    setIsLoading(true)

    const { data, error } = await supabase
      .from('media_content')
      .select('id, title, video_url, thumbnail_url, unit')
      .eq('content_type', 'shorts')
      .order('created_at', { ascending: false })
      .limit(12)

    if (error) {
      console.error('숏폼 로드 실패:', error)
    } else {
      setShorts(
        (data || []).map((s) => ({
          id: s.id,
          title: s.title,
          videoUrl: s.video_url,
          thumbnailUrl: s.thumbnail_url || '',
          unit: s.unit,
        }))
      )
    }

    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchShorts()
  }, [fetchShorts])

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = 300
      scrollRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      })
    }
  }

  const handleClick = (videoUrl: string) => {
    window.open(videoUrl, '_blank')
  }

  if (isLoading) {
    return (
      <section className={styles.section}>
        <div className={styles.header}>
          <h3>SHORTS SECTION</h3>
          <div className={styles.line} />
        </div>
        <div className={styles.loading}>로딩 중...</div>
      </section>
    )
  }

  if (shorts.length === 0) {
    return (
      <section className={styles.section}>
        <div className={styles.header}>
          <h3>SHORTS SECTION</h3>
          <div className={styles.line} />
        </div>
        <div className={styles.empty}>등록된 숏폼이 없습니다</div>
      </section>
    )
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h3>SHORTS SECTION</h3>
        <div className={styles.line} />
        <div className={styles.arrows}>
          <button onClick={() => scroll('left')} className={styles.arrowButton}>
            <ChevronLeft size={20} />
          </button>
          <button onClick={() => scroll('right')} className={styles.arrowButton}>
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div className={styles.grid} ref={scrollRef}>
        {shorts.map((item) => (
          <div
            key={item.id}
            className={styles.card}
            onClick={() => handleClick(item.videoUrl)}
          >
            <div className={styles.thumbnail}>
              {item.thumbnailUrl ? (
                <Image
                  src={item.thumbnailUrl}
                  alt={item.title}
                  fill
                  className={styles.thumbnailImage}
                />
              ) : (
                <div className={styles.thumbnailPlaceholder} />
              )}
              <div className={styles.playOverlay}>
                <Play fill="white" size={24} />
              </div>
              {item.unit && (
                <span className={`${styles.unitBadge} ${item.unit === 'crew' ? styles.crew : ''}`}>
                  {item.unit === 'excel' ? '엑셀부' : '크루부'}
                </span>
              )}
            </div>
            <div className={styles.info}>
              <p className={styles.title}>{item.title}</p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
