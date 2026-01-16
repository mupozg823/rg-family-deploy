/**
 * Supabase Episode Repository
 * 회차 데이터 관리 - 직급전(rank battle) 기반 VIP 시스템
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { IEpisodeRepository } from '../types'
import type { Episode } from '@/types/database'

export class SupabaseEpisodeRepository implements IEpisodeRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: number): Promise<Episode | null> {
    const { data } = await this.supabase
      .from('episodes')
      .select('*')
      .eq('id', id)
      .single()
    return data
  }

  async findBySeason(seasonId: number): Promise<Episode[]> {
    const { data } = await this.supabase
      .from('episodes')
      .select('*')
      .eq('season_id', seasonId)
      .order('episode_number', { ascending: true })
    return data || []
  }

  async findRankBattles(seasonId: number): Promise<Episode[]> {
    const { data } = await this.supabase
      .from('episodes')
      .select('*')
      .eq('season_id', seasonId)
      .eq('is_rank_battle', true)
      .order('episode_number', { ascending: true })
    return data || []
  }

  async findLatestRankBattle(seasonId?: number): Promise<Episode | null> {
    let query = this.supabase
      .from('episodes')
      .select('*')
      .eq('is_rank_battle', true)
      .order('broadcast_date', { ascending: false })
      .limit(1)

    if (seasonId) {
      query = query.eq('season_id', seasonId)
    }

    const { data } = await query.single()
    return data
  }

  async getEpisodeRankings(
    episodeId: number,
    limit: number = 50
  ): Promise<{
    rank: number
    donorId: string | null
    donorName: string
    totalAmount: number
  }[]> {
    // Use the RPC function for episode rankings
    const { data, error } = await this.supabase
      .rpc('get_episode_rankings', {
        p_episode_id: episodeId,
        p_limit: limit,
      })

    if (error) {
      console.error('Error getting episode rankings:', error)
      return []
    }

    return (data || []).map((row: {
      rank: number
      donor_id: string | null
      donor_name: string
      total_amount: number
    }) => ({
      rank: row.rank,
      donorId: row.donor_id,
      donorName: row.donor_name,
      totalAmount: row.total_amount,
    }))
  }

  /**
   * Check if user is VIP for a specific episode (in Top 50)
   */
  async isVipForEpisode(userId: string, episodeId: number): Promise<boolean> {
    const { data } = await this.supabase
      .rpc('is_vip_for_episode', {
        p_user_id: userId,
        p_episode_id: episodeId,
      })
    return data === true
  }

  /**
   * Check if user is VIP for any rank battle in a season
   */
  async isVipForRankBattles(userId: string, seasonId?: number): Promise<boolean> {
    const { data } = await this.supabase
      .rpc('is_vip_for_rank_battles', {
        p_user_id: userId,
        p_season_id: seasonId || null,
      })
    return data === true
  }
}
