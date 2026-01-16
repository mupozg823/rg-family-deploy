'use client'

import { Calendar, Trophy } from 'lucide-react'
import type { Episode } from '@/types/database'
import styles from './EpisodeSelector.module.css'

interface EpisodeSelectorProps {
  episodes: Episode[]           // 직급전 회차만
  selectedEpisodeId: number | null
  onSelect: (episodeId: number | null) => void
  isLoading?: boolean
}

export default function EpisodeSelector({
  episodes,
  selectedEpisodeId,
  onSelect,
  isLoading = false,
}: EpisodeSelectorProps) {
  if (isLoading) {
    return (
      <div className={styles.container}>
        <div className={styles.label}>
          <Calendar size={18} />
          <span>회차</span>
        </div>
        <div className={styles.buttons}>
          <div className={styles.skeleton} />
          <div className={styles.skeleton} />
        </div>
      </div>
    )
  }

  // 직급전 회차가 없으면 표시하지 않음
  if (episodes.length === 0) {
    return null
  }

  return (
    <div className={styles.container}>
      <div className={styles.label}>
        <Calendar size={18} />
        <span>회차</span>
      </div>

      <div className={styles.buttons}>
        <button
          onClick={() => onSelect(null)}
          className={`${styles.button} ${selectedEpisodeId === null ? styles.active : ''}`}
        >
          전체 회차
        </button>

        {episodes.map((episode) => (
          <button
            key={episode.id}
            onClick={() => onSelect(episode.id)}
            className={`${styles.button} ${selectedEpisodeId === episode.id ? styles.active : ''} ${episode.is_rank_battle ? styles.rankBattle : ''}`}
          >
            {episode.title}
            {episode.is_rank_battle && (
              <span className={styles.rankBattleBadge}>
                <Trophy size={12} />
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  )
}
