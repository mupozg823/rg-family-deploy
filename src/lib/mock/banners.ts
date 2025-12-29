/**
 * Mock Banners Data
 * 메인 히어로 슬라이더 배너
 */

import { getMemberCharacterImage } from './utils'

// 확장된 Banner 타입 (프론트엔드 전용)
export interface MockBanner {
  id: number
  title: string
  subtitle: string
  description?: string
  imageUrl?: string
  bgGradient: string
  linkUrl?: string
  linkText?: string
  memberImages?: string[]
  isActive: boolean
  displayOrder: number
}

export const mockBanners: MockBanner[] = [
  {
    id: 1,
    title: 'NANO & BANANA',
    subtitle: 'RG MAIN PILLAR',
    description: 'RG 패밀리의 두 기둥, 나노와 바나나를 소개합니다',
    bgGradient: 'linear-gradient(135deg, #4a0418 0%, #1a0510 50%, #000 100%)',
    memberImages: [getMemberCharacterImage('nano-rg'), getMemberCharacterImage('banana-rg')],
    linkUrl: '/info/org',
    linkText: '멤버 보기',
    isActive: true,
    displayOrder: 1,
  },
  {
    id: 2,
    title: 'SEASON 4',
    subtitle: 'NOW STREAMING',
    description: '시즌 4가 시작되었습니다! 새로운 콘텐츠를 만나보세요',
    bgGradient: 'linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 50%, #000 100%)',
    memberImages: [getMemberCharacterImage('season4-member1')],
    linkUrl: '/schedule',
    linkText: '일정 확인',
    isActive: true,
    displayOrder: 2,
  },
  {
    id: 3,
    title: 'VIP REWARDS',
    subtitle: 'TOP SUPPORTERS',
    description: '소중한 후원자분들께 특별한 혜택을 드립니다',
    bgGradient: 'linear-gradient(135deg, #4a1c6b 0%, #1a0a2e 50%, #000 100%)',
    memberImages: [getMemberCharacterImage('vip-member')],
    linkUrl: '/ranking/vip',
    linkText: 'VIP 혜택',
    isActive: true,
    displayOrder: 3,
  },
  {
    id: 4,
    title: 'EXCEL UNIT',
    subtitle: 'KOREAN BROADCAST',
    description: '한국 엑셀방송 크루를 만나보세요',
    bgGradient: 'linear-gradient(135deg, #fd68ba 0%, #4a0418 50%, #000 100%)',
    linkUrl: '/info/org',
    linkText: '조직도 보기',
    isActive: true,
    displayOrder: 4,
  },
]
