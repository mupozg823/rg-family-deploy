/**
 * Supabase Donation Repository
 * 후원 내역 데이터 관리
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { IDonationRepository } from '../types'
import type { Donation } from '@/types/database'

export class SupabaseDonationRepository implements IDonationRepository {
  constructor(private supabase: SupabaseClient) {}

  async findByDonor(donorId: string): Promise<Donation[]> {
    const { data } = await this.supabase
      .from('donations')
      .select('*')
      .eq('donor_id', donorId)
      .order('created_at', { ascending: false })
    return data || []
  }

  async findBySeason(seasonId: number): Promise<Donation[]> {
    const { data } = await this.supabase
      .from('donations')
      .select('*')
      .eq('season_id', seasonId)
    return data || []
  }

  async findByEpisode(episodeId: number): Promise<Donation[]> {
    const { data } = await this.supabase
      .from('donations')
      .select('*')
      .eq('episode_id', episodeId)
      .order('amount', { ascending: false })
    return data || []
  }

  async getTotal(donorId: string): Promise<number> {
    const donations = await this.findByDonor(donorId)
    return donations.reduce((sum, d) => sum + d.amount, 0)
  }

  async getTotalByEpisode(donorId: string, episodeId: number): Promise<number> {
    const { data } = await this.supabase
      .from('donations')
      .select('amount')
      .eq('donor_id', donorId)
      .eq('episode_id', episodeId)

    if (!data) return 0
    return data.reduce((sum, d) => sum + d.amount, 0)
  }
}
