'use client'

import { useEffect, useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useRanking } from '@/lib/hooks/useRanking'
import { RankingCard, RankingList } from '@/components/ranking'
import { Calendar, ArrowLeft, Trophy } from 'lucide-react'
import Link from 'next/link'
import styles from './page.module.css'

export default function SeasonRankingPage() {
  const params = useParams()
  const router = useRouter()
  const seasonId = params.id ? Number(params.id) : null

  const {
    rankings,
    seasons,
    selectedSeasonId,
    unitFilter,
    maxAmount,
    isLoading,
    setSelectedSeasonId,
    setUnitFilter,
  } = useRanking()

  // URL의 시즌 ID로 설정
  useEffect(() => {
    if (seasonId && seasonId !== selectedSeasonId) {
      setSelectedSeasonId(seasonId)
    }
  }, [seasonId, selectedSeasonId, setSelectedSeasonId])

  // 현재 시즌 정보
  const currentSeason = useMemo(() => {
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

  const top3 = rankings.slice(0, 3)
  const rest = rankings.slice(3)

  // 시즌을 찾을 수 없는 경우
  if (!isLoading && seasons.length > 0 && !currentSeason) {
    return (
      <main className={styles.main}>
        <div className={styles.container}>
          <div className={styles.notFound}>
            <Trophy size={48} />
            <h2>시즌을 찾을 수 없습니다</h2>
            <p>존재하지 않는 시즌이거나 삭제된 시즌입니다.</p>
            <Link href="/ranking/total" className={styles.backButton}>
              전체 랭킹으로 이동
            </Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <Link href="/ranking/total" className={styles.backLink}>
          <ArrowLeft size={20} />
          전체 랭킹
        </Link>

        <h1 className={styles.title}>
          {currentSeason?.name || '시즌 랭킹'}
        </h1>

        {currentSeason && (
          <div className={styles.seasonInfo}>
            <div className={styles.dateRange}>
              <Calendar size={16} />
              <span>
                {formatDate(currentSeason.start_date)} ~ {currentSeason.end_date ? formatDate(currentSeason.end_date) : '진행 중'}
              </span>
            </div>
            {currentSeason.is_active && (
              <span className={styles.activeBadge}>진행 중</span>
            )}
          </div>
        )}
      </div>

      <div className={styles.container}>
        {/* 시즌 선택 */}
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
            {(['all', 'excel', 'crew'] as const).map((unit) => (
              <button
                key={unit}
                onClick={() => setUnitFilter(unit)}
                className={`${styles.unitButton} ${unitFilter === unit ? styles.active : ''}`}
                data-unit={unit}
              >
                {unit === 'all' ? '전체' : unit === 'excel' ? '엑셀부' : '크루부'}
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
            {/* Top 3 Cards */}
            <div className={styles.topRankers}>
              {top3.map((item, index) => (
                <RankingCard
                  key={item.donorId || index}
                  item={item}
                  maxAmount={maxAmount}
                  index={index}
                />
              ))}
            </div>

            {/* Rest of Rankings */}
            {rest.length > 0 && (
              <div className={styles.restRankers}>
                <h2 className={styles.sectionTitle}>4위 이하</h2>
                <RankingList
                  rankings={rest}
                  maxAmount={maxAmount}
                  startRank={4}
                />
              </div>
            )}
          </>
        )}
      </div>
    </main>
  )
}
