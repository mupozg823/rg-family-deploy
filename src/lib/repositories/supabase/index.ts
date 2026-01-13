/**
 * Supabase Repository - 통합 내보내기
 *
 * 각 도메인별 Repository는 개별 파일에서 관리:
 * - rankings.ts: 후원 랭킹
 * - seasons.ts: 시즌
 * - profiles.ts: 사용자 프로필
 * - donations.ts: 후원 내역
 * - organization.ts: 조직 구조
 * - notices.ts: 공지사항
 * - posts.ts: 게시글
 * - timeline.ts: 타임라인
 * - schedules.ts: 일정
 * - comments.ts: 댓글
 * - signatures.ts: 시그니처
 * - vip-rewards.ts: VIP 보상
 * - media.ts: 미디어 콘텐츠
 * - live-status.ts: 라이브 상태
 * - banners.ts: 배너
 * - guestbook.ts: 방명록
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { IDataProvider } from '../types'

// Individual Repository Imports (기존)
import { SupabaseRankingRepository } from './rankings'
import { SupabaseSeasonRepository } from './seasons'
import { SupabaseProfileRepository } from './profiles'
import { SupabaseDonationRepository } from './donations'
import { SupabaseOrganizationRepository } from './organization'
import { SupabaseNoticeRepository } from './notices'
import { SupabasePostRepository } from './posts'
import { SupabaseTimelineRepository } from './timeline'
import { SupabaseScheduleRepository } from './schedules'

// Individual Repository Imports (신규)
import { SupabaseCommentRepository } from './comments'
import { SupabaseSignatureRepository } from './signatures'
import { SupabaseVipRewardRepository, SupabaseVipImageRepository } from './vip-rewards'
import { SupabaseMediaContentRepository } from './media'
import { SupabaseLiveStatusRepository } from './live-status'
import { SupabaseBannerRepository } from './banners'
import { SupabaseGuestbookRepository } from './guestbook'

// Re-export individual repositories (기존)
export { SupabaseRankingRepository } from './rankings'
export { SupabaseSeasonRepository } from './seasons'
export { SupabaseProfileRepository } from './profiles'
export { SupabaseDonationRepository } from './donations'
export { SupabaseOrganizationRepository } from './organization'
export { SupabaseNoticeRepository } from './notices'
export { SupabasePostRepository } from './posts'
export { SupabaseTimelineRepository } from './timeline'
export { SupabaseScheduleRepository } from './schedules'

// Re-export individual repositories (신규)
export { SupabaseCommentRepository } from './comments'
export { SupabaseSignatureRepository } from './signatures'
export { SupabaseVipRewardRepository, SupabaseVipImageRepository } from './vip-rewards'
export { SupabaseMediaContentRepository } from './media'
export { SupabaseLiveStatusRepository } from './live-status'
export { SupabaseBannerRepository } from './banners'
export { SupabaseGuestbookRepository } from './guestbook'

/**
 * Supabase Data Provider (Factory Pattern)
 * 모든 Repository를 통합 제공
 */
export class SupabaseDataProvider implements IDataProvider {
  // Core Repositories (기존)
  readonly rankings
  readonly seasons
  readonly profiles
  readonly donations
  readonly organization
  readonly notices
  readonly posts
  readonly timeline
  readonly schedules

  // New Repositories (신규)
  readonly comments
  readonly signatures
  readonly vipRewards
  readonly vipImages
  readonly mediaContent
  readonly liveStatus
  readonly banners
  readonly guestbook

  constructor(supabase: SupabaseClient) {
    // Core Repositories
    this.rankings = new SupabaseRankingRepository(supabase)
    this.seasons = new SupabaseSeasonRepository(supabase)
    this.profiles = new SupabaseProfileRepository(supabase)
    this.donations = new SupabaseDonationRepository(supabase)
    this.organization = new SupabaseOrganizationRepository(supabase)
    this.notices = new SupabaseNoticeRepository(supabase)
    this.posts = new SupabasePostRepository(supabase)
    this.timeline = new SupabaseTimelineRepository(supabase)
    this.schedules = new SupabaseScheduleRepository(supabase)

    // New Repositories
    this.comments = new SupabaseCommentRepository(supabase)
    this.signatures = new SupabaseSignatureRepository(supabase)
    this.vipRewards = new SupabaseVipRewardRepository(supabase)
    this.vipImages = new SupabaseVipImageRepository(supabase)
    this.mediaContent = new SupabaseMediaContentRepository(supabase)
    this.liveStatus = new SupabaseLiveStatusRepository(supabase)
    this.banners = new SupabaseBannerRepository(supabase)
    this.guestbook = new SupabaseGuestbookRepository(supabase)
  }
}
