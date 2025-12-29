'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { motion } from 'framer-motion'
import { Play, Download, User, Crown, Calendar, Gift, MessageCircle } from 'lucide-react'
import Image from 'next/image'
import { useSupabase } from '@/lib/hooks/useSupabase'
import type { VipPageData } from '@/types/common'
import styles from './page.module.css'

export default function VipPage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params)
  const supabase = useSupabase()
  const [data, setData] = useState<VipPageData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  const fetchVipData = useCallback(async () => {
    setIsLoading(true)

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

      setData({
        profile: {
          id: profile.id,
          nickname: profile.nickname,
          avatarUrl: profile.avatar_url,
          totalDonation: profile.total_donation,
        },
        reward: reward ? {
          seasonId: reward.season_id,
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          seasonName: (reward.seasons as any)?.name || '',
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
      {/* Hero Section */}
      <div className={styles.hero}>
        <motion.div
          className={styles.heroContent}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {/* Season Badge */}
          {data.reward.seasonName && (
            <span className={styles.seasonBadge}>
              <Calendar size={14} />
              {data.reward.seasonName} VIP
            </span>
          )}

          {/* Avatar */}
          <div className={styles.avatar}>
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
            {data.reward.rank <= 3 && (
              <div className={styles.rankBadge} data-rank={data.reward.rank}>
                <Crown size={16} />
                <span>{data.reward.rank}</span>
              </div>
            )}
          </div>

          {/* Name & Stats */}
          <h1 className={styles.name}>{data.profile.nickname}</h1>
          <p className={styles.stats}>
            총 후원: <strong>{formatAmount(data.profile.totalDonation)}</strong>
            {data.reward.rank > 0 && (
              <span className={styles.rank}> (랭킹 {data.reward.rank}위)</span>
            )}
          </p>
        </motion.div>

        {/* Background Decoration */}
        <div className={styles.heroDecoration}>
          <div className={styles.glow} />
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

        {/* Gift Images */}
        {data.images.length > 0 && (
          <motion.section
            className={styles.imagesSection}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className={styles.sectionHeader}>
              <Gift size={20} />
              <h2>스페셜 기프트 이미지</h2>
            </div>
            <div className={styles.imagesGrid}>
              {data.images.map((image) => (
                <a
                  key={image.id}
                  href={image.imageUrl}
                  download
                  className={styles.imageCard}
                >
                  <Image
                    src={image.imageUrl}
                    alt={image.title || 'Gift Image'}
                    fill
                    className={styles.giftImage}
                  />
                  <div className={styles.imageOverlay}>
                    <Download size={24} />
                    {image.title && <span>{image.title}</span>}
                  </div>
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
                      "{donation.message}"
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
