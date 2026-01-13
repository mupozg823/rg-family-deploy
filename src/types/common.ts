/**
 * 공통 타입
 *
 * Supabase Join 헬퍼 및 공통 타입 정의
 * 도메인별 타입은 개별 파일에서 관리:
 * - api.ts: API 응답 타입
 * - ranking.ts: 랭킹 타입
 * - calendar.ts: 캘린더/일정 타입
 * - vip.ts: VIP/헌정 타입
 * - content.ts: 게시글/공지/시그니처 타입
 * - organization.ts: 조직 타입
 */

// ============================================
// Supabase Join Helper Types
// ============================================

/** Profile data from Supabase join */
export interface JoinedProfile {
  nickname?: string
  avatar_url?: string | null
  email?: string | null
}

/** Season data from Supabase join */
export interface JoinedSeason {
  name?: string
  start_date?: string
  end_date?: string
}

/** Comment count from Supabase join */
export interface JoinedComments {
  length?: number
}

// ============================================
// Supabase Join Helpers
// ============================================

/** Helper to safely extract joined profile data */
export function getJoinedProfile(data: unknown): JoinedProfile | null {
  if (data && typeof data === 'object') {
    return data as JoinedProfile
  }
  return null
}

/** Helper to safely extract joined season data */
export function getJoinedSeason(data: unknown): JoinedSeason | null {
  if (data && typeof data === 'object') {
    return data as JoinedSeason
  }
  return null
}

// ============================================
// Re-exports (하위 호환성)
// ============================================

// API types
export type { ApiResponse, PaginatedResponse } from './api'

// Ranking types
export type { RankingItem } from './ranking'

// Calendar types
export type { CalendarDay, ScheduleEvent } from './calendar'

// Content types
export type {
  NoticeItem,
  PostItem,
  CommentItem,
  SignatureItem,
  TimelineItem,
  NoticeCategory,
  SortOrder,
} from './content'

// VIP types
export type {
  VipPageData,
  TributeTheme,
  TributeRank,
  TributeProfile,
  TributeVideo,
  TributeGalleryImage,
  TributeDonation,
  VipTributeData,
} from './vip'

// Organization types
export type { UnitFilter } from './organization'
