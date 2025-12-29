'use client'

/**
 * useSupabase Hook
 *
 * @deprecated Context 기반 사용 권장
 * 새 코드에서는 useSupabaseContext 사용
 *
 * @example
 * // Old (deprecated)
 * import { useSupabase } from '@/lib/hooks'
 *
 * // New (recommended)
 * import { useSupabaseContext } from '@/lib/context'
 */

import { useSupabaseContext } from '@/lib/context'

/**
 * @deprecated Use useSupabaseContext from @/lib/context instead
 */
export function useSupabase() {
  return useSupabaseContext()
}
