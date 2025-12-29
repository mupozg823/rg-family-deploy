'use client'

import { useRanking } from '@/lib/hooks/useRanking'
import { RankingCard, RankingList, SeasonSelector } from '@/components/ranking'
import styles from './page.module.css'

export default function TotalRankingPage() {
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

  const top3 = rankings.slice(0, 3)
  const rest = rankings.slice(3)

  return (
    <main className={styles.main}>
      <div className={styles.hero}>
        <h1 className={styles.title}>후원 랭킹</h1>
        <p className={styles.subtitle}>RG FAMILY 후원자 랭킹</p>
      </div>

      <div className={styles.container}>
        {/* Filters */}
        <div className={styles.filters}>
          <SeasonSelector
            seasons={seasons}
            selectedSeasonId={selectedSeasonId}
            onSelect={setSelectedSeasonId}
          />

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
            <p>등록된 후원 데이터가 없습니다</p>
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
