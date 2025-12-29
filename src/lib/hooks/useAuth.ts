'use client'

/**
 * useAuth Hook
 *
 * @deprecated Context 기반 사용 권장
 * 새 코드에서는 useAuthContext 사용
 *
 * @example
 * // Old (deprecated)
 * import { useAuth } from '@/lib/hooks'
 *
 * // New (recommended)
 * import { useAuthContext } from '@/lib/context'
 */

import { useAuthContext } from '@/lib/context'

/**
 * @deprecated Use useAuthContext from @/lib/context instead
 */
export function useAuth() {
  return useAuthContext()
}
