'use client'

import { useEffect, useMemo, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useRanking } from '@/lib/hooks/useRanking'
import { RankingPodium, RankingFullList, SeasonSelector } from '@/components/ranking'
import { Calendar, ArrowLeft, Trophy, Clock, Star, ChevronDown, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import styles from './page.module.css'

export default function SeasonRankingPage() {
  const params = useParams()
  const router = useRouter()
  const listRef = useRef<HTMLDivElement>(null)

  const scrollToList = () => {
    listRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const {
    rankings,
    seasons,
    currentSeason,
    selectedSeasonId,
    unitFilter,
    maxAmount,
    isLoading,
    setSelectedSeasonId,
    setUnitFilter,
  } = useRanking()

  // "current"인 경우 현재 활성 시즌 ID 사용, 아니면 숫자로 변환
  const seasonId = useMemo(() => {
    if (params.id === 'current') {
      return currentSeason?.id || null
    }
    return params.id ? Number(params.id) : null
  }, [params.id, currentSeason])

  // URL의 시즌 ID로 설정
  useEffect(() => {
    if (seasonId && seasonId !== selectedSeasonId) {
      setSelectedSeasonId(seasonId)
    }
  }, [seasonId, selectedSeasonId, setSelectedSeasonId])

  // 선택된 시즌 정보
  const selectedSeason = useMemo(() => {
    return seasons.find(s => s.id === seasonId) || null
  }, [seasons, seasonId])

  // 날짜 포맷
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  // 시즌 남은 일수 계산
  const daysRemaining = useMemo(() => {
    if (!selectedSeason?.end_date || !selectedSeason.is_active) return null
    const end = new Date(selectedSeason.end_date)
    const now = new Date()
    const diff = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return diff > 0 ? diff : 0
  }, [selectedSeason])

  // TOP 50으로 제한
  const top50 = rankings.slice(0, 50)
  const top3 = top50.slice(0, 3)

  // 시즌을 찾을 수 없는 경우
  if (!isLoading && seasons.length > 0 && !selectedSeason) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.notFound}>
            <Trophy size={48} />
            <h2>시즌을 찾을 수 없습니다</h2>
            <p>존재하지 않는 시즌이거나 삭제된 시즌입니다.</p>
            <Link href="/ranking" className={styles.backButton}>
              전체 랭킹으로 이동
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.main}>
      {/* Minimal Navigation Bar */}
      <nav className={styles.pageNav}>
        <Link href="/ranking" className={styles.backBtn}>
          <ArrowLeft size={18} />
        </Link>
        <div className={styles.navTitle}>
          <Sparkles size={14} />
          <span>SEASON</span>
        </div>
        <Link href="/ranking/vip" className={styles.vipBtn}>
          <Trophy size={14} />
          <span>VIP</span>
        </Link>
      </nav>

      {/* Premium Hero Section */}
      <div className={styles.hero}>
        <motion.div
          className={styles.heroContent}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.heroBadge}>{selectedSeason?.name || 'SEASON'}</span>
          <h1 className={styles.title}>RANKINGS</h1>
          {selectedSeason && (
            <div className={styles.seasonMeta}>
              <span className={styles.dateRange}>
                <Calendar size={14} />
                {formatDate(selectedSeason.start_date)} ~ {selectedSeason.end_date ? formatDate(selectedSeason.end_date) : '진행 중'}
              </span>
              {selectedSeason.is_active && daysRemaining !== null && daysRemaining > 0 && (
                <span className={styles.daysLeft}>D-{daysRemaining}</span>
              )}
            </div>
          )}
        </motion.div>

        {/* Scroll Indicator */}
        <motion.button
          onClick={scrollToList}
          className={styles.scrollIndicator}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1, y: [0, 8, 0] }}
          transition={{
            opacity: { delay: 1 },
            y: { duration: 1.5, repeat: Infinity }
          }}
        >
          <ChevronDown size={24} />
        </motion.button>
      </div>

      <div className={styles.container}>
        {/* Minimal Filters */}
        <div className={styles.filters}>
          <div className={styles.seasonTabs}>
            {seasons.map((season) => (
              <button
                key={season.id}
                onClick={() => router.push(`/ranking/season/${season.id}`)}
                className={`${styles.seasonTab} ${season.id === seasonId ? styles.active : ''}`}
              >
                {season.name}
                {season.is_active && <span className={styles.dot} />}
              </button>
            ))}
          </div>

          <div className={styles.unitFilter}>
            {(['excel', 'crew', 'all'] as const).map((unit) => (
              <button
                key={unit}
                onClick={() => setUnitFilter(unit)}
                className={`${styles.unitButton} ${unitFilter === unit ? styles.active : ''}`}
                data-unit={unit}
              >
                {unit === 'excel' ? 'EXCEL' : unit === 'crew' ? 'CREW' : 'ALL'}
              </button>
            ))}
          </div>
        </div>

        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <span>랭킹을 불러오는 중...</span>
          </div>
        ) : rankings.length === 0 ? (
          <div className={styles.empty}>
            <Trophy size={48} />
            <p>이 시즌의 후원 데이터가 없습니다</p>
          </div>
        ) : (
          <>
            {/* Top 3 Podium */}
            <section className={styles.podiumSection}>
              <RankingPodium items={top3} />
            </section>

            {/* Full Ranking List */}
            <section ref={listRef} className={styles.fullListSection}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Season Rankings</h2>
                <span className={styles.sectionBadge}>TOP 50</span>
              </div>
              <RankingFullList
                rankings={top50}
                maxAmount={maxAmount}
                limit={50}
              />
            </section>
          </>
        )}
      </div>
    </main>
  )
}
