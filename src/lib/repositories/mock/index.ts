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
} from '../types'
import {
  mockProfiles,
  mockSeasons,
  mockOrganization,
  mockNotices,
  mockPosts,
  mockDonations,
} from '@/lib/mock'
import type { RankingItem, UnitFilter } from '@/types/common'
import type { Season, Profile, Organization, Notice, Donation, Post } from '@/types/database'

// ============================================
// Mock Ranking Repository
// ============================================
class MockRankingRepository implements IRankingRepository {
  async getRankings(options: {
    seasonId?: number | null
    unitFilter?: UnitFilter
  }): Promise<RankingItem[]> {
    let profiles = [...mockProfiles]

    // Unit filter
    if (options.unitFilter && options.unitFilter !== 'all') {
      profiles = profiles.filter(p => p.unit === options.unitFilter)
    }

    // Sort by donation and assign rank
    return profiles
      .filter(p => (p.total_donation || 0) > 0)
      .sort((a, b) => (b.total_donation || 0) - (a.total_donation || 0))
      .map((profile, index) => ({
        donorId: profile.id,
        donorName: profile.nickname,
        avatarUrl: profile.avatar_url,
        totalAmount: profile.total_donation || 0,
        seasonId: options.seasonId ?? undefined,
        rank: index + 1,
      }))
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
}

// Singleton instance
export const mockDataProvider = new MockDataProvider()
