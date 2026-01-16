'use client'

import { Filter, Tag, Users } from 'lucide-react'
import { CATEGORY_LABELS, getCategoryColor } from '@/lib/hooks/useTimelineData'
import type { Season } from '@/types/database'
import styles from './Timeline.module.css'

interface TimelineFilterProps {
  seasons: Season[]
  categories: string[]
  selectedSeasonId: number | null
  selectedCategory: string | null
  selectedUnit: 'excel' | 'crew' | null
  onSeasonChange: (seasonId: number | null) => void
  onCategoryChange: (category: string | null) => void
  onUnitChange: (unit: 'excel' | 'crew' | null) => void
}

const UNIT_LABELS: Record<string, string> = {
  excel: '엑셀부',
  crew: '크루부',
}

export default function TimelineFilter({
  seasons,
  categories,
  selectedSeasonId,
  selectedCategory,
  selectedUnit,
  onSeasonChange,
  onCategoryChange,
  onUnitChange,
}: TimelineFilterProps) {
  return (
    <div className={styles.filterSection}>
      {/* Unit Filter (엑셀부/크루부) - 맨 위에 배치 */}
      <div className={styles.filterRow}>
        <div className={styles.filterLabel}>
          <Users size={18} />
          <span>유닛</span>
        </div>
        <div className={styles.unitFilter}>
          <button
            onClick={() => onUnitChange(null)}
            className={`${styles.unitButton} ${selectedUnit === null ? styles.active : ''}`}
          >
            전체
          </button>
          <button
            onClick={() => onUnitChange('excel')}
            className={`${styles.unitButton} ${styles.excel} ${selectedUnit === 'excel' ? styles.active : ''}`}
          >
            {UNIT_LABELS.excel}
          </button>
          <button
            onClick={() => onUnitChange('crew')}
            className={`${styles.unitButton} ${styles.crew} ${selectedUnit === 'crew' ? styles.active : ''}`}
          >
            {UNIT_LABELS.crew}
          </button>
        </div>
      </div>

      {/* Season Filter */}
      <div className={styles.filterRow}>
        <div className={styles.filterLabel}>
          <Filter size={18} />
          <span>시즌</span>
        </div>
        <div className={styles.seasonFilter}>
          <button
            onClick={() => onSeasonChange(null)}
            className={`${styles.seasonButton} ${selectedSeasonId === null ? styles.active : ''}`}
          >
            전체
          </button>
          {seasons.map((season) => (
            <button
              key={season.id}
              onClick={() => onSeasonChange(season.id)}
              className={`${styles.seasonButton} ${selectedSeasonId === season.id ? styles.active : ''}`}
            >
              {season.name}
            </button>
          ))}
        </div>
      </div>

      {/* Category Filter */}
      {categories.length > 0 && (
        <div className={styles.filterRow}>
          <div className={styles.filterLabel}>
            <Tag size={18} />
            <span>카테고리</span>
          </div>
          <div className={styles.categoryFilter}>
            <button
              onClick={() => onCategoryChange(null)}
              className={`${styles.categoryButton} ${selectedCategory === null ? styles.active : ''}`}
            >
              전체
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => onCategoryChange(cat)}
                className={`${styles.categoryButton} ${selectedCategory === cat ? styles.active : ''}`}
                style={
                  {
                    '--category-color': getCategoryColor(cat),
                  } as React.CSSProperties
                }
              >
                {CATEGORY_LABELS[cat] || cat}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
