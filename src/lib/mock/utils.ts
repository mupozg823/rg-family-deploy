/**
 * Mock Data Utilities
 * 플레이스홀더 이미지 및 헬퍼 함수
 */

// DiceBear Avatar 생성
export const getPlaceholderAvatar = (seed: string): string =>
  `https://api.dicebear.com/7.x/adventurer/svg?seed=${seed}`

// DiceBear Character 이미지 생성 (배너용)
export const getMemberCharacterImage = (seed: string): string =>
  `https://api.dicebear.com/7.x/lorelei/svg?seed=${seed}&backgroundColor=transparent&size=400`

// Placehold.co 타임라인 이미지 생성
export const getTimelinePlaceholder = (text: string, color: string = 'fd68ba'): string =>
  `https://placehold.co/600x400/${color}/ffffff?text=${encodeURIComponent(text)}`

// 날짜 오프셋 헬퍼 (스케줄용)
export const getDateWithOffset = (daysOffset: number): string => {
  const date = new Date()
  date.setDate(date.getDate() + daysOffset)
  return date.toISOString()
}

// 현재 ISO 타임스탬프
export const getCurrentTimestamp = (): string => new Date().toISOString()
