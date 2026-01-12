'use client'

import { Filter, Tag } from 'lucide-react'
import { CATEGORY_LABELS, getCategoryColor } from '@/lib/hooks/useTimelineData'
import type { Season } from '@/types/database'
import styles from './Timeline.module.css'

interface TimelineFilterProps {
  seasons: Season[]
  categories: string[]
  selectedSeasonId: number | null
  selectedCategory: string | null
  onSeasonChange: (seasonId: number | null) => void
  onCategoryChange: (category: string | null) => void
}

export default function TimelineFilter({
  seasons,
  categories,
  selectedSeasonId,
  selectedCategory,
  onSeasonChange,
  onCategoryChange,
}: TimelineFilterProps) {
  return (
    <div className={styles.filterSection}>
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
