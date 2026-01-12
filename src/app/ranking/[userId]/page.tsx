'use client'

import { useState, useEffect, useCallback, use } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Link from 'next/link'
import Image from 'next/image'
import {
  Crown,
  Play,
  Heart,
  ArrowLeft,
  Trophy,
  Star,
  Sparkles,
  Film,
  Download,
  Video,
  ImageIcon,
  Upload,
  Lock,
  LogIn,
  ShieldX,
} from 'lucide-react'
import Footer from '@/components/Footer'
import { useSupabaseContext, useAuthContext } from '@/lib/context'
import { USE_MOCK_DATA } from '@/lib/config'
import {
  mockProfiles,
  mockVipRewards,
  getVipRewardByProfileId,
  getHallOfFameByUserId,
  type HallOfFameHonor,
} from '@/lib/mock'
import {
  checkTributePageAccess,
  getAccessDeniedMessage,
  type AccessDeniedReason,
} from '@/lib/auth/access-control'
import styles from './page.module.css'

export default function TributePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params)
  const supabase = useSupabaseContext()
  const { user, profile, isLoading: authLoading } = useAuthContext()
  const [hallOfFameData, setHallOfFameData] = useState<HallOfFameHonor[] | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showGate, setShowGate] = useState(true)
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)
  const [accessDenied, setAccessDenied] = useState<AccessDeniedReason | null>(null)

  // 접근 제어 확인
  useEffect(() => {
    if (authLoading) return

    const accessResult = checkTributePageAccess(userId, user, profile)
    if (!accessResult.hasAccess && accessResult.reason) {
      setAccessDenied(accessResult.reason)
      setIsLoading(false)
    } else {
      setAccessDenied(null)
    }
  }, [userId, user, profile, authLoading])

  // 2.5초 후 자동으로 게이트 열림
  useEffect(() => {
    if (accessDenied) return // 접근 거부 시 게이트 애니메이션 스킵
    const timer = setTimeout(() => {
      setShowGate(false)
    }, 2500)
    return () => clearTimeout(timer)
  }, [accessDenied])

  const fetchTributeData = useCallback(async () => {
    // 접근 거부 상태면 데이터 로드 스킵
    if (accessDenied) {
      setIsLoading(false)
      return
    }

    setIsLoading(true)

    // Mock 데이터 모드
    if (USE_MOCK_DATA) {
      // 명예의 전당 데이터 확인 (시즌 TOP 3 + 회차별 고액 후원자)
      const hofData = getHallOfFameByUserId(userId)
      if (hofData && hofData.length > 0) {
        setHallOfFameData(hofData)
        setIsLoading(false)
        return
      }

      // 일반 VIP 데이터 (fallback)
      const mockProfile = mockProfiles.find(p => p.id === userId) || mockProfiles[0]
      const mockReward = getVipRewardByProfileId(userId) || mockVipRewards[0]

      // 일반 VIP도 HallOfFame 형식으로 변환
      const fallbackHofData: HallOfFameHonor[] = [{
        id: `fallback-${mockProfile.id}`,
        donorId: mockProfile.id,
        donorName: mockProfile.nickname,
        donorAvatar: mockProfile.avatar_url || '',
        honorType: 'season_top3',
        rank: mockReward?.rank || 1,
        seasonId: 4,
        seasonName: '시즌 4',
        amount: mockProfile.total_donation,
        unit: mockProfile.unit as 'excel' | 'crew' | null,
        tributeMessage: mockReward?.personalMessage ?? undefined,
        tributeVideoUrl: mockReward?.dedicationVideoUrl ?? undefined,
        tributeImageUrl: mockReward?.giftImages?.[0]?.url,
        createdAt: new Date().toISOString(),
      }]
      setHallOfFameData(fallbackHofData)
      setIsLoading(false)
      return
    }

    // Supabase 모드 (TODO: 실제 구현)
    try {
      // 프로필 정보
      const { data: profileData } = await supabase
        .from('profiles')
        .select('id, nickname, avatar_url, total_donation')
        .eq('id', userId)
        .single()

      if (!profileData) {
        setIsLoading(false)
        return
      }

      // TODO: Supabase에서 Hall of Fame 데이터 구조 구현
      setIsLoading(false)
    } catch (error) {
      console.error('Tribute 데이터 로드 실패:', error)
      setIsLoading(false)
    }
  }, [supabase, userId, accessDenied])

  useEffect(() => {
    if (!authLoading && !accessDenied) {
      fetchTributeData()
    }
  }, [fetchTributeData, authLoading, accessDenied])

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

  // 인증 로딩 중
  if (authLoading) {
    return (
      <div className={styles.main}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>인증 확인 중...</span>
        </div>
        <Footer />
      </div>
    )
  }

  // 접근 거부
  if (accessDenied) {
    const { title, description } = getAccessDeniedMessage(accessDenied)
    const IconComponent = accessDenied === 'not_authenticated' ? LogIn : accessDenied === 'not_owner' ? ShieldX : Lock

    return (
      <div className={styles.main}>
        <div className={styles.accessDenied}>
          <motion.div
            className={styles.accessDeniedContent}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={styles.accessDeniedIcon}>
              <IconComponent size={48} />
            </div>
            <h2>{title}</h2>
            <p>{description}</p>
            <div className={styles.accessDeniedActions}>
              {accessDenied === 'not_authenticated' ? (
                <Link href="/login" className={styles.primaryBtn}>
                  <LogIn size={18} />
                  <span>로그인하기</span>
                </Link>
              ) : (
                <Link href="/ranking" className={styles.backBtn}>
                  <ArrowLeft size={18} />
                  <span>랭킹으로 돌아가기</span>
                </Link>
              )}
            </div>
          </motion.div>
        </div>
        <Footer />
      </div>
    )
  }

  // 로딩 중
  if (isLoading) {
    return (
      <div className={styles.main}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>헌정 페이지 확인 중...</span>
        </div>
        <Footer />
      </div>
    )
  }

  // 데이터 없음
  if (!hallOfFameData || hallOfFameData.length === 0) {
    return (
      <div className={styles.main}>
        <div className={styles.empty}>
          <Crown size={48} />
          <p>헌정 페이지 정보를 찾을 수 없습니다</p>
          <Link href="/ranking" className={styles.backBtn}>
            <ArrowLeft size={18} />
            <span>랭킹으로 돌아가기</span>
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const primaryHonor = hallOfFameData[0]
  const isSeasonTop3 = primaryHonor.honorType === 'season_top3'
  const badgeText = isSeasonTop3
    ? `${primaryHonor.seasonName} TOP ${primaryHonor.rank}`
    : 'LEGENDARY SUPPORTER'

  return (
      <div className={styles.main}>
        {/* Entrance Gate Animation */}
        <AnimatePresence>
          {showGate && (
            <motion.div
              className={styles.gateOverlay}
              initial={{ opacity: 1 }}
              exit={{ opacity: 0, scale: 1.1, filter: 'blur(10px)' }}
              transition={{ duration: 0.8 }}
              onClick={() => setShowGate(false)}
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 1.5, opacity: 0 }}
                transition={{ duration: 0.5 }}
                className={styles.gateIcon}
              >
                <Crown size={80} strokeWidth={1} />
              </motion.div>
              <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                exit={{ y: -20, opacity: 0 }}
                transition={{ delay: 0.2 }}
                className={styles.gateText}
              >
                TRIBUTE PAGE
              </motion.div>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ delay: 0.4 }}
                className={styles.gateSubtext}
              >
                {primaryHonor.donorName}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Navigation Bar */}
        <nav className={styles.pageNav}>
          <Link href="/ranking" className={styles.backBtn}>
            <ArrowLeft size={18} />
            <span>랭킹</span>
          </Link>
          <div className={styles.navTitle}>
            <Trophy size={18} />
            <span>TRIBUTE PAGE</span>
          </div>
          <div className={styles.navActions}>
            <Link href="/ranking" className={styles.navBtn}>
              <Trophy size={16} />
              <span>랭킹</span>
            </Link>
            <Link href="/" className={styles.navBtn}>
              <span>홈</span>
            </Link>
          </div>
        </nav>

        {/* Hero */}
        <div className={styles.hero}>
          <motion.div
            className={styles.heroContent}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className={styles.vipBadge}>
              {isSeasonTop3 ? <Crown size={20} /> : <Star size={20} />}
              <span>{badgeText}</span>
            </div>
            <h1 className={styles.heroTitle}>{primaryHonor.donorName}</h1>
            <p className={styles.heroSubtitle}>
              총 후원: <strong>{formatAmount(primaryHonor.amount)}</strong>
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
          {primaryHonor.tributeMessage && (
            <motion.section
              className={styles.messageSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <div className={styles.sectionHeader}>
                <Heart size={20} />
                <h2>TO. {primaryHonor.donorName}</h2>
              </div>
              <div className={styles.messageCard}>
                <p>{primaryHonor.tributeMessage}</p>
              </div>
            </motion.section>
          )}

          {/* Exclusive Content - Tribute Video */}
          {primaryHonor.tributeVideoUrl && (
            <motion.section
              className={styles.exclusiveSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
            >
              <div className={styles.sectionHeader}>
                <Film size={20} />
                <h2>EXCLUSIVE VIDEO</h2>
              </div>
              <div className={styles.exclusiveContent}>
                <div className={styles.exclusiveInner}>
                  <div
                    className={styles.exclusiveVideo}
                    onClick={() => setIsVideoPlaying(true)}
                  >
                    {isVideoPlaying ? (
                      <video
                        src={primaryHonor.tributeVideoUrl}
                        controls
                        autoPlay
                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                      />
                    ) : (
                      <>
                        <div className={styles.exclusiveBadge}>
                          <Crown size={12} />
                          TRIBUTE
                        </div>
                        <button className={styles.exclusivePlayBtn}>
                          <Play size={32} />
                        </button>
                        <span className={styles.exclusiveLabel}>
                          {primaryHonor.donorName} 헌정 영상
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </motion.section>
          )}

          {/* Member Thank You Videos */}
          {primaryHonor.memberVideos && primaryHonor.memberVideos.length > 0 && (
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
                {primaryHonor.memberVideos.map((video) => (
                  <div key={video.id} className={styles.videoCard}>
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

          {/* Member Videos Empty State (Admin Upload Placeholder) */}
          {(!primaryHonor.memberVideos || primaryHonor.memberVideos.length === 0) && (
            <motion.section
              className={styles.emptySection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className={styles.emptySectionContent}>
                <Video size={32} />
                <h3>멤버 감사 영상</h3>
                <p>아직 등록된 감사 영상이 없습니다</p>
                <span className={styles.adminHint}>Admin에서 영상을 업로드할 수 있습니다</span>
              </div>
            </motion.section>
          )}

          {/* Tribute Images Gallery */}
          {primaryHonor.tributeImages && primaryHonor.tributeImages.length > 0 && (
            <motion.section
              className={styles.gallerySection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <div className={styles.sectionHeader}>
                <ImageIcon size={20} />
                <h2>감사 포토</h2>
              </div>
              <div className={styles.galleryGrid}>
                {primaryHonor.tributeImages.map((imageUrl, index) => (
                  <a
                    key={index}
                    href={imageUrl}
                    download
                    className={styles.galleryCard}
                  >
                    <Image
                      src={imageUrl}
                      alt={`Tribute Photo ${index + 1}`}
                      fill
                      className={styles.galleryImage}
                      unoptimized
                    />
                    <div className={styles.galleryOverlay}>
                      <Download size={20} />
                    </div>
                  </a>
                ))}
              </div>
            </motion.section>
          )}

          {/* Gallery Empty State (Admin Upload Placeholder) */}
          {(!primaryHonor.tributeImages || primaryHonor.tributeImages.length === 0) && !primaryHonor.tributeImageUrl && (
            <motion.section
              className={styles.emptySection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25 }}
            >
              <div className={styles.emptySectionContent}>
                <ImageIcon size={32} />
                <h3>감사 포토</h3>
                <p>아직 등록된 감사 사진이 없습니다</p>
                <span className={styles.adminHint}>Admin에서 이미지를 업로드할 수 있습니다</span>
              </div>
            </motion.section>
          )}

          {/* VIP SECRET - Exclusive Signature Reactions */}
          {primaryHonor.exclusiveSignatures && primaryHonor.exclusiveSignatures.length > 0 && (
            <motion.section
              className={styles.signaturesSection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className={styles.secretHeader}>
                <div className={styles.secretBadge}>
                  <Sparkles size={16} />
                  <span>VIP SECRET</span>
                </div>
                <h2>VIP Exclusive Signature Reactions</h2>
                <p>{primaryHonor.donorName}님을 위한 전용 시그니처 리액션</p>
              </div>
              <div className={styles.signaturesGrid}>
                {primaryHonor.exclusiveSignatures.map((sig) => (
                  <div key={sig.id} className={styles.signatureCard}>
                    <div className={styles.signaturePlaceholder}>
                      <Video size={24} />
                      <span className={styles.signatureName}>{sig.memberName}</span>
                      <Play size={16} className={styles.playIcon} />
                    </div>
                  </div>
                ))}
              </div>
            </motion.section>
          )}

          {/* Signatures Empty State (Admin Upload Placeholder) */}
          {(!primaryHonor.exclusiveSignatures || primaryHonor.exclusiveSignatures.length === 0) && (
            <motion.section
              className={styles.emptySection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className={styles.emptySectionContent}>
                <Sparkles size={32} />
                <h3>VIP 전용 시그니처</h3>
                <p>아직 등록된 시그니처 리액션이 없습니다</p>
                <span className={styles.adminHint}>Admin에서 시그니처를 업로드할 수 있습니다</span>
              </div>
            </motion.section>
          )}

          {/* Legacy: Single Tribute Image (fallback) */}
          {primaryHonor.tributeImageUrl && (!primaryHonor.tributeImages || primaryHonor.tributeImages.length === 0) && (
            <motion.section
              className={styles.gallerySection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35 }}
            >
              <div className={styles.sectionHeader}>
                <ImageIcon size={20} />
                <h2>감사 포토</h2>
              </div>
              <div className={styles.galleryGrid}>
                <a
                  href={primaryHonor.tributeImageUrl}
                  download
                  className={styles.galleryCard}
                >
                  <Image
                    src={primaryHonor.tributeImageUrl}
                    alt="Exclusive Signature"
                    fill
                    className={styles.galleryImage}
                    unoptimized
                  />
                  <div className={styles.galleryOverlay}>
                    <Download size={20} />
                  </div>
                </a>
              </div>
            </motion.section>
          )}

          {/* Hall of Fame History */}
          {hallOfFameData.length > 1 && (
            <motion.section
              className={styles.historySection}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
            >
              <div className={styles.sectionHeader}>
                <Trophy size={20} />
                <h2>명예의 전당 기록</h2>
              </div>
              <div className={styles.historyList}>
                {hallOfFameData.map((honor) => (
                  <div key={honor.id} className={styles.historyItem}>
                    <span className={styles.historyDate}>
                      {honor.honorType === 'season_top3'
                        ? `${honor.seasonName} TOP ${honor.rank}`
                        : honor.episodeName}
                    </span>
                    <span className={styles.historyAmount}>
                      {formatAmount(honor.amount)}
                    </span>
                  </div>
                ))}
              </div>
            </motion.section>
          )}
        </div>
        <Footer />
      </div>
  )
}
