'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { useLiveRoster } from '@/lib/hooks'
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
  const { members: rosterMembers, isLoading } = useLiveRoster({ realtime: true })

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

  const members: LiveMember[] = rosterMembers
    .map((member) => ({
      id: member.id,
      nickname: member.name,
      avatarUrl: member.image_url,
      isLive: Boolean(member.is_live),
      unit: member.unit,
    }))
    // 라이브 중인 멤버 먼저 정렬
    .sort((a, b) => (b.isLive ? 1 : 0) - (a.isLive ? 1 : 0))

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
        <Link href="/rg/live" className={styles.viewAll}>
          전체보기 <ChevronRight size={16} />
        </Link>
      </div>

      <div className={`${styles.grid} ${displayMembers.length <= 4 ? styles.singleRow : ''}`}>
        {displayMembers.map((member) => (
          <div key={member.id} className={styles.member}>
            <div className={`${styles.avatarWrapper} ${member.isLive ? styles.isLive : ''}`}>
              {member.isLive && (
                <span className={styles.liveBadge}>
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
