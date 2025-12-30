'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { Radio, ChevronRight } from 'lucide-react'
import { useSupabase } from '@/lib/hooks/useSupabase'
import { mockOrganization } from '@/lib/mock/data'
import { USE_MOCK_DATA } from '@/lib/config'
import type { JoinedProfile } from '@/types/common'
import styles from './LiveMembers.module.css'

const MAX_DISPLAY_COUNT = 8

interface LiveMember {
  id: number
  nickname: string
  avatarUrl: string | null
  isLive: boolean
  unit: 'excel' | 'crew'
}

export default function LiveMembers() {
  const supabase = useSupabase()
  const [members, setMembers] = useState<LiveMember[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchLiveMembers = useCallback(async () => {
    setIsLoading(true)

    if (USE_MOCK_DATA) {
      // Use mock data - 즉시 로드
      setMembers(
        mockOrganization.map((o) => ({
          id: o.id,
          nickname: o.name,
          avatarUrl: o.image_url,
          isLive: o.is_live,
          unit: o.unit,
        }))
      )
      setIsLoading(false)
      return
    }

    // organization 테이블에서 is_live 필드 사용
    const { data, error } = await supabase
      .from('organization')
      .select('id, name, is_live, unit, image_url, profiles(nickname, avatar_url)')
      .order('position_order')
      .limit(10)

    if (error) {
      console.error('라이브 멤버 로드 실패:', error)
    } else {
      setMembers(
        (data || []).map((o) => {
          const profile = o.profiles as JoinedProfile | null
          return {
            id: o.id,
            nickname: profile?.nickname || o.name,
            avatarUrl: profile?.avatar_url || o.image_url,
            isLive: o.is_live,
            unit: o.unit,
          }
        })
      )
    }

    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchLiveMembers()

    if (USE_MOCK_DATA) return

    // 실시간 구독 (live_status 변경 감지)
    const channel = supabase
      .channel('live_status_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'live_status' },
        () => {
          fetchLiveMembers()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, fetchLiveMembers])

  if (isLoading) {
    return (
      <section className={styles.section}>
        <div className={styles.header}>
          <h3>현재 방송중</h3>
          <div className={styles.line} />
        </div>
        <div className={styles.loading}>로딩 중...</div>
      </section>
    )
  }

  if (members.length === 0) {
    return (
      <section className={styles.section}>
        <div className={styles.header}>
          <h3>현재 방송중</h3>
          <div className={styles.line} />
        </div>
        <div className={styles.empty}>현재 라이브 중인 멤버가 없습니다</div>
      </section>
    )
  }

  const liveCount = members.filter(m => m.isLive).length
  const displayMembers = members.slice(0, MAX_DISPLAY_COUNT)
  const hasMore = members.length > MAX_DISPLAY_COUNT

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h3>현재 방송중</h3>
        <div className={styles.liveCount}>
          <span className={styles.liveCountDot} />
          {liveCount}
        </div>
        <div className={styles.line} />
        <Link href="/info/live" className={styles.viewAll}>
          전체보기 <ChevronRight size={16} />
        </Link>
      </div>

      <div className={`${styles.grid} ${displayMembers.length <= 4 ? styles.singleRow : ''}`}>
        {displayMembers.map((member) => (
          <div key={member.id} className={styles.member}>
            <div className={styles.avatarWrapper}>
              {member.isLive && (
                <span className={styles.liveBadge}>
                  <Radio size={10} />
                  LIVE
                </span>
              )}
              <div className={`${styles.avatar} ${member.isLive ? styles.avatarLive : ''} ${member.unit === 'crew' ? styles.crew : ''}`}>
                {member.avatarUrl ? (
                  <Image
                    src={member.avatarUrl}
                    alt={member.nickname}
                    fill
                    className={styles.avatarImage}
                    unoptimized
                  />
                ) : (
                  <div className={styles.avatarPlaceholder}>
                    {member.nickname.charAt(0)}
                  </div>
                )}
              </div>
            </div>
            <span className={styles.name}>{member.nickname}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
