/**
 * Mock Data Module
 *
 * 모든 Mock 데이터를 중앙에서 export
 * Clean Architecture 적용 - 도메인별 분리
 */

// ============================================
// Domain Data Exports
// ============================================
export { mockProfiles, mockAdminProfile } from './profiles'
export { mockSeasons } from './seasons'
export { mockOrganization } from './organization'
export { mockDonations } from './donations'
export { mockSignatures, mockSignatureData, signatureCategories, type SignatureData, type SignatureVideo, type Signature } from './signatures'
export { mockSchedules } from './schedules'
export { mockTimelineEvents } from './timeline'
export { mockNotices } from './notices'
export { mockPosts } from './posts'
export {
  mockComments,
  getCommentsByPostId,
  getRootCommentsByPostId,
  getRepliesByParentId,
  getCommentById,
  getCommentCountByPostId,
} from './comments'
export { mockMediaContent } from './media'
export { mockLiveStatus } from './live-status'
export { mockBanners, type MockBanner } from './banners'
export {
  mockVipContent,
  mockVipMemberVideos,
  mockVipSignatures,
  mockVipRewards,
  getVipRewardByProfileId,
  getVipRewardByRank,
  type VipContent,
  type VipMemberVideo,
  type VipSignature,
  type VipRewardData,
} from './vip-content'

// Top 1-3 Tribute Page
export {
  mockVipTributeData,
  getVipTributeByRank,
  getVipTributeByUserId,
  isTop3Rank,
  getTributeThemeColors,
  getRankTheme,
  TRIBUTE_THEMES,
  TRIBUTE_COLORS,
} from './vip-tribute'

// Tribute Guestbook (방명록)
export {
  mockTributeGuestbook,
  getGuestbookByTributeUserId,
  getGuestbookByRank,
  getGuestbookCountByTributeUserId,
  getMemberGuestbookByTributeUserId,
  type GuestbookEntry,
} from './guestbook'

// VIP Rewards (Database Schema 기반)
export {
  mockVipRewards as mockVipRewardsDB,
  mockVipImages,
  getVipRewardByProfileId as getVipRewardDBByProfileId,
  getVipRewardByRank as getVipRewardDBByRank,
  getVipImagesByRewardId,
  getVipImagesByProfileId,
  getTop3Rewards,
  getTop50Rewards,
} from './vip-rewards'

// Hall of Fame (명예의 전당)
export {
  mockHallOfFameSeasons,
  mockHallOfFameEpisodes,
  getAllHallOfFameHonors,
  getHallOfFameByUserId,
  hasHonorPageQualification,
  getHonorPageQualifiedDonorIds,
  EPISODE_HIGH_DONOR_THRESHOLD,
  type HallOfFameHonor,
  type HallOfFameSeason,
  type HallOfFameEpisode,
  type TributeMemberVideo,
  type TributeSignature,
} from './hall-of-fame'

// ============================================
// Utility Exports
// ============================================
export {
  getPlaceholderAvatar,
  getMemberAvatar,
  getVipAvatar,
  getUnsplashThumbnail,
  getPicsumThumbnail,
  getGradientPlaceholder,
  getMemberCharacterImage,
  getBannerBackground,
  getTimelinePlaceholder,
  getDateWithOffset,
  getCurrentTimestamp,
} from './utils'

// ============================================
// Helper Functions
// ============================================
import { mockOrganization } from './organization'
import { mockLiveStatus } from './live-status'
import { getMockDonations, clearDonationsCache } from './donations'
import { mockSeasons } from './seasons'

// Re-export cache control functions
export { clearDonationsCache }

/**
 * 라이브 중인 멤버 정보 조회
 */
export const getLiveMembersWithInfo = () => {
  return mockLiveStatus
    .filter((status) => status.is_live)
    .map((status) => {
      const member = mockOrganization.find((m) => m.id === status.member_id)
      return { ...status, member }
    })
}

// ============================================
// 랭킹 데이터 캐시 (메모이제이션)
// ============================================
const rankingCache = new Map<number, { name: string; amount: number; unit: string | null; rank: number }[]>()

/**
 * 시즌별 랭킹 데이터 조회 (메모이제이션 적용)
 * 동일한 시즌 ID에 대해 캐시된 결과 반환
 */
export const getRankingData = (seasonId?: number) => {
  const targetSeasonId = seasonId || mockSeasons.find((s) => s.is_active)?.id || 4

  // 캐시 확인
  if (rankingCache.has(targetSeasonId)) {
    return rankingCache.get(targetSeasonId)!
  }

  // 레이지 로딩된 donations 데이터 사용
  const donations = getMockDonations()
  const seasonDonations = donations.filter((d) => d.season_id === targetSeasonId)

  const rankingMap = new Map<string, { name: string; amount: number; unit: string | null }>()

  seasonDonations.forEach((donation) => {
    const key = donation.donor_name
    const existing = rankingMap.get(key)
    if (existing) {
      existing.amount += donation.amount
    } else {
      rankingMap.set(key, {
        name: donation.donor_name,
        amount: donation.amount,
        unit: donation.unit,
      })
    }
  })

  const result = Array.from(rankingMap.values())
    .sort((a, b) => b.amount - a.amount)
    .map((item, index) => ({ rank: index + 1, ...item }))

  // 캐시에 저장
  rankingCache.set(targetSeasonId, result)

  return result
}

/**
 * 랭킹 캐시 초기화
 * 후원 데이터 변경 시 호출 필요
 */
export const clearRankingCache = () => {
  rankingCache.clear()
}

/**
 * 모든 Mock 캐시 초기화
 * 테스트 또는 메모리 해제 용도
 */
export const clearAllMockCaches = () => {
  clearDonationsCache()
  clearRankingCache()
}
