'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Crown, Lock, Star, Heart, Play, Users, Trophy, ArrowRight } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { useSupabase } from '@/lib/hooks/useSupabase'
import { useRanking } from '@/lib/hooks/useRanking'
import styles from './page.module.css'

interface VipContent {
  memberVideos: {
    id: number
    memberName: string
    memberUnit: 'excel' | 'crew'
    thumbnailUrl: string
    videoUrl: string
    message: string
  }[]
  thankYouMessage: string
  exclusiveImages: {
    id: number
    url: string
    title: string
  }[]
}

const mockVipContent: VipContent = {
  memberVideos: [
    {
      id: 1,
      memberName: '박지윤',
      memberUnit: 'excel',
      thumbnailUrl: '/assets/members/member1.jpg',
      videoUrl: 'https://example.com/video1',
      message: 'VIP 여러분께 감사드립니다!'
    },
    {
      id: 2,
      memberName: '김서연',
      memberUnit: 'excel',
      thumbnailUrl: '/assets/members/member2.jpg',
      videoUrl: 'https://example.com/video2',
      message: '항상 응원해주셔서 감사합니다!'
    },
    {
      id: 3,
      memberName: '이수빈',
      memberUnit: 'crew',
      thumbnailUrl: '/assets/members/member3.jpg',
      videoUrl: 'https://example.com/video3',
      message: '언제나 함께해요!'
    }
  ],
  thankYouMessage: 'RG 패밀리의 VIP가 되어주셔서 진심으로 감사드립니다. 여러분의 사랑과 응원이 저희에게 큰 힘이 됩니다. 앞으로도 멋진 모습 보여드릴게요!',
  exclusiveImages: [
    { id: 1, url: '/assets/vip/exclusive1.jpg', title: 'VIP 전용 포토' },
    { id: 2, url: '/assets/vip/exclusive2.jpg', title: '비하인드 컷' },
    { id: 3, url: '/assets/vip/exclusive3.jpg', title: '특별 화보' }
  ]
}

