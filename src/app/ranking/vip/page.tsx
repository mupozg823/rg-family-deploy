'use client'

import { useState, useEffect, useMemo, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Crown, Lock, Star, Heart, Play, Users, Trophy, ArrowRight, PenTool, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { useAuthContext } from '@/lib/context'
import { useRanking } from '@/lib/hooks/useRanking'
import { mockVipContent, type VipContent } from '@/lib/mock'
import { USE_MOCK_DATA } from '@/lib/config'
import styles from './page.module.css'

export default function VipLoungePage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuthContext()
  const { rankings } = useRanking()
  const [vipContent, setVipContent] = useState<VipContent | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [activeVideo, setActiveVideo] = useState<number | null>(null)

  // Mock 모드에서는 항상 VIP로 표시 (개발용)
  const userRank = useMemo(() => {
    if (USE_MOCK_DATA) return 5 // Mock: 5위로 설정
    if (!user) return null
    const userRanking = rankings.find(r => r.donorId === user.id)
    return userRanking ? rankings.indexOf(userRanking) + 1 : null
  }, [user, rankings])

  const isVip = useMemo(() => {
    if (USE_MOCK_DATA) return true // Mock: 항상 VIP
    return userRank !== null && userRank <= 50
  }, [userRank])

  const fetchVipContent = useCallback(async () => {
    setIsLoading(true)

    if (USE_MOCK_DATA) {
      setVipContent(mockVipContent)
      setIsLoading(false)
      return
    }

    // TODO: Replace with real Supabase query
    setVipContent(mockVipContent)
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

        {/* VIP SECRET - Signatures Section */}
        {vipContent?.signatures && vipContent.signatures.length > 0 && (
          <motion.section
            className={styles.signaturesSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
          >
            <div className={styles.secretHeader}>
              <div className={styles.secretBadge}>
                <Sparkles size={16} />
                <span>VIP SECRET</span>
              </div>
              <h2>VIP Exclusive Signatures</h2>
              <p>멤버들의 친필 사인</p>
            </div>
            <div className={styles.signaturesGrid}>
              {vipContent.signatures.map((sig, index) => (
                <motion.div
                  key={sig.id}
                  className={styles.signatureCard}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 + index * 0.1 }}
                >
                  <div className={styles.signaturePlaceholder}>
                    <PenTool size={24} />
                    <span className={styles.signatureName}>{sig.memberName}</span>
                  </div>
                </motion.div>
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
                    ? `${Math.floor(item.totalAmount / 10000).toLocaleString()}만 하트`
                    : `${item.totalAmount.toLocaleString()} 하트`}
                </span>
              </div>
            ))}
          </div>
        </motion.section>
      </div>
    </main>
  )
}
