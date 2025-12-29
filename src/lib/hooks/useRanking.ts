'use client'

import { useState, useCallback, useEffect } from 'react'
import { useSupabase } from './useSupabase'
import { USE_MOCK_DATA } from '@/lib/config'
import { mockProfiles, mockSeasons } from '@/lib/mock/data'
import type { Season } from '@/types/database'
import type { RankingItem, UnitFilter } from '@/types/common'

interface UseRankingReturn {
  rankings: RankingItem[]
  seasons: Season[]
  currentSeason: Season | null
  selectedSeasonId: number | null
  unitFilter: UnitFilter
  maxAmount: number
  isLoading: boolean
  error: string | null
  setSelectedSeasonId: (id: number | null) => void
  setUnitFilter: (filter: UnitFilter) => void
  refetch: () => Promise<void>
}

export function useRanking(): UseRankingReturn {
  const supabase = useSupabase()
  const [rankings, setRankings] = useState<RankingItem[]>([])
  const [seasons, setSeasons] = useState<Season[]>([])
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null)
  const [selectedSeasonId, setSelectedSeasonId] = useState<number | null>(null)
  const [unitFilter, setUnitFilter] = useState<UnitFilter>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // 시즌 목록 로드
  const fetchSeasons = useCallback(async () => {
    if (USE_MOCK_DATA) {
      setSeasons(mockSeasons)
      const active = mockSeasons.find(s => s.is_active)
      setCurrentSeason(active || null)
      return
    }

    const { data, error: fetchError } = await supabase
      .from('seasons')
      .select('*')
      .order('start_date', { ascending: false })

    if (fetchError) {
      console.error('시즌 로드 실패:', fetchError)
      return
    }

    setSeasons(data || [])
    const active = data?.find(s => s.is_active)
    setCurrentSeason(active || null)
  }, [supabase])

  // 랭킹 데이터 로드
  const fetchRankings = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (USE_MOCK_DATA) {
        // Mock 데이터에서 랭킹 생성
        let filteredProfiles = [...mockProfiles]

        // 유닛 필터
        if (unitFilter !== 'all') {
          filteredProfiles = filteredProfiles.filter(p => p.unit === unitFilter)
        }

        // 후원 금액 기준 정렬 및 순위 부여
        const sorted = filteredProfiles
          .filter(p => (p.total_donation || 0) > 0)
          .sort((a, b) => (b.total_donation || 0) - (a.total_donation || 0))
          .map((profile, index) => ({
            donorId: profile.id,
            donorName: profile.nickname,
            avatarUrl: profile.avatar_url,
            totalAmount: profile.total_donation || 0,
            seasonId: selectedSeasonId ?? undefined,
            rank: index + 1,
          }))

        setRankings(sorted)
        setIsLoading(false)
        return
      }

      // 기본 쿼리: 후원 금액 합계
      let query = supabase
        .from('donations')
        .select(`
          donor_id,
          donor_name,
          amount,
          season_id,
          unit,
          profiles:donor_id (
            nickname,
            avatar_url
          )
        `)

      // 시즌 필터
      if (selectedSeasonId) {
        query = query.eq('season_id', selectedSeasonId)
      }

      // 유닛 필터
      if (unitFilter !== 'all') {
        query = query.eq('unit', unitFilter)
      }

      const { data, error: fetchError } = await query

      if (fetchError) throw fetchError

      // 후원자별 합계 계산
      const aggregated = (data || []).reduce((acc, donation) => {
        const key = donation.donor_id || donation.donor_name
        if (!acc[key]) {
          acc[key] = {
            donorId: donation.donor_id,
            donorName: donation.donor_id
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ? (donation.profiles as any)?.nickname || donation.donor_name
              : donation.donor_name,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            avatarUrl: donation.donor_id ? (donation.profiles as any)?.avatar_url : null,
            totalAmount: 0,
            seasonId: donation.season_id,
          }
        }
        acc[key].totalAmount += donation.amount
        return acc
      }, {} as Record<string, Omit<RankingItem, 'rank'>>)

      // 정렬 및 순위 부여
      const sorted = Object.values(aggregated)
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .map((item, index) => ({
          ...item,
          rank: index + 1,
        }))

      setRankings(sorted)
    } catch (err) {
      setError(err instanceof Error ? err.message : '랭킹을 불러오는데 실패했습니다.')
    } finally {
      setIsLoading(false)
    }
  }, [supabase, selectedSeasonId, unitFilter])

  useEffect(() => {
    fetchSeasons()
  }, [fetchSeasons])

  useEffect(() => {
    fetchRankings()
  }, [fetchRankings])

  const maxAmount = rankings.length > 0 ? rankings[0].totalAmount : 0

  return {
    rankings,
    seasons,
    currentSeason,
    selectedSeasonId,
    unitFilter,
    maxAmount,
    isLoading,
    error,
    setSelectedSeasonId,
    setUnitFilter,
    refetch: fetchRankings,
  }
}
