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
  ICommentRepository,
  ISignatureRepository,
  IMediaContentRepository,
  IBannerRepository,
  ITimelineRepository,
  IScheduleRepository,
} from '../types'
import {
  mockProfiles,
  mockSeasons,
  mockOrganization,
  mockNotices,
  mockPosts,
  mockComments,
  mockDonations,
  mockMediaContent,
  mockSignatureData,
  mockBanners,
  mockTimelineEvents,
  mockSchedules,
} from '@/lib/mock'
import type { RankingItem, UnitFilter, TimelineItem } from '@/types/common'
import type { Season, Profile, Notice, Donation, Post, Schedule, Signature, MediaContent, Comment, Banner } from '@/types/database'
import type { OrganizationRecord } from '@/types/organization'
import type { CommentItem, PostItem } from '@/types/content'

const mockSignatureRows: Signature[] = mockSignatureData.map((sig) => {
  const firstVideo = sig.videos[0]
  return {
    id: sig.id,
    title: sig.title,
    description: null,
    unit: sig.unit,
    member_name: firstVideo?.memberName || 'Unknown',
    media_type: 'video',
    media_url: firstVideo?.videoUrl || '',
    thumbnail_url: sig.thumbnailUrl,
    tags: [],
    view_count: firstVideo?.viewCount || 0,
    is_featured: sig.isFeatured,
    created_at: sig.createdAt,
  }
})

const mockBannerRows: Banner[] = mockBanners.map((banner, index) => ({
  id: banner.id,
  title: banner.title,
  image_url: banner.imageUrl || banner.memberImageUrl || '',
  link_url: banner.linkUrl || null,
  display_order: banner.displayOrder ?? index,
  is_active: banner.isActive ?? true,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}))

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
  async findByUnit(unit: 'excel' | 'crew'): Promise<OrganizationRecord[]> {
    return mockOrganization.filter(o => o.unit === unit)
  }

  async findLiveMembers(): Promise<OrganizationRecord[]> {
    return mockOrganization.filter(o => o.is_live)
  }

  async findAll(): Promise<OrganizationRecord[]> {
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
  private mapPostItem(post: Post): PostItem {
    const author = mockProfiles.find(profile => profile.id === post.author_id)
    const categories = ['잡담', '정보', '후기', '질문']
    const category = categories[(post.id - 1) % categories.length]
    return {
      id: post.id,
      boardType: post.board_type,
      category,
      title: post.title,
      content: post.content || '',
      authorId: post.author_id,
      authorName: post.is_anonymous ? '익명' : (author?.nickname || '익명'),
      authorAvatar: post.is_anonymous ? null : (author?.avatar_url || null),
      viewCount: post.view_count || 0,
      likeCount: post.like_count || 0,
      commentCount: post.comment_count || 0,
      isAnonymous: post.is_anonymous,
      createdAt: post.created_at,
    }
  }

  async findById(id: number): Promise<PostItem | null> {
    const post = mockPosts.find(p => p.id === id) || null
    return post ? this.mapPostItem(post) : null
  }

  async findByCategory(category: string): Promise<PostItem[]> {
    return mockPosts
      .filter(p => p.board_type === category)
      .map((post) => this.mapPostItem(post))
  }

  async findRecent(limit: number): Promise<PostItem[]> {
    return mockPosts.slice(0, limit).map((post) => this.mapPostItem(post))
  }

  async findAll(): Promise<PostItem[]> {
    return mockPosts.map((post) => this.mapPostItem(post))
  }

  async incrementViewCount(id: number, currentCount?: number): Promise<number | null> {
    void id
    return (currentCount || 0) + 1
  }

  async delete(id: number): Promise<boolean> {
    void id
    return true
  }
}

// ============================================
// Mock Comment Repository
// ============================================
class MockCommentRepository implements ICommentRepository {
  private mapCommentItem(comment: Comment): CommentItem {
    const author = mockProfiles.find(profile => profile.id === comment.author_id)
    return {
      id: comment.id,
      postId: comment.post_id,
      content: comment.content,
      authorId: comment.author_id,
      authorName: author?.nickname || '익명',
      authorAvatar: author?.avatar_url || null,
      createdAt: comment.created_at,
    }
  }

  async findByPostId(postId: number): Promise<CommentItem[]> {
    return mockComments
      .filter(comment => comment.post_id === postId && !comment.is_deleted)
      .map((comment) => this.mapCommentItem(comment))
  }

