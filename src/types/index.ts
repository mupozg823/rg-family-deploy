/**
 * 타입 정의 통합 내보내기
 *
 * 도메인별 분류:
 * - api: API 응답 타입
 * - ranking: 랭킹 타입
 * - calendar: 캘린더/일정 타입
 * - content: 게시글/공지/시그니처 타입
 * - vip: VIP/헌정 타입
 * - organization: 조직도 타입
 * - database: Supabase 스키마 타입
 * - common: Supabase Join 헬퍼
 */

// Organization types (소스 of truth for UnitFilter)
export * from './organization'

// Domain-specific types
export * from './api'
export * from './ranking'
export * from './calendar'
export * from './content'
export * from './vip'

// Common/Supabase join helpers
export {
  type JoinedProfile,
  type JoinedSeason,
  type JoinedComments,
  getJoinedProfile,
  getJoinedSeason,
} from './common'

// Database types
export * from './database'
