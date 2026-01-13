/**
 * VIP 타입
 *
 * VIP 페이지 및 헌정 관련 타입 정의
 */

/** VIP 페이지 데이터 */
export interface VipPageData {
  profile: {
    id: string
    nickname: string
    avatarUrl: string | null
    totalDonation: number
  }
  reward: {
    seasonId: number
    seasonName: string
    rank: number
    personalMessage: string | null
    dedicationVideoUrl: string | null
  }
  images: {
    id: number
    imageUrl: string
    title: string | null
  }[]
  donationHistory: {
    id: number
    amount: number
    message: string | null
    createdAt: string
  }[]
}

// Top 1-3 Tribute Page types
export type TributeTheme = 'gold' | 'silver' | 'bronze'
export type TributeRank = 1 | 2 | 3

/** 헌정 프로필 */
export interface TributeProfile {
  id: string
  nickname: string
  avatarUrl: string | null
  totalDonation: number
  joinedAt: string
}

/** 헌정 비디오 */
export interface TributeVideo {
  id: number
  url: string
  thumbnailUrl: string | null
  title: string
  duration: number | null
}

/** 헌정 갤러리 이미지 */
export interface TributeGalleryImage {
  id: number
  url: string
  title: string
  description: string | null
}

/** 헌정 후원 내역 */
export interface TributeDonation {
  id: number
  amount: number
  message: string | null
  createdAt: string
  seasonName: string
}

/** VIP 헌정 데이터 */
export interface VipTributeData {
  rank: TributeRank
  theme: TributeTheme
  seasonId: number
  seasonName: string
  profile: TributeProfile
  personalMessage: string
  streamerSignature: string | null
  dedicationVideo: TributeVideo | null
  exclusiveGallery: TributeGalleryImage[]
  donationTimeline: TributeDonation[]
  specialBadges: string[]
}
