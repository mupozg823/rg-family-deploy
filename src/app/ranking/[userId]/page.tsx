'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import { Play, Download, User, Crown, Calendar, Gift, MessageCircle, ArrowLeft, Trophy, Star } from 'lucide-react'
import Image from 'next/image'
import { useSupabaseContext } from '@/lib/context'
import { USE_MOCK_DATA } from '@/lib/config'
import {
  mockProfiles,
  mockVipRewards,
  getVipRewardByProfileId,
  getVipTributeByUserId,
  isTop3Rank,
} from '@/lib/mock'
import type { VipPageData, VipTributeData, JoinedSeason } from '@/types/common'
import {
  TributeHero,
  TributeMessage,
  TributeGallery,
  TributeDonationTimeline,
  TributeBadge,
} from '@/components/tribute'
import styles from './page.module.css'

export default function VipPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params)
  const supabase = useSupabaseContext()
  const [data, setData] = useState<VipPageData | null>(null)
  const [tributeData, setTributeData] = useState<VipTributeData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  const fetchVipData = useCallback(async () => {
    setIsLoading(true)

    // Mock 데이터 모드
    if (USE_MOCK_DATA) {
      // 먼저 Top 1-3 Tribute 데이터 확인
      const tribute = getVipTributeByUserId(userId)
      if (tribute) {
        setTributeData(tribute)
        setIsLoading(false)
        return
      }

      // 일반 VIP 데이터
      const mockProfile = mockProfiles.find(p => p.id === userId) || mockProfiles[0]
      const mockReward = getVipRewardByProfileId(userId) || mockVipRewards[0]

      setData({
        profile: {
          id: mockProfile.id,
          nickname: mockProfile.nickname,
          avatarUrl: mockProfile.avatar_url || null,
          totalDonation: mockProfile.total_donation,
        },
        reward: {
          seasonId: mockReward.seasonId,
          seasonName: '시즌 4',
          rank: mockReward.rank,
          personalMessage: mockReward.personalMessage,
          dedicationVideoUrl: mockReward.dedicationVideoUrl,
        },
        images: mockReward.giftImages.map(img => ({
          id: img.id,
          imageUrl: img.url,
          title: img.title,
        })),
        donationHistory: [],
      })
      setIsLoading(false)
      return
    }

    try {
      // 프로필 정보
      const { data: profile } = await supabase
        .from('profiles')
        .select('id, nickname, avatar_url, total_donation')
        .eq('id', userId)
        .single()

      if (!profile) {
        setIsLoading(false)
        return
      }

      // VIP 보상 정보
      const { data: reward } = await supabase
        .from('vip_rewards')
        .select('*, seasons(name)')
        .eq('profile_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single()

      // Top 3 체크 - Supabase 환경에서도 Tribute 페이지 지원
      if (reward && isTop3Rank(reward.rank)) {
        // TODO: Supabase에서 Tribute 데이터 구조 구현
        // 현재는 Mock 데이터만 지원
      }

      // VIP 이미지
      const { data: images } = await supabase
        .from('vip_images')
        .select('*')
        .eq('reward_id', reward?.id || 0)
        .order('order_index')

      // 후원 히스토리
      const { data: donations } = await supabase
        .from('donations')
        .select('id, amount, message, created_at')
        .eq('donor_id', userId)
        .order('created_at', { ascending: false })
        .limit(10)

      const rewardSeason = reward?.seasons as JoinedSeason | null
      setData({
        profile: {
          id: profile.id,
          nickname: profile.nickname,
          avatarUrl: profile.avatar_url,
          totalDonation: profile.total_donation,
        },
        reward: reward ? {
          seasonId: reward.season_id,
          seasonName: rewardSeason?.name || '',
          rank: reward.rank,
          personalMessage: reward.personal_message,
          dedicationVideoUrl: reward.dedication_video_url,
        } : {
          seasonId: 0,
          seasonName: '',
          rank: 0,
          personalMessage: null,
          dedicationVideoUrl: null,
        },
        images: (images || []).map(img => ({
          id: img.id,
          imageUrl: img.image_url,
          title: img.title,
        })),
        donationHistory: (donations || []).map(d => ({
          id: d.id,
          amount: d.amount,
          message: d.message,
          createdAt: d.created_at,
        })),
      })
    } catch (error) {
      console.error('VIP 데이터 로드 실패:', error)
    }

    setIsLoading(false)
  }, [supabase, userId])

  useEffect(() => {
    fetchVipData()
  }, [fetchVipData])

  // 하트 단위로 표시 (팬더티비 후원 형식)
  const formatAmount = (amount: number) => {
    if (amount >= 100000000) {
      return `${(amount / 100000000).toFixed(1)}억 하트`
    }
    if (amount >= 10000) {
      return `${Math.floor(amount / 10000).toLocaleString()}만 하트`
    }
    return `${amount.toLocaleString()} 하트`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  if (isLoading) {
    return (
      <main className={styles.main}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>VIP 페이지를 불러오는 중...</span>
        </div>
      </main>
    )
  }

  // ========================================
  // Top 1-3 Tribute Page (특별 헌정 페이지)
  // ========================================
  if (tributeData) {
    return (
      <main className={`${styles.main} ${styles.tributeMain}`}>
        {/* Tribute Hero */}
        <TributeHero
          profile={tributeData.profile}
          theme={tributeData.theme}
          rank={tributeData.rank}
          seasonName={tributeData.seasonName}
        />

        {/* Special Badges */}
        <motion.div
          className={styles.badgesSection}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className={styles.badgesContainer}>
            {tributeData.specialBadges.map((badge, index) => (
              <TributeBadge
                key={index}
                theme={tributeData.theme}
                label={badge}
                variant="glow"
                size="md"
              />
            ))}
          </div>
        </motion.div>

        {/* Personal Message */}
        <TributeMessage
          message={tributeData.personalMessage}
          signature={tributeData.streamerSignature}
          theme={tributeData.theme}
        />

        {/* Exclusive Gallery */}
        {tributeData.exclusiveGallery.length > 0 && (
          <TributeGallery
            images={tributeData.exclusiveGallery}
            theme={tributeData.theme}
          />
        )}

        {/* Donation Timeline */}
        {tributeData.donationTimeline.length > 0 && (
          <TributeDonationTimeline
            donations={tributeData.donationTimeline}
            theme={tributeData.theme}
          />
        )}
      </main>
    )
  }

  // ========================================
  // Regular VIP Page (일반 VIP 페이지)
  // ========================================
  if (!data) {
    return (
      <main className={styles.main}>
        <div className={styles.empty}>
          <p>VIP 정보를 찾을 수 없습니다</p>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.main}>
      {/* Page Navigation - Reference Style */}
      <nav className={styles.pageNav}>
        <Link href="/ranking/vip" className={styles.backBtn}>
          <ArrowLeft size={18} />
          <span>VIP</span>
        </Link>
        <div className={styles.navTitle}>
          <Crown size={16} />
          <span>VIP LOUNGE</span>
        </div>
        <div className={styles.navActions}>
          <Link href="/ranking" className={styles.navBtn}>
            <Trophy size={16} />
            <span>랭킹</span>
          </Link>
        </div>
      </nav>

      {/* Hero Section - Welcome Area */}
      <div className={styles.hero}>
        <motion.div
          className={styles.heroContent}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Welcome Text */}
          <motion.span
            className={styles.welcomeText}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            Welcome, VIP
          </motion.span>

          {/* Season Badge */}
          {data.reward.seasonName && (
            <motion.span
              className={styles.seasonBadge}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.3 }}
            >
              <Calendar size={14} />
              {data.reward.seasonName}
            </motion.span>
          )}

          {/* Avatar */}
          <motion.div
            className={styles.avatar}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: 'spring', stiffness: 200 }}
          >
            {data.profile.avatarUrl ? (
              <Image
                src={data.profile.avatarUrl}
                alt={data.profile.nickname}
                fill
                className={styles.avatarImage}
              />
            ) : (
              <User size={48} />
            )}
            {data.reward.rank > 0 && (
              <div className={styles.rankBadge}>
                <Crown size={16} />
                <span>VIP</span>
              </div>
            )}
          </motion.div>

          {/* Name & Stats */}
          <motion.h1
            className={styles.name}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            {data.profile.nickname}
          </motion.h1>
          <motion.p
            className={styles.stats}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            총 후원: <strong>{formatAmount(data.profile.totalDonation)}</strong>
            {data.reward.rank > 0 && (
              <span className={styles.rank}> (랭킹 {data.reward.rank}위)</span>
            )}
          </motion.p>
        </motion.div>

        {/* Background Decoration - Particles & Glow */}
        <div className={styles.heroDecoration}>
          <div className={styles.glow} />
          <div className={styles.particles}>
            {[...Array(8)].map((_, i) => (
              <div key={i} className={styles.particle} />
            ))}
          </div>
          <div className={styles.rings}>
            <div className={styles.ring} />
            <div className={styles.ring} />
            <div className={styles.ring} />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className={styles.container}>
        <div className={styles.grid}>
          {/* Personal Message */}
          {data.reward.personalMessage && (
            <motion.section
              className={styles.messageSection}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className={styles.sectionHeader}>
                <MessageCircle size={20} />
                <h2>TO. {data.profile.nickname}</h2>
              </div>
              <div className={styles.messageCard}>
                <p className={styles.messageText}>{data.reward.personalMessage}</p>
              </div>
            </motion.section>
          )}

          {/* Dedication Video */}
          {data.reward.dedicationVideoUrl && (
            <motion.section
              className={styles.videoSection}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className={styles.sectionHeader}>
                <Play size={20} />
                <h2>헌정 영상</h2>
              </div>
              <div className={styles.videoWrapper}>
                {isVideoPlaying ? (
                  <video
                    src={data.reward.dedicationVideoUrl}
                    controls
                    autoPlay
                    className={styles.video}
                  />
                ) : (
                  <div className={styles.videoThumbnail}>
                    <button
                      onClick={() => setIsVideoPlaying(true)}
                      className={styles.playButton}
                    >
                      <Play size={32} fill="white" />
                    </button>
                  </div>
                )}
              </div>
            </motion.section>
          )}
        </div>

        {/* Gift Images / VIP Exclusive Signatures */}
        {data.images.length > 0 && (
          <motion.section
            className={styles.imagesSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className={styles.sectionHeader}>
              <Gift size={20} />
              <h2>VIP Exclusive Signatures</h2>
            </div>
            <div className={styles.imagesGrid}>
              {data.images.map((image) => (
                <a
                  key={image.id}
                  href={image.imageUrl}
                  download
                  className={styles.imageCard}
                >
                  <div className={styles.giftImageWrapper}>
                    <Image
                      src={image.imageUrl}
                      alt={image.title || 'Signature'}
                      fill
                      className={styles.giftImage}
                    />
                    <div className={styles.imageOverlay}>
                      <Download size={24} />
                      <span>다운로드</span>
                    </div>
                  </div>
                  {image.title && (
                    <div className={styles.imageCardTitle}>
                      <span>{image.title}</span>
                    </div>
                  )}
                </a>
              ))}
            </div>
          </motion.section>
        )}

        {/* Donation History */}
        {data.donationHistory.length > 0 && (
          <motion.section
            className={styles.historySection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <div className={styles.sectionHeader}>
              <Calendar size={20} />
              <h2>후원 히스토리</h2>
            </div>
            <div className={styles.historyList}>
              {data.donationHistory.map((donation) => (
                <div key={donation.id} className={styles.historyItem}>
                  <span className={styles.historyDate}>
                    {formatDate(donation.createdAt)}
                  </span>
                  <span className={styles.historyAmount}>
                    {formatAmount(donation.amount)}
                  </span>
                  {donation.message && (
                    <span className={styles.historyMessage}>
                      &quot;{donation.message}&quot;
                    </span>
                  )}
                </div>
              ))}
            </div>
          </motion.section>
        )}
      </div>
    </main>
  )
}