  async findById(id: number): Promise<CommentItem | null> {
    const comment = mockComments.find(item => item.id === id && !item.is_deleted) || null
    return comment ? this.mapCommentItem(comment) : null
  }

  async create(data: {
    post_id: number
    author_id: string
    content: string
    parent_id?: number
  }): Promise<CommentItem | null> {
    const now = new Date().toISOString()
    const nextId = mockComments.length > 0
      ? Math.max(...mockComments.map(comment => comment.id)) + 1
      : 1
    const newComment: Comment = {
      id: nextId,
      post_id: data.post_id,
      author_id: data.author_id,
      content: data.content,
      parent_id: data.parent_id || null,
      is_deleted: false,
      created_at: now,
    }
    return this.mapCommentItem(newComment)
  }

  async delete(id: number): Promise<boolean> {
    void id
    return true
  }
}

// ============================================
// Mock Signature Repository
// ============================================
class MockSignatureRepository implements ISignatureRepository {
  async findAll(): Promise<Signature[]> {
    return mockSignatureRows
  }

  async findById(id: number): Promise<Signature | null> {
    return mockSignatureRows.find(sig => sig.id === id) || null
  }

  async findByUnit(unit: 'excel' | 'crew'): Promise<Signature[]> {
    return mockSignatureRows.filter(sig => sig.unit === unit)
  }

  async findByMemberName(memberName: string): Promise<Signature[]> {
    return mockSignatureRows.filter(sig => sig.member_name === memberName)
  }

  async findFeatured(): Promise<Signature[]> {
    return mockSignatureRows.filter(sig => sig.is_featured)
  }
}

// ============================================
// Mock Media Content Repository
// ============================================
class MockMediaContentRepository implements IMediaContentRepository {
  async findAll(): Promise<MediaContent[]> {
    return mockMediaContent
  }

  async findById(id: number): Promise<MediaContent | null> {
    return mockMediaContent.find(item => item.id === id) || null
  }

  async findByType(contentType: 'shorts' | 'vod'): Promise<MediaContent[]> {
    return mockMediaContent.filter(item => item.content_type === contentType)
  }

  async findByUnit(unit: 'excel' | 'crew' | null): Promise<MediaContent[]> {
    if (unit === null) {
      return mockMediaContent.filter(item => item.unit === null)
    }
    return mockMediaContent.filter(item => item.unit === unit)
  }

  async findFeatured(): Promise<MediaContent[]> {
    return mockMediaContent.filter(item => item.is_featured)
  }
}

// ============================================
// Mock Banner Repository
// ============================================
class MockBannerRepository implements IBannerRepository {
  async findAll(): Promise<Banner[]> {
    return mockBannerRows
  }

  async findActive(): Promise<Banner[]> {
    return mockBannerRows.filter((banner) => banner.is_active)
  }

  async findById(id: number): Promise<Banner | null> {
    return mockBannerRows.find((banner) => banner.id === id) || null
  }

  async create(data: {
    image_url: string
    title?: string
    link_url?: string
    display_order?: number
    is_active?: boolean
  }): Promise<Banner | null> {
    void data
    return null
  }

  async update(id: number, data: Partial<Banner>): Promise<Banner | null> {
    void id
    void data
    return null
  }

  async delete(id: number): Promise<boolean> {
    void id
    return true
  }

  async toggleActive(id: number): Promise<boolean> {
    void id
    return true
  }

  async reorder(bannerIds: number[]): Promise<boolean> {
    void bannerIds
    return true
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
      unit: event.unit,  // 엑셀부/크루부 필터용
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
    unit?: 'excel' | 'crew' | null  // 엑셀부/크루부 필터
  }): Promise<TimelineItem[]> {
    const { seasonId, category, unit } = options
    let events = [...mockTimelineEvents]

    if (seasonId) {
      events = events.filter(e => e.season_id === seasonId)
    }

    if (category) {
      events = events.filter(e => e.category === category)
    }

    // unit 필터: null은 전체, 'excel'/'crew'는 해당 유닛 + null(전체 이벤트)
    if (unit) {
      events = events.filter(e => e.unit === unit || e.unit === null)
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
  readonly comments = new MockCommentRepository()
  readonly signatures = new MockSignatureRepository()
  readonly mediaContent = new MockMediaContentRepository()
  readonly banners = new MockBannerRepository()
  readonly timeline = new MockTimelineRepository()
  readonly schedules = new MockScheduleRepository()
}

// Singleton instance
export const mockDataProvider = new MockDataProvider()
