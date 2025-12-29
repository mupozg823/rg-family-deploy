/**
 * Supabase Repository Implementations
 * 실제 데이터베이스 저장소
 */

import { SupabaseClient } from '@supabase/supabase-js'
import {
  IRankingRepository,
  ISeasonRepository,
  IProfileRepository,
  IOrganizationRepository,
  INoticeRepository,
  IDataProvider,
  IDonationRepository,
  IPostRepository,
} from '../types'
import type { RankingItem, UnitFilter } from '@/types/common'
import type { Season, Profile, Organization, Notice, Donation, Post } from '@/types/database'

// ============================================
// Supabase Ranking Repository
// ============================================
class SupabaseRankingRepository implements IRankingRepository {
  constructor(private supabase: SupabaseClient) {}

  async getRankings(options: {
    seasonId?: number | null
    unitFilter?: UnitFilter
  }): Promise<RankingItem[]> {
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

    if (options.seasonId) {
      query = query.eq('season_id', options.seasonId)
    }

    if (options.unitFilter && options.unitFilter !== 'all') {
      query = query.eq('unit', options.unitFilter)
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

    return Object.values(aggregated)
      .sort((a, b) => b.totalAmount - a.totalAmount)
      .map((item, index) => ({ ...item, rank: index + 1 }))
  }

  async getTopRankers(limit: number): Promise<RankingItem[]> {
    const rankings = await this.getRankings({})
    return rankings.slice(0, limit)
  }
}

// ============================================
// Supabase Season Repository
// ============================================
class SupabaseSeasonRepository implements ISeasonRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: number): Promise<Season | null> {
    const { data } = await this.supabase
      .from('seasons')
      .select('*')
      .eq('id', id)
      .single()
    return data
  }

  async findActive(): Promise<Season | null> {
    const { data } = await this.supabase
      .from('seasons')
      .select('*')
      .eq('is_active', true)
      .single()
    return data
  }

  async findAll(): Promise<Season[]> {
    const { data } = await this.supabase
      .from('seasons')
      .select('*')
      .order('start_date', { ascending: false })
    return data || []
  }
}

// ============================================
// Supabase Profile Repository
// ============================================
class SupabaseProfileRepository implements IProfileRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<Profile | null> {
    const { data } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
    return data
  }

  async findByNickname(nickname: string): Promise<Profile | null> {
    const { data } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('nickname', nickname)
      .single()
    return data
  }

  async findVipMembers(): Promise<Profile[]> {
    const { data } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('role', 'vip')
    return data || []
  }

  async findAll(): Promise<Profile[]> {
    const { data } = await this.supabase
      .from('profiles')
      .select('*')
    return data || []
  }
}

// ============================================
// Supabase Donation Repository
// ============================================
class SupabaseDonationRepository implements IDonationRepository {
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

// ============================================
// Supabase Organization Repository
// ============================================
class SupabaseOrganizationRepository implements IOrganizationRepository {
  constructor(private supabase: SupabaseClient) {}

  async findByUnit(unit: 'excel' | 'crew'): Promise<Organization[]> {
    const { data } = await this.supabase
      .from('organization')
      .select('*')
      .eq('unit', unit)
      .eq('is_active', true)
      .order('position_order')
    return data || []
  }

  async findLiveMembers(): Promise<Organization[]> {
    const { data } = await this.supabase
      .from('organization')
      .select('*')
      .eq('is_live', true)
    return data || []
  }

  async findAll(): Promise<Organization[]> {
    const { data } = await this.supabase
      .from('organization')
      .select('*')
      .eq('is_active', true)
      .order('position_order')
    return data || []
  }
}

// ============================================
// Supabase Notice Repository
// ============================================
class SupabaseNoticeRepository implements INoticeRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: number): Promise<Notice | null> {
    const { data } = await this.supabase
      .from('notices')
      .select('*')
      .eq('id', id)
      .single()
    return data
  }

  async findRecent(limit: number): Promise<Notice[]> {
    const { data } = await this.supabase
      .from('notices')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
      .limit(limit)
    return data || []
  }

  async findPublished(): Promise<Notice[]> {
    const { data } = await this.supabase
      .from('notices')
      .select('*')
      .eq('is_published', true)
      .order('created_at', { ascending: false })
    return data || []
  }

  async findAll(): Promise<Notice[]> {
    const { data } = await this.supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false })
    return data || []
  }
}

// ============================================
// Supabase Post Repository
// ============================================
class SupabasePostRepository implements IPostRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: number): Promise<Post | null> {
    const { data } = await this.supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .single()
    return data
  }

  async findByCategory(category: string): Promise<Post[]> {
    const { data } = await this.supabase
      .from('posts')
      .select('*')
      .eq('board_type', category)
      .order('created_at', { ascending: false })
    return data || []
  }

  async findRecent(limit: number): Promise<Post[]> {
    const { data } = await this.supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    return data || []
  }

  async findAll(): Promise<Post[]> {
    const { data } = await this.supabase
      .from('posts')
      .select('*')
      .order('created_at', { ascending: false })
    return data || []
  }
}

// ============================================
// Supabase Data Provider (Factory Pattern)
// ============================================
export class SupabaseDataProvider implements IDataProvider {
  readonly rankings: IRankingRepository
  readonly seasons: ISeasonRepository
  readonly profiles: IProfileRepository
  readonly donations: IDonationRepository
  readonly organization: IOrganizationRepository
  readonly notices: INoticeRepository
  readonly posts: IPostRepository

  constructor(supabase: SupabaseClient) {
    this.rankings = new SupabaseRankingRepository(supabase)
    this.seasons = new SupabaseSeasonRepository(supabase)
    this.profiles = new SupabaseProfileRepository(supabase)
    this.donations = new SupabaseDonationRepository(supabase)
    this.organization = new SupabaseOrganizationRepository(supabase)
    this.notices = new SupabaseNoticeRepository(supabase)
    this.posts = new SupabasePostRepository(supabase)
  }
}
