/**
 * Repository Interfaces - Clean Architecture
 * 데이터 접근 추상화 레이어
 */

import type {
  Profile,
  Season,
  Donation,
  Episode,
  Notice,
  Schedule,
  Signature,
  VipReward,
  VipImage,
  MediaContent,
  LiveStatus,
  Banner,
  TributeGuestbook,
} from '@/types/database'
import type { OrganizationRecord } from '@/types/organization'
import type { RankingItem, UnitFilter, TimelineItem } from '@/types/common'
import type { CommentItem, PostItem } from '@/types/content'

// ============================================
// Pagination Types
// ============================================
export interface PaginationOptions {
  page: number
  limit: number
}

export interface PaginatedResult<T> {
  data: T[]
  totalCount: number
  page: number
  limit: number
  totalPages: number
}

export interface SearchOptions extends PaginationOptions {
  searchType?: 'all' | 'title' | 'author'
}

// ============================================
// Base Repository Interface
// ============================================
export interface IRepository<T> {
  findById(id: string | number): Promise<T | null>
  findAll(): Promise<T[]>
}

// ============================================
// Domain-Specific Repositories
// ============================================

export interface IRankingRepository {
  getRankings(options: {
    seasonId?: number | null
    unitFilter?: UnitFilter
  }): Promise<RankingItem[]>

  getTopRankers(limit: number): Promise<RankingItem[]>
}

export interface ISeasonRepository extends IRepository<Season> {
  findActive(): Promise<Season | null>
  findAll(): Promise<Season[]>
}

export interface IProfileRepository extends IRepository<Profile> {
  findByNickname(nickname: string): Promise<Profile | null>
  findVipMembers(): Promise<Profile[]>
}

export interface IDonationRepository {
  findByDonor(donorId: string): Promise<Donation[]>
  findBySeason(seasonId: number): Promise<Donation[]>
  findByEpisode(episodeId: number): Promise<Donation[]>
  getTotal(donorId: string): Promise<number>
  getTotalByEpisode(donorId: string, episodeId: number): Promise<number>
}

export interface IEpisodeRepository {
  findById(id: number): Promise<Episode | null>
  findBySeason(seasonId: number): Promise<Episode[]>
  findRankBattles(seasonId: number): Promise<Episode[]>
  findLatestRankBattle(seasonId?: number): Promise<Episode | null>
  getEpisodeRankings(episodeId: number, limit?: number): Promise<{
    rank: number
    donorId: string | null
    donorName: string
    totalAmount: number
  }[]>
  isVipForEpisode(userId: string, episodeId: number): Promise<boolean>
  isVipForRankBattles(userId: string, seasonId?: number): Promise<boolean>
}

export interface IOrganizationRepository {
  findByUnit(unit: 'excel' | 'crew'): Promise<OrganizationRecord[]>
  findLiveMembers(): Promise<OrganizationRecord[]>
  findAll(): Promise<OrganizationRecord[]>
}

export interface INoticeRepository extends IRepository<Notice> {
  findRecent(limit: number): Promise<Notice[]>
  findPublished(): Promise<Notice[]>
  findPaginated(options: PaginationOptions & { category?: string }): Promise<PaginatedResult<Notice>>
  search(query: string, options: SearchOptions & { category?: string }): Promise<PaginatedResult<Notice>>
}

export interface IPostRepository extends IRepository<PostItem> {
  findByCategory(category: string): Promise<PostItem[]>
  findRecent(limit: number): Promise<PostItem[]>
  findAll(): Promise<PostItem[]>
  incrementViewCount(id: number, currentCount?: number): Promise<number | null>
  delete(id: number): Promise<boolean>
  findPaginated(category: string, options: PaginationOptions): Promise<PaginatedResult<PostItem>>
  search(query: string, options: SearchOptions & { category?: string }): Promise<PaginatedResult<PostItem>>
  // 좋아요 기능
  toggleLike(postId: number, userId: string): Promise<{ liked: boolean; likeCount: number } | null>
  hasUserLiked(postId: number, userId: string): Promise<boolean>
}

