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
  ITimelineRepository,
  IScheduleRepository,
} from '../types'
import type { RankingItem, UnitFilter, TimelineItem, JoinedSeason } from '@/types/common'
import type { Season, Profile, Organization, Notice, Donation, Post, Schedule } from '@/types/database'

// ============================================
// Supabase Ranking Repository
// ============================================
class SupabaseRankingRepository implements IRankingRepository {
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
// Supabase Timeline Repository
// ============================================
class SupabaseTimelineRepository implements ITimelineRepository {
  constructor(private supabase: SupabaseClient) {}

  private formatEvent(event: Record<string, unknown>): TimelineItem {
    const season = event.seasons as JoinedSeason | null
    return {
      id: event.id as number,
      eventDate: event.event_date as string,
      title: event.title as string,
      description: event.description as string | null,
      imageUrl: event.image_url as string | null,
      category: event.category as string | null,
      seasonId: event.season_id as number | null,
      seasonName: season?.name,
    }
  }

  async findAll(): Promise<TimelineItem[]> {
    const { data, error } = await this.supabase
      .from('timeline_events')
      .select('*, seasons(name)')
      .order('event_date', { ascending: false })

    if (error) throw error
    return (data || []).map(e => this.formatEvent(e))
  }

  async findByFilter(options: {
    seasonId?: number | null
    category?: string | null
  }): Promise<TimelineItem[]> {
    const { seasonId, category } = options

    let query = this.supabase
      .from('timeline_events')
      .select('*, seasons(name)')
      .order('event_date', { ascending: false })

    if (seasonId) {
      query = query.eq('season_id', seasonId)
    }

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) throw error
    return (data || []).map(e => this.formatEvent(e))
  }

  async getCategories(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('timeline_events')
      .select('category')

    if (error) throw error

    const cats = new Set<string>()
    ;(data || []).forEach(e => {
      if (e.category) cats.add(e.category)
    })
    return Array.from(cats)
  }
}

// ============================================
// Supabase Schedule Repository
// ============================================
class SupabaseScheduleRepository implements IScheduleRepository {
  constructor(private supabase: SupabaseClient) {}

  async findByMonth(year: number, month: number): Promise<Schedule[]> {
    const startOfMonth = new Date(year, month, 1)
    const endOfMonth = new Date(year, month + 1, 0)

    const { data, error } = await this.supabase
      .from('schedules')
      .select('*')
      .gte('start_datetime', startOfMonth.toISOString())
      .lte('start_datetime', endOfMonth.toISOString())
      .order('start_datetime', { ascending: true })

    if (error) throw error
    return data || []
  }

  async findByMonthAndUnit(year: number, month: number, unit: string | null): Promise<Schedule[]> {
    const startOfMonth = new Date(year, month, 1)
    const endOfMonth = new Date(year, month + 1, 0)

    let query = this.supabase
      .from('schedules')
      .select('*')
      .gte('start_datetime', startOfMonth.toISOString())
      .lte('start_datetime', endOfMonth.toISOString())
      .order('start_datetime', { ascending: true })

    if (unit && unit !== 'all') {
      query = query.or(`unit.eq.${unit},unit.is.null`)
    }

    const { data, error } = await query

    if (error) throw error
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
  readonly timeline: ITimelineRepository
  readonly schedules: IScheduleRepository

  constructor(supabase: SupabaseClient) {
    this.rankings = new SupabaseRankingRepository(supabase)
    this.seasons = new SupabaseSeasonRepository(supabase)
    this.profiles = new SupabaseProfileRepository(supabase)
    this.donations = new SupabaseDonationRepository(supabase)
    this.organization = new SupabaseOrganizationRepository(supabase)
    this.notices = new SupabaseNoticeRepository(supabase)
    this.posts = new SupabasePostRepository(supabase)
    this.timeline = new SupabaseTimelineRepository(supabase)
    this.schedules = new SupabaseScheduleRepository(supabase)
  }
}
