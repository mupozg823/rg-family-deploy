'use client'

import { useEffect, useState, useCallback } from 'react'
import Image from 'next/image'
import { User } from 'lucide-react'
import { useSupabase } from '@/lib/hooks/useSupabase'
import { mockOrganization } from '@/lib/mock/data'
import styles from './LiveMembers.module.css'

interface LiveMember {
  id: number
  nickname: string
  avatarUrl: string | null
  isLive: boolean
  unit: 'excel' | 'crew'
}

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || true

export default function LiveMembers() {
  const supabase = useSupabase()
  const [members, setMembers] = useState<LiveMember[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchLiveMembers = useCallback(async () => {
    setIsLoading(true)

    if (USE_MOCK) {
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
        (data || []).map((o) => ({
          id: o.id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          nickname: (o.profiles as any)?.nickname || o.name,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          avatarUrl: (o.profiles as any)?.avatar_url || o.image_url,
          isLive: o.is_live,
          unit: o.unit,
        }))
      )
    }

    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchLiveMembers()

    if (USE_MOCK) return

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
          <h3>LIVE MEMBERS</h3>
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
          <h3>LIVE MEMBERS</h3>
          <div className={styles.line} />
        </div>
        <div className={styles.empty}>현재 라이브 중인 멤버가 없습니다</div>
      </section>
    )
  }

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h3>LIVE MEMBERS</h3>
        <div className={styles.line} />
      </div>

      <div className={`${styles.grid} ${members.length <= 5 ? styles.singleRow : ''}`}>
        {members.map((member) => (
          <div key={member.id} className={styles.member}>
            <div className={styles.avatarWrapper}>
              <div className={`${styles.avatar} ${member.unit === 'crew' ? styles.crew : ''}`}>
                {member.avatarUrl ? (
                  <Image
                    src={member.avatarUrl}
                    alt={member.nickname}
                    fill
                    className={styles.avatarImage}
                  />
                ) : (
                  <User size={24} />
                )}
              </div>
              <div className={`${styles.badge} ${member.isLive ? styles.live : ''}`}>
                <span className={styles.dot} />
                {member.isLive ? 'LIVE' : 'OFF'}
              </div>
            </div>
            <span className={styles.name}>{member.nickname}</span>
          </div>
        ))}
      </div>
    </section>
  )
}