export interface ITimelineRepository {
  findAll(): Promise<TimelineItem[]>
  findByFilter(options: {
    seasonId?: number | null
    category?: string | null
    unit?: 'excel' | 'crew' | null  // 엑셀부/크루부 필터
  }): Promise<TimelineItem[]>
  getCategories(): Promise<string[]>
}

export interface IScheduleRepository {
  findByMonth(year: number, month: number): Promise<Schedule[]>
  findByMonthAndUnit(year: number, month: number, unit: string | null): Promise<Schedule[]>
}

// ============================================
// New Domain Repositories (미구현 → 구현)
// ============================================

export interface ICommentRepository {
  findByPostId(postId: number): Promise<CommentItem[]>
  findById(id: number): Promise<CommentItem | null>
  create(data: { post_id: number; author_id: string; content: string; parent_id?: number }): Promise<CommentItem | null>
  delete(id: number): Promise<boolean>
}

export interface ISignatureRepository {
  findAll(): Promise<Signature[]>
  findById(id: number): Promise<Signature | null>
  findByUnit(unit: 'excel' | 'crew'): Promise<Signature[]>
  findByMemberName(memberName: string): Promise<Signature[]>
  findFeatured(): Promise<Signature[]>
}

export interface IVipRewardRepository {
  findByProfileId(profileId: string): Promise<VipReward | null>
  findByRank(rank: number, seasonId?: number): Promise<VipReward | null>
  findBySeason(seasonId: number): Promise<VipReward[]>
  findTop3(seasonId?: number): Promise<VipReward[]>
  findTop50(seasonId?: number): Promise<VipReward[]>
}

export interface IVipImageRepository {
  findByRewardId(rewardId: number): Promise<VipImage[]>
  findByProfileId(profileId: string): Promise<VipImage[]>
}

export interface IMediaContentRepository {
  findAll(): Promise<MediaContent[]>
  findById(id: number): Promise<MediaContent | null>
  findByType(contentType: 'shorts' | 'vod'): Promise<MediaContent[]>
  findByUnit(unit: 'excel' | 'crew' | null): Promise<MediaContent[]>
  findFeatured(): Promise<MediaContent[]>
}

export interface ILiveStatusRepository {
  findAll(): Promise<LiveStatus[]>
  findByMemberId(memberId: number): Promise<LiveStatus[]>
  findLive(): Promise<LiveStatus[]>
  updateStatus(memberId: number, isLive: boolean, viewerCount?: number): Promise<boolean>
}

export interface IBannerRepository {
  findAll(): Promise<Banner[]>
  findActive(): Promise<Banner[]>
  findById(id: number): Promise<Banner | null>
  toggleActive(id: number): Promise<boolean>
  reorder(bannerIds: number[]): Promise<boolean>
}

export interface IGuestbookRepository {
  findByTributeUserId(tributeUserId: string): Promise<TributeGuestbook[]>
  findById(id: number): Promise<TributeGuestbook | null>
  create(data: {
    tribute_user_id: string
    author_id: string
    author_name: string
    message: string
    is_member?: boolean
  }): Promise<TributeGuestbook | null>
  delete(id: number): Promise<boolean>
}

// ============================================
// Data Provider Interface (Strategy Pattern)
// ============================================
export interface IDataProvider {
  // Core Repositories (기존)
  rankings: IRankingRepository
  seasons: ISeasonRepository
  profiles: IProfileRepository
  donations: IDonationRepository
  organization: IOrganizationRepository
  notices: INoticeRepository
  posts: IPostRepository
  timeline: ITimelineRepository
  schedules: IScheduleRepository
  // Episode-based VIP System
  episodes?: IEpisodeRepository
  // New Repositories (선택적 - 점진적 구현)
  comments?: ICommentRepository
  signatures?: ISignatureRepository
  vipRewards?: IVipRewardRepository
  vipImages?: IVipImageRepository
  mediaContent?: IMediaContentRepository
  liveStatus?: ILiveStatusRepository
  banners?: IBannerRepository
  guestbook?: IGuestbookRepository
}

// ============================================
// Factory Pattern for Provider Creation
// ============================================
export type DataProviderType = 'mock' | 'supabase'
