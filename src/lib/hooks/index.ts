/**
 * Hooks Module
 *
 * @deprecated Context 기반 사용 권장
 * 새 코드에서는 @/lib/context 에서 직접 import
 */

// Legacy hooks (re-export from context)
export { useSupabase } from './useSupabase'
export { useAuth } from './useAuth'
export { useSchedule } from './useSchedule'
export { useRanking } from './useRanking'
export * from './useMockData'

// Clean Architecture - Repository Pattern (deprecated)
export {
  useDataProvider,
  useRankingRepository,
  useSeasonRepository,
  useProfileRepository,
  useOrganizationRepository,
  useNoticeRepository,
  usePostRepository,
} from './useDataProvider'

// Re-export from Context (recommended)
export {
  useTheme,
  useSupabaseContext,
  useAuthContext,
  useDataProviderContext,
  useRankings,
  useSeasons,
  useProfiles,
  useDonations,
  useOrganization,
  useNotices,
  usePosts,
} from '@/lib/context'