export default function VipLoungePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth()
  const supabase = useSupabase()
  const { rankings } = useRanking()
  const [vipContent, setVipContent] = useState<VipContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeVideo, setActiveVideo] = useState<number | null>(null)

  // 현재 유저의 랭킹 확인
  const userRank = useMemo(() => {
    if (!user) return null
    const userRanking = rankings.find(r => r.donorId === user.id)
    return userRanking ? rankings.indexOf(userRanking) + 1 : null
  }, [user, rankings])

  const isVip = useMemo(() => {
    return userRank !== null && userRank <= 50
  }, [userRank])

  const fetchVipContent = useCallback(async () => {
    setIsLoading(true)

    // Mock data for now - can be replaced with Supabase query
    setVipContent(mockVipContent)

    // TODO: Replace with real Supabase query
    // const { data, error } = await supabase
    //   .from('vip_content')
    //   .select('*')

    setIsLoading(false)
  }, [])

  useEffect(() => {
    if (isVip) {
      fetchVipContent()
    } else {
      setIsLoading(false)
    }
  }, [isVip, fetchVipContent])

  // 로딩 중
  if (authLoading || isLoading) {
    return (
      <main className={styles.main}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>VIP 라운지 확인 중...</span>
        </div>
      </main>
    )
  }

  // 비로그인 상태
  if (!isAuthenticated) {
    return (
      <main className={styles.main}>
        <div className={styles.accessDenied}>
          <div className={styles.lockIcon}>
            <Lock size={48} />
          </div>
          <h1>VIP 라운지</h1>
          <p>VIP 라운지는 로그인 후 이용 가능합니다.</p>
          <Link href="/login" className={styles.loginButton}>
            로그인하기
          </Link>
        </div>
      </main>
    )
  }

  // VIP 아닌 경우 (Top 50 이외)
  if (!isVip) {
    return (
      <main className={styles.main}>
        <div className={styles.accessDenied}>
          <div className={styles.lockIcon}>
            <Lock size={48} />
          </div>
          <h1>VIP 전용 공간입니다</h1>
          <p className={styles.deniedMessage}>
            VIP 라운지는 후원 랭킹 <strong>Top 50</strong>만 입장 가능합니다.
          </p>
          {userRank && (
            <p className={styles.currentRank}>
              현재 순위: <strong>{userRank}위</strong>
            </p>
          )}
          <div className={styles.deniedActions}>
            <Link href="/ranking/total" className={styles.rankingButton}>
              <Trophy size={18} />
              랭킹 확인하기
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.main}>
      {/* Hero */}
      <div className={styles.hero}>
        <motion.div
          className={styles.heroContent}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className={styles.vipBadge}>
            <Crown size={20} />
            <span>VIP LOUNGE</span>
          </div>
          <h1 className={styles.heroTitle}>
            환영합니다, VIP!
          </h1>
          <p className={styles.heroSubtitle}>
            {user?.user_metadata?.nickname || '후원자'}님은 현재{' '}
            <strong>{userRank}위</strong>입니다
          </p>
        </motion.div>

        <div className={styles.heroDecoration}>
          <div className={styles.glow} />
          <Star className={styles.star1} size={24} />
          <Star className={styles.star2} size={16} />
          <Star className={styles.star3} size={20} />
        </div>
      </div>

      <div className={styles.container}>
        {/* Thank You Message */}
        {vipContent?.thankYouMessage && (
          <motion.section
            className={styles.messageSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
          >
            <div className={styles.sectionHeader}>
              <Heart size={20} />
              <h2>FROM RG FAMILY</h2>
            </div>
            <div className={styles.messageCard}>
              <p>{vipContent.thankYouMessage}</p>
            </div>
          </motion.section>
        )}

        {/* Member Videos */}
        {vipContent?.memberVideos && vipContent.memberVideos.length > 0 && (
          <motion.section
            className={styles.videosSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <div className={styles.sectionHeader}>
              <Play size={20} />
              <h2>멤버 감사 영상</h2>
            </div>
            <div className={styles.videosGrid}>
              {vipContent.memberVideos.map((video) => (
                <div
                  key={video.id}
                  className={styles.videoCard}
                  onClick={() => setActiveVideo(video.id)}
                >
                  <div className={styles.videoThumbnail}>
                    <div className={styles.videoPlaceholder}>
                      <Play size={32} />
                    </div>
                    <div
                      className={styles.unitBadge}
                      data-unit={video.memberUnit}
                    >
                      {video.memberUnit === 'excel' ? 'EXCEL' : 'CREW'}
                    </div>
                  </div>
                  <div className={styles.videoInfo}>
                    <h3>{video.memberName}</h3>
                    <p>{video.message}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.section>
        )}

        {/* Top 3 Secret Page Banner */}
        {userRank && userRank <= 3 && (
          <motion.section
            className={styles.secretBanner}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3 }}
          >
            <div className={styles.secretContent}>
              <Crown size={32} className={styles.secretIcon} />
              <div>
                <h3>Top {userRank} 특별 페이지</h3>
                <p>당신만을 위한 특별한 헌정 페이지가 준비되어 있습니다</p>
              </div>
              <Link
                href={`/ranking/vip/${user?.id}`}
                className={styles.secretLink}
              >
                입장하기
                <ArrowRight size={18} />
              </Link>
            </div>
          </motion.section>
        )}

        {/* VIP Members List */}
        <motion.section
          className={styles.membersSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className={styles.sectionHeader}>
            <Users size={20} />
            <h2>VIP 멤버 (Top 50)</h2>
          </div>
          <div className={styles.membersList}>
            {rankings.slice(0, 50).map((item, index) => (
              <div
                key={item.donorId || index}
                className={`${styles.memberItem} ${item.donorId === user?.id ? styles.currentUser : ''}`}
              >
                <span className={styles.memberRank} data-rank={index + 1}>
                  {index < 3 ? (
                    <Crown size={14} />
                  ) : (
                    index + 1
                  )}
                </span>
                <span className={styles.memberName}>{item.donorName}</span>
                <span className={styles.memberAmount}>
                  {item.totalAmount >= 10000
                    ? `${Math.floor(item.totalAmount / 10000).toLocaleString()}만`
                    : item.totalAmount.toLocaleString()}
                </span>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </main>
  )
}
