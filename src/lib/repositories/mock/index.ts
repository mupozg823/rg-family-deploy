/**
 * Mock Repository Implementations
 * 개발/테스트용 Mock 데이터 저장소
 */

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
import {
  mockProfiles,
  mockSeasons,
  mockOrganization,
  mockNotices,
  mockPosts,
  mockDonations,
  mockTimelineEvents,
  mockSchedules,
} from '@/lib/mock'
import type { RankingItem, UnitFilter, TimelineItem } from '@/types/common'
import type { Season, Profile, Organization, Notice, Donation, Post, Schedule } from '@/types/database'

// ============================================
// Mock Ranking Repository
// ============================================
class MockRankingRepository implements IRankingRepository {
  async getRankings(options: {
    seasonId?: number | null
    unitFilter?: UnitFilter
  }): Promise<RankingItem[]> {
    const { seasonId, unitFilter } = options

    // 시즌이 선택된 경우: donations에서 계산
    if (seasonId) {
      let seasonDonations = mockDonations.filter(d => d.season_id === seasonId)

      // VIP는 전체에서 Top 50이므로 유닛 필터 스킵
      if (unitFilter && unitFilter !== 'all' && unitFilter !== 'vip') {
        seasonDonations = seasonDonations.filter(d => d.unit === unitFilter)
      }

      // 후원자별 합계 계산
      const donorMap = new Map<string, {
        donorId: string | null
        donorName: string
        avatarUrl: string | null
        totalAmount: number
      }>()

      seasonDonations.forEach(donation => {
        const key = donation.donor_id || donation.donor_name
        const existing = donorMap.get(key)
        if (existing) {
          existing.totalAmount += donation.amount
        } else {
          const profile = mockProfiles.find(p => p.id === donation.donor_id)
          donorMap.set(key, {
            donorId: donation.donor_id,
            donorName: profile?.nickname || donation.donor_name,
            avatarUrl: profile?.avatar_url || null,
            totalAmount: donation.amount,
          })
        }
      })

      // 정렬 및 순위 부여
      let sorted = Array.from(donorMap.values())
        .sort((a, b) => b.totalAmount - a.totalAmount)
        .map((item, index) => ({
          ...item,
          seasonId,
          rank: index + 1,
        }))

      // VIP 필터: Top 50만 표시
      if (unitFilter === 'vip') {
        sorted = sorted.slice(0, 50)
      }

      return sorted
    }

    // 시즌 미선택: profiles 기반 전체 랭킹
    let profiles = [...mockProfiles]

    // VIP는 전체에서 Top 50이므로 유닛 필터 스킵
    if (unitFilter && unitFilter !== 'all' && unitFilter !== 'vip') {
      profiles = profiles.filter(p => p.unit === unitFilter)
    }

    // Sort by donation and assign rank
    let sorted = profiles
      .filter(p => (p.total_donation || 0) > 0)
      .sort((a, b) => (b.total_donation || 0) - (a.total_donation || 0))
      .map((profile, index) => ({
        donorId: profile.id,
        donorName: profile.nickname,
        avatarUrl: profile.avatar_url,
        totalAmount: profile.total_donation || 0,
        seasonId: undefined,
        rank: index + 1,
      }))

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
// Mock Season Repository
// ============================================
class MockSeasonRepository implements ISeasonRepository {
  async findById(id: number): Promise<Season | null> {
    return mockSeasons.find(s => s.id === id) || null
  }

  async findActive(): Promise<Season | null> {
    return mockSeasons.find(s => s.is_active) || null
  }

  async findAll(): Promise<Season[]> {
    return mockSeasons
  }
}

// ============================================
// Mock Profile Repository
// ============================================
class MockProfileRepository implements IProfileRepository {
  async findById(id: string): Promise<Profile | null> {
    return mockProfiles.find(p => p.id === id) || null
  }

  async findByNickname(nickname: string): Promise<Profile | null> {
    return mockProfiles.find(p => p.nickname === nickname) || null
  }

  async findVipMembers(): Promise<Profile[]> {
    return mockProfiles.filter(p => p.role === 'vip')
  }

  async findAll(): Promise<Profile[]> {
    return mockProfiles
  }
}

// ============================================
// Mock Donation Repository
// ============================================
class MockDonationRepository implements IDonationRepository {
  async findByDonor(donorId: string): Promise<Donation[]> {
    return mockDonations.filter(d => d.donor_id === donorId)
  }

  async findBySeason(seasonId: number): Promise<Donation[]> {
    return mockDonations.filter(d => d.season_id === seasonId)
  }

  async getTotal(donorId: string): Promise<number> {
    const donations = await this.findByDonor(donorId)
    return donations.reduce((sum, d) => sum + d.amount, 0)
  }
}

// ============================================
// Mock Organization Repository
// ============================================
class MockOrganizationRepository implements IOrganizationRepository {
  async findByUnit(unit: 'excel' | 'crew'): Promise<Organization[]> {
    return mockOrganization.filter(o => o.unit === unit)
  }

  async findLiveMembers(): Promise<Organization[]> {
    return mockOrganization.filter(o => o.is_live)
  }

  async findAll(): Promise<Organization[]> {
    return mockOrganization
  }
}

// ============================================
// Mock Notice Repository
// ============================================
class MockNoticeRepository implements INoticeRepository {
  async findById(id: number): Promise<Notice | null> {
    return mockNotices.find(n => n.id === id) || null
  }

  async findRecent(limit: number): Promise<Notice[]> {
    return mockNotices.slice(0, limit)
  }

  async findPublished(): Promise<Notice[]> {
    // Mock notices are all considered published
    return mockNotices
  }

  async findAll(): Promise<Notice[]> {
    return mockNotices
  }
}

// ============================================
// Mock Post Repository
// ============================================
class MockPostRepository implements IPostRepository {
  async findById(id: number): Promise<Post | null> {
    return mockPosts.find(p => p.id === id) || null
  }

  async findByCategory(category: string): Promise<Post[]> {
    return mockPosts.filter(p => p.board_type === category)
  }

  async findRecent(limit: number): Promise<Post[]> {
    return mockPosts.slice(0, limit)
  }

  async findAll(): Promise<Post[]> {
    return mockPosts
  }
}

// ============================================
// Mock Timeline Repository
// ============================================
class MockTimelineRepository implements ITimelineRepository {
  private formatEvent(event: typeof mockTimelineEvents[0]): TimelineItem {
    const season = mockSeasons.find(s => s.id === event.season_id)
    return {
      id: event.id,
      eventDate: event.event_date,
      title: event.title,
      description: event.description,
      imageUrl: event.image_url,
      category: event.category,
      seasonId: event.season_id,
      seasonName: season?.name,
    }
  }

  async findAll(): Promise<TimelineItem[]> {
    return mockTimelineEvents
      .map(e => this.formatEvent(e))
      .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())
  }

  async findByFilter(options: {
    seasonId?: number | null
    category?: string | null
  }): Promise<TimelineItem[]> {
    const { seasonId, category } = options
    let events = [...mockTimelineEvents]

    if (seasonId) {
      events = events.filter(e => e.season_id === seasonId)
    }

    if (category) {
      events = events.filter(e => e.category === category)
    }

    return events
      .map(e => this.formatEvent(e))
      .sort((a, b) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime())
  }

  async getCategories(): Promise<string[]> {
    const cats = new Set<string>()
    mockTimelineEvents.forEach(e => {
      if (e.category) cats.add(e.category)
    })
    return Array.from(cats)
  }
}

// ============================================
// Mock Schedule Repository
// ============================================
class MockScheduleRepository implements IScheduleRepository {
  async findByMonth(year: number, month: number): Promise<Schedule[]> {
    return mockSchedules.filter(s => {
      const date = new Date(s.start_datetime)
      return date.getFullYear() === year && date.getMonth() === month
    })
  }

  async findByMonthAndUnit(year: number, month: number, unit: string | null): Promise<Schedule[]> {
    let schedules = await this.findByMonth(year, month)

    if (unit && unit !== 'all') {
      schedules = schedules.filter(s => s.unit === unit || s.unit === null)
    }

    return schedules.sort((a, b) =>
      new Date(a.start_datetime).getTime() - new Date(b.start_datetime).getTime()
    )
  }
}

// ============================================
// Mock Data Provider (Facade Pattern)
// ============================================
export class MockDataProvider implements IDataProvider {
  readonly rankings = new MockRankingRepository()
  readonly seasons = new MockSeasonRepository()
  readonly profiles = new MockProfileRepository()
  readonly donations = new MockDonationRepository()
  readonly organization = new MockOrganizationRepository()
  readonly notices = new MockNoticeRepository()
  readonly posts = new MockPostRepository()
  readonly timeline = new MockTimelineRepository()
  readonly schedules = new MockScheduleRepository()
}

// Singleton instance
export const mockDataProvider = new MockDataProvider()
