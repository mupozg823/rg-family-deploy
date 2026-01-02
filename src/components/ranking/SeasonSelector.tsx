'use client'

import { useRouter } from 'next/navigation'
import { Calendar } from 'lucide-react'
import type { Season } from '@/types/database'
import styles from './SeasonSelector.module.css'

interface SeasonSelectorProps {
  seasons: Season[]
  selectedSeasonId: number | null
  onSelect: (seasonId: number | null) => void
  navigateToSeasonPage?: boolean // true이면 시즌 선택 시 페이지 이동
}

export default function SeasonSelector({
  seasons,
  selectedSeasonId,
  onSelect,
  navigateToSeasonPage = false,
}: SeasonSelectorProps) {
  const router = useRouter()

  const handleSeasonClick = (seasonId: number | null) => {
    if (navigateToSeasonPage && seasonId !== null) {
      // 시즌 상세 페이지로 이동
      router.push(`/ranking/season/${seasonId}`)
    } else {
      // 기존 필터링 동작
      onSelect(seasonId)
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.label}>
        <Calendar size={18} />
        <span>시즌</span>
      </div>

      <div className={styles.buttons}>
        <button
          onClick={() => handleSeasonClick(null)}
          className={`${styles.button} ${selectedSeasonId === null ? styles.active : ''}`}
        >
          전체
        </button>

        {seasons.map((season) => (
          <button
            key={season.id}
            onClick={() => handleSeasonClick(season.id)}
            className={`${styles.button} ${selectedSeasonId === season.id ? styles.active : ''} ${season.is_active ? styles.current : ''}`}
          >
            {season.name}
            {season.is_active && <span className={styles.currentBadge}>진행중</span>}
          </button>
        ))}
      </div>
    </div>
  )
}
