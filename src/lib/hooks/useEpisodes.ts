'use client'

/**
 * useEpisodes Hook
 *
 * 회차(에피소드) 관련 Repository 훅
 * - 시즌별 회차 조회
 * - 직급전 회차 필터링
 * - 회차별 랭킹 조회
 */

import { useCallback } from 'react'
import type { Episode } from '@/types/database'

interface EpisodeRankingItem {
  rank: number
  donorId: string | null
  donorName: string
  totalAmount: number
}

interface IEpisodeRepository {
  findBySeason: (seasonId: number) => Promise<Episode[]>
  findRankBattles: (seasonId: number) => Promise<Episode[]>
  getEpisodeRankings: (episodeId: number, limit?: number) => Promise<EpisodeRankingItem[]>
  isVipForEpisode: (userId: string, episodeId: number) => Promise<boolean>
  isVipForRankBattles: (userId: string, seasonId: number) => Promise<boolean>
}

/**
 * Episodes Repository Hook
 * 회차 관련 데이터 접근을 위한 훅
 */
export function useEpisodes(): IEpisodeRepository {
  // 시즌별 전체 회차 조회
  const findBySeason = useCallback(async (_seasonId: number): Promise<Episode[]> => {
    // TODO: Implement with Supabase
    console.warn('useEpisodes.findBySeason: Not implemented yet')
    return []
  }, [])

  // 직급전 회차만 조회
  const findRankBattles = useCallback(async (_seasonId: number): Promise<Episode[]> => {
    // TODO: Implement with Supabase
    console.warn('useEpisodes.findRankBattles: Not implemented yet')
    return []
  }, [])

  // 회차별 랭킹 조회
  const getEpisodeRankings = useCallback(
    async (_episodeId: number, _limit?: number): Promise<EpisodeRankingItem[]> => {
      // TODO: Implement with Supabase RPC
      console.warn('useEpisodes.getEpisodeRankings: Not implemented yet')
      return []
    },
    []
  )

  // 특정 회차 VIP 여부 확인
  const isVipForEpisode = useCallback(
    async (_userId: string, _episodeId: number): Promise<boolean> => {
      // TODO: Implement with Supabase RPC
      console.warn('useEpisodes.isVipForEpisode: Not implemented yet')
      return false
    },
    []
  )

  // 직급전 VIP 여부 확인
  const isVipForRankBattles = useCallback(
    async (_userId: string, _seasonId: number): Promise<boolean> => {
      // TODO: Implement with Supabase RPC
      console.warn('useEpisodes.isVipForRankBattles: Not implemented yet')
      return false
    },
    []
  )

  return {
    findBySeason,
    findRankBattles,
    getEpisodeRankings,
    isVipForEpisode,
    isVipForRankBattles,
  }
}
