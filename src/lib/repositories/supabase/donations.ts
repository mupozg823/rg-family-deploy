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

  async getTotal(donorId: string): Promise<number> {
    const donations = await this.findByDonor(donorId)
    return donations.reduce((sum, d) => sum + d.amount, 0)
  }
}
