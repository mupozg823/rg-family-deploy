'use client'

import { Calendar } from 'lucide-react'
import type { Season } from '@/types/database'
import styles from './SeasonSelector.module.css'

interface SeasonSelectorProps {
  seasons: Season[]
  selectedSeasonId: number | null
  onSelect: (seasonId: number | null) => void
}

export default function SeasonSelector({
  seasons,
  selectedSeasonId,
  onSelect,
}: SeasonSelectorProps) {

  return (
    <div className={styles.container}>
      <div className={styles.label}>
        <Calendar size={18} />
        <span>시즌</span>
      </div>

      <div className={styles.buttons}>
        <button
          onClick={() => onSelect(null)}
          className={`${styles.button} ${selectedSeasonId === null ? styles.active : ''}`}
        >
          전체
        </button>

        {seasons.map((season) => (
          <button
            key={season.id}
            onClick={() => onSelect(season.id)}
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
