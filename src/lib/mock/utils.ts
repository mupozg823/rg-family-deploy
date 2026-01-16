/**
 * Mock Data Utilities - Re-export
 *
 * 실제 구현은 @/lib/utils/mock.ts에서 관리
 * 이 파일은 기존 import 경로 호환성을 위해 유지
 */

export {
  // Avatar generators
  getPlaceholderAvatar,
  getMemberAvatar,
  getVipAvatar,
  // Thumbnail generators
  getUnsplashThumbnail,
  getPicsumThumbnail,
  getGradientPlaceholder,
  // Character/Banner images
  getMemberCharacterImage,
  getBannerBackground,
  // Timeline images
  getTimelinePlaceholder,
  // Date utilities
  getDateWithOffset,
  getCurrentTimestamp,
} from '@/lib/utils/mock'
