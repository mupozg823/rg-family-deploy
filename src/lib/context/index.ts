/**
 * Context Module
 *
 * Clean Architecture Context 계층
 * - 전역 상태 관리
 * - Provider 합성
 */

// Theme
export { ThemeProvider, useTheme } from './ThemeContext'

// Supabase
export { SupabaseProvider, useSupabaseContext } from './SupabaseContext'

// Auth
export { AuthProvider, useAuthContext } from './AuthContext'

// DataProvider
export {
  DataProviderProvider,
  useDataProviderContext,
  useRankings,
  useSeasons,
  useProfiles,
  useDonations,
  useOrganization,
  useNotices,
  usePosts,
  useTimeline,
  useSchedules,
} from './DataProviderContext'
