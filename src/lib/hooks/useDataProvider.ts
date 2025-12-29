'use client'

/**
 * useDataProvider Hook
 *
 * @deprecated Context 기반 사용 권장
 * 새 코드에서는 useDataProviderContext 사용
 *
 * @example
 * // Old (deprecated)
 * import { useDataProvider } from '@/lib/hooks'
 *
 * // New (recommended)
 * import { useDataProviderContext } from '@/lib/context'
 */

import {
  useDataProviderContext,
  useRankings,
  useSeasons,
  useProfiles,
  useOrganization,
  useNotices,
  usePosts,
} from '@/lib/context'

/**
 * @deprecated Use useDataProviderContext from @/lib/context instead
 */
export function useDataProvider() {
  return useDataProviderContext()
}

/**
 * @deprecated Use useRankings from @/lib/context instead
 */
export function useRankingRepository() {
  return useRankings()
}

/**
 * @deprecated Use useSeasons from @/lib/context instead
 */
export function useSeasonRepository() {
  return useSeasons()
}

/**
 * @deprecated Use useProfiles from @/lib/context instead
 */
export function useProfileRepository() {
  return useProfiles()
}

/**
 * @deprecated Use useOrganization from @/lib/context instead
 */
export function useOrganizationRepository() {
  return useOrganization()
}

/**
 * @deprecated Use useNotices from @/lib/context instead
 */
export function useNoticeRepository() {
  return useNotices()
}

/**
 * @deprecated Use usePosts from @/lib/context instead
 */
export function usePostRepository() {
  return usePosts()
}
