'use client'

/**
 * useTimelineData Hook - Repository 패턴 적용
 *
 * 타임라인 데이터 조회 훅
 * - Mock/Supabase 자동 전환 (Repository 계층에서 처리)
 * - 시즌별/카테고리별 필터링
 * - 시즌별 그룹화 기능
 */

import { useState, useEffect, useCallback, useMemo } from 'react'
import { useTimeline, useSeasons } from '@/lib/context'
import type { TimelineItem } from '@/types/common'
import type { Season } from '@/types/database'

export interface GroupedEvents {
  season: Season | null
  events: TimelineItem[]
}

export const CATEGORY_LABELS: Record<string, string> = {
  founding: '창단',
  milestone: '마일스톤',
  event: '이벤트',
  member: '멤버',
}

export const CATEGORY_COLORS: Record<string, string> = {
  founding: '#4ade80',
  milestone: '#f472b6',
  event: '#60a5fa',
  member: '#fbbf24',
}

export const SEASON_COLORS = ['#fd68ba', '#60a5fa', '#4ade80', '#fbbf24', '#a78bfa']

export const getCategoryColor = (category: string | null): string => {
  return CATEGORY_COLORS[category || ''] || '#fd68ba'
}

export const getSeasonColor = (seasonIndex: number): string => {
  return SEASON_COLORS[seasonIndex % SEASON_COLORS.length]
}

export interface UseTimelineDataOptions {
  initialSeasonId?: number | null
  initialCategory?: string | null
}

export interface UseTimelineDataReturn {
  events: TimelineItem[]
  seasons: Season[]
  categories: string[]
  selectedSeasonId: number | null
  selectedCategory: string | null
  groupedBySeason: GroupedEvents[]
  isLoading: boolean
  setSelectedSeasonId: (id: number | null) => void
  setSelectedCategory: (category: string | null) => void
  refetch: () => Promise<void>
}

export function useTimelineData(options?: UseTimelineDataOptions): UseTimelineDataReturn {
  // Repository hooks
  const timelineRepo = useTimeline()
  const seasonsRepo = useSeasons()

  // State
  const [events, setEvents] = useState<TimelineItem[]>([])
  const [allEvents, setAllEvents] = useState<TimelineItem[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(
    options?.initialSeasonId ?? null
  )
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    options?.initialCategory ?? null
  )
  const [isLoading, setIsLoading] = useState(true)

  // 시즌별로 이벤트 그룹화
  const groupedBySeason = useMemo((): GroupedEvents[] => {
    const groups: GroupedEvents[] = []
    const seasonMap = new Map<number, TimelineItem[]>()

    events.forEach((event) => {
      const seasonId = event.seasonId || 0
      if (!seasonMap.has(seasonId)) {
        seasonMap.set(seasonId, [])
      }
      seasonMap.get(seasonId)!.push(event)
    })

    // 시즌 ID 내림차순으로 정렬 (최신 시즌 먼저)
    const sortedSeasonIds = Array.from(seasonMap.keys()).sort((a, b) => b - a)

    sortedSeasonIds.forEach((seasonId) => {
      const season = seasons.find((s) => s.id === seasonId) || null
      const seasonEvents = seasonMap.get(seasonId) || []
      groups.push({ season, events: seasonEvents })
    })

    return groups
  }, [events, seasons])

  // 데이터 로드
  const fetchData = useCallback(async () => {
    setIsLoading(true)

    try {
      // 시즌 및 카테고리 목록 로드
      const [allSeasons, allCategories, allEventsData] = await Promise.all([
        seasonsRepo.findAll(),
        timelineRepo.getCategories(),
        timelineRepo.findAll(),
      ])

      setSeasons(allSeasons)
      setCategories(allCategories)
      setAllEvents(allEventsData)

      // 필터링된 이벤트 로드
      const filteredEvents = await timelineRepo.findByFilter({
        seasonId: selectedSeasonId,
        category: selectedCategory,
      })

      setEvents(filteredEvents)
    } catch (err) {
      console.error('타임라인 로드 실패:', err)
    } finally {
      setIsLoading(false)
    }
  }, [timelineRepo, seasonsRepo, selectedSeasonId, selectedCategory])

  // 초기 로드 및 필터 변경 시 refetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    events,
    seasons,
    categories,
    selectedSeasonId,
    selectedCategory,
    groupedBySeason,
    isLoading,
    setSelectedSeasonId,
    setSelectedCategory,
    refetch: fetchData,
  }
}
