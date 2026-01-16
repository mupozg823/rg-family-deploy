'use client'

/**
 * useTimelineData Hook - Repository 패턴 적용
 *
 * 타임라인 데이터 조회 훅
 * - Mock/Supabase 자동 전환 (Repository 계층에서 처리)
 * - 시즌별/카테고리별 필터링
 * - 시즌별 그룹화 기능
 */

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
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
  initialUnit?: 'excel' | 'crew' | null  // 엑셀부/크루부 초기값
  /** 페이지당 이벤트 수 (무한 스크롤용) */
  pageSize?: number
  /** 무한 스크롤 모드 활성화 */
  infiniteScroll?: boolean
  /** 초기 로드 시 최대 이벤트 수 (infiniteScroll=false일 때, 0이면 무제한) */
  maxInitialLoad?: number
}

export interface UseTimelineDataReturn {
  events: TimelineItem[]
  seasons: Season[]
  categories: string[]
  selectedSeasonId: number | null
  selectedCategory: string | null
  selectedUnit: 'excel' | 'crew' | null  // 엑셀부/크루부 필터
  groupedBySeason: GroupedEvents[]
  isLoading: boolean
  /** 추가 로딩 중 여부 (무한 스크롤) */
  isLoadingMore: boolean
  /** 더 로드할 데이터 있는지 */
  hasMore: boolean
  /** 다음 페이지 로드 (무한 스크롤) */
  loadMore: () => Promise<void>
  setSelectedSeasonId: (id: number | null) => void
  setSelectedCategory: (category: string | null) => void
  setSelectedUnit: (unit: 'excel' | 'crew' | null) => void  // 엑셀부/크루부 setter
  refetch: () => Promise<void>
}

export function useTimelineData(options?: UseTimelineDataOptions): UseTimelineDataReturn {
  const { pageSize = 10, infiniteScroll = false, maxInitialLoad = 50 } = options || {}

  // Repository hooks
  const timelineRepo = useTimeline()
  const seasonsRepo = useSeasons()

  // State
  const [events, setEvents] = useState<TimelineItem[]>([])
  const [allFilteredEvents, setAllFilteredEvents] = useState<TimelineItem[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(
    options?.initialSeasonId ?? null
  )
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    options?.initialCategory ?? null
  )
  const [selectedUnit, setSelectedUnit] = useState<'excel' | 'crew' | null>(
    options?.initialUnit ?? null
  )
  const [isLoading, setIsLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)

  // K-0005: mounted 체크로 언마운트 후 상태 업데이트 방지
  const isMountedRef = useRef(true)

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

  // 더 로드할 데이터가 있는지
  const hasMore = useMemo(() => {
    if (!infiniteScroll) return false
    return events.length < allFilteredEvents.length
  }, [infiniteScroll, events.length, allFilteredEvents.length])

  // 다음 페이지 로드 (무한 스크롤)
  const loadMore = useCallback(async () => {
    if (!infiniteScroll || isLoadingMore || !hasMore) return

    setIsLoadingMore(true)

    // 클라이언트 사이드 페이지네이션 (이미 로드된 데이터에서 slice)
    const nextPage = currentPage + 1
    const endIndex = nextPage * pageSize
    const nextEvents = allFilteredEvents.slice(0, endIndex)

    // 약간의 딜레이로 UX 개선
    await new Promise((resolve) => setTimeout(resolve, 300))

    setEvents(nextEvents)
    setCurrentPage(nextPage)
    setIsLoadingMore(false)
  }, [infiniteScroll, isLoadingMore, hasMore, currentPage, pageSize, allFilteredEvents])

  // 데이터 로드
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setCurrentPage(1)

    try {
      // 시즌 및 카테고리 목록 로드
      const [allSeasons, allCategories] = await Promise.all([
        seasonsRepo.findAll(),
        timelineRepo.getCategories(),
      ])

      // K-0005: 언마운트된 경우 상태 업데이트 스킵
      if (!isMountedRef.current) return

      setSeasons(allSeasons)
      setCategories(allCategories)

      // 필터링된 이벤트 로드 (unit 필터 포함)
      const filteredEvents = await timelineRepo.findByFilter({
        seasonId: selectedSeasonId,
        category: selectedCategory,
        unit: selectedUnit,
      })

      if (!isMountedRef.current) return

      setAllFilteredEvents(filteredEvents)

      // 무한 스크롤 모드면 첫 페이지만
      // 아니면 maxInitialLoad 적용 (0이면 무제한)
      if (infiniteScroll) {
        setEvents(filteredEvents.slice(0, pageSize))
      } else if (maxInitialLoad > 0) {
        setEvents(filteredEvents.slice(0, maxInitialLoad))
      } else {
        setEvents(filteredEvents)
      }
    } catch (err) {
      console.error('타임라인 로드 실패:', err)
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [timelineRepo, seasonsRepo, selectedSeasonId, selectedCategory, selectedUnit, infiniteScroll, pageSize, maxInitialLoad])

  // 초기 로드 및 필터 변경 시 refetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // K-0005: 언마운트 시 cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  return {
    events,
    seasons,
    categories,
    selectedSeasonId,
    selectedCategory,
    selectedUnit,
    groupedBySeason,
    isLoading,
    isLoadingMore,
    hasMore,
    loadMore,
    setSelectedSeasonId,
    setSelectedCategory,
    setSelectedUnit,
    refetch: fetchData,
  }
}
