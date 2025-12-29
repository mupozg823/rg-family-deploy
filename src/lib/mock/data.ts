/**
 * Mock Data (Legacy Re-export)
 *
 * 이 파일은 하위 호환성을 위해 유지됩니다.
 * 새 코드에서는 ./index.ts에서 직접 import하세요.
 *
 * @deprecated Use imports from '@/lib/mock' instead
 *
 * @example
 * // Old (deprecated)
 * import { mockProfiles } from '@/lib/mock/data'
 *
 * // New (recommended)
 * import { mockProfiles } from '@/lib/mock'
 */

// Re-export all from modular structure
export * from './index'

// Re-export types
export type { MockBanner as Banner } from './banners'
