/**
 * Supabase Ranking Repository
 * 후원 랭킹 데이터 관리
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { IRankingRepository } from '../types'
import type { RankingItem, UnitFilter } from '@/types/common'

export class SupabaseRankingRepository implements IRankingRepository {
  constructor(private supabase: SupabaseClient) {}

  async getRankings(options: {
    seasonId?: number | null
    unitFilter?: UnitFilter
  }): Promise<RankingItem[]> {
    const { seasonId, unitFilter } = options

    let query = this.supabase
      .from('donations')
      .select(`
        donor_id,
        donor_name,
        amount,
        season_id,
        unit,
        profiles:donor_id (nickname, avatar_url)
      `)

    if (seasonId) {
      query = query.eq('season_id', seasonId)
    }

    // VIP는 전체에서 Top 50이므로 유닛 필터 스킵
    if (unitFilter && unitFilter !== 'all' && unitFilter !== 'vip') {
      query = query.eq('unit', unitFilter)
    }

    const { data, error } = await query

    if (error) throw error

    // Aggregate by donor
    const aggregated = (data || []).reduce((acc, donation) => {
      const key = donation.donor_id || donation.donor_name
      if (!acc[key]) {
        // profiles can be object or array from Supabase join
        const profile = donation.profiles as unknown as { nickname?: string; avatar_url?: string } | null
        acc[key] = {
          donorId: donation.donor_id,
          donorName: donation.donor_id
            ? profile?.nickname || donation.donor_name
            : donation.donor_name,
          avatarUrl: donation.donor_id ? profile?.avatar_url || null : null,
          totalAmount: 0,
          seasonId: donation.season_id,
        }
      }
      acc[key].totalAmount += donation.amount
      return acc
    }, {} as Record<string, Omit<RankingItem, 'rank'>>)

    let sorted = Object.values(aggregated)
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .map((item, index) => ({ ...item, rank: index + 1 }))

    // VIP 필터: Top 50만 표시
    if (unitFilter === 'vip') {
      sorted = sorted.slice(0, 50)
    }

    return sorted
  }

  async getTopRankers(limit: number): Promise<RankingItem[]> {
    const rankings = await this.getRankings({})
    return rankings.slice(0, limit)
  }
}
