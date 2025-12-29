'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { Play } from 'lucide-react'
import { useSupabase } from '@/lib/hooks/useSupabase'
import { mockMediaContent } from '@/lib/mock/data'
import { USE_MOCK_DATA } from '@/lib/config'
import { formatShortDate } from '@/lib/utils/format'
import styles from './VOD.module.css'

interface VodItem {
  id: number
  title: string
  description: string
  videoUrl: string
  thumbnailUrl: string
  unit: 'excel' | 'crew' | null
  createdAt: string
}

export default function VOD() {
  const supabase = useSupabase()
  const [vods, setVods] = useState<VodItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchVods = useCallback(async () => {
    setIsLoading(true)

    if (USE_MOCK_DATA) {
      // 즉시 로드
      const vodsData = mockMediaContent
        .filter((m) => m.content_type === 'vod')
        .slice(0, 4)
      setVods(
        vodsData.map((v) => ({
          id: v.id,
          title: v.title,
          description: v.description || '',
          videoUrl: v.video_url,
          thumbnailUrl: v.thumbnail_url || '',
          unit: v.unit,
          createdAt: v.created_at,
        }))
      )
      setIsLoading(false)
      return
    }

    const { data, error } = await supabase
      .from('media_content')
      .select('id, title, description, video_url, thumbnail_url, unit, created_at')
      .eq('content_type', 'vod')
      .order('created_at', { ascending: false })
      .limit(4)

    if (error) {
      console.error('VOD 로드 실패:', error)
    } else {
      setVods(
        (data || []).map((v) => ({
          id: v.id,
          title: v.title,
          description: v.description || '',
          videoUrl: v.video_url,
          thumbnailUrl: v.thumbnail_url || '',
          unit: v.unit,
          createdAt: v.created_at,
        }))
      )
    }

    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchVods()
  }, [fetchVods])


  const handleClick = (videoUrl: string) => {
    window.open(videoUrl, '_blank')
  }

  if (isLoading) {
    return (
      <section className={styles.section}>
        <div className={styles.header}>
          <h3>VOD SECTION</h3>
          <div className={styles.line} />
        </div>
        <div className={styles.loading}>로딩 중...</div>
      </section>
    )
  }

  if (vods.length === 0) {
    return (
      <section className={styles.section}>
        <div className={styles.header}>
          <h3>VOD SECTION</h3>
          <div className={styles.line} />
        </div>
        <div className={styles.empty}>등록된 VOD가 없습니다</div>
      </section>
    )
  }

  const [featured, ...rest] = vods

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h3>VOD SECTION</h3>
        <div className={styles.line} />
      </div>

      <div className={styles.container}>
        {/* Large Featured VOD */}
        <div className={styles.featured} onClick={() => handleClick(featured.videoUrl)}>
          <div className={styles.featuredThumb}>
            {featured.thumbnailUrl ? (
              <Image
                src={featured.thumbnailUrl}
                alt={featured.title}
                fill
                className={styles.featuredImage}
              />
            ) : (
              <div className={styles.featuredPlaceholder} />
            )}
            <Play size={48} className={styles.playIcon} />
          </div>
          <div className={styles.featuredInfo}>
            {featured.unit && (
              <span className={`${styles.unitBadge} ${featured.unit === 'crew' ? styles.crew : ''}`}>
                {featured.unit === 'excel' ? '엑셀부' : '크루부'}
              </span>
            )}
            <h4>{featured.title}</h4>
            <p>{featured.description}</p>
            <span className={styles.date}>{formatShortDate(featured.createdAt)}</span>
          </div>
        </div>

        {/* List of Smaller VODs */}
        <div className={styles.list}>
          {rest.map((item) => (
            <div
              key={item.id}
              className={styles.item}
              onClick={() => handleClick(item.videoUrl)}
            >
              <div className={styles.itemThumb}>
                {item.thumbnailUrl ? (
                  <Image
                    src={item.thumbnailUrl}
                    alt={item.title}
                    fill
                    className={styles.itemImage}
                  />
                ) : (
                  <div className={styles.itemPlaceholder} />
                )}
              </div>
              <div className={styles.itemInfo}>
                {item.unit && (
                  <span className={`${styles.category} ${item.unit === 'crew' ? styles.crew : ''}`}>
                    {item.unit === 'excel' ? '엑셀부' : '크루부'}
                  </span>
                )}
                <h5>{item.title}</h5>
                <span className={styles.dateSmall}>{formatShortDate(item.createdAt)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
