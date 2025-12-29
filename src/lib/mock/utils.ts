/**
 * Mock Data Utilities
 * 프리미엄 플레이스홀더 이미지 및 헬퍼 함수
 */

// ============================================
// Avatar Generators
// ============================================

/**
 * UI Avatars - 깔끔한 이니셜 기반 아바타
 * 브랜드 컬러 기반 그라디언트 배경
 */
export const getPlaceholderAvatar = (seed: string): string => {
  const colors = ['fd68ba', 'fe9bd2', 'ff5c8d', 'e91e8c', 'd63384']
  const bgColor = colors[seed.length % colors.length]
  const name = seed.replace(/[^a-zA-Z가-힣]/g, '').slice(0, 2).toUpperCase() || 'RG'
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=${bgColor}&color=ffffff&size=200&font-size=0.4&bold=true`
}

/**
 * DiceBear Notionists Neutral - 세련된 일러스트 스타일
 * 멤버 프로필용 (더 정교한 스타일)
 */
export const getMemberAvatar = (seed: string): string =>
  `https://api.dicebear.com/9.x/notionists-neutral/svg?seed=${seed}&backgroundColor=transparent&size=200`

/**
 * DiceBear Shapes - 추상적 기하학 패턴
 * VIP/프리미엄 프로필용
 */
export const getVipAvatar = (seed: string): string =>
  `https://api.dicebear.com/9.x/shapes/svg?seed=${seed}&backgroundColor=fd68ba,fe9bd2,ff5c8d&size=200`

// ============================================
// Thumbnail Generators
// ============================================

/**
 * Unsplash 고품질 썸네일
 * 카테고리별 이미지 생성
 */
export const getUnsplashThumbnail = (
  category: 'gaming' | 'music' | 'stream' | 'event' | 'portrait' | 'abstract',
  id: number
): string => {
  const queries: Record<string, string[]> = {
    gaming: ['gaming-setup', 'neon-gaming', 'esports', 'game-controller', 'rgb-lights'],
    music: ['concert-lights', 'music-studio', 'microphone', 'karaoke', 'singer'],
    stream: ['live-stream', 'broadcasting', 'studio-lights', 'content-creator', 'webcam'],
    event: ['celebration', 'party-lights', 'confetti', 'event', 'gathering'],
    portrait: ['portrait-light', 'silhouette', 'profile-photo', 'headshot', 'person'],
    abstract: ['abstract-neon', 'gradient', 'particles', 'waves', 'geometric'],
  }
  const query = queries[category][id % queries[category].length]
  return `https://source.unsplash.com/640x360/?${query}&sig=${id}`
}

/**
 * Picsum 랜덤 이미지 (빠른 로딩)
 */
export const getPicsumThumbnail = (id: number, width = 640, height = 360): string =>
  `https://picsum.photos/seed/${id}/${width}/${height}`

/**
 * 그라디언트 메쉬 배경 (Placehold.co)
 */
export const getGradientPlaceholder = (
  text: string,
  colors: [string, string] = ['fd68ba', '4a0418'],
  size: [number, number] = [600, 400]
): string =>
  `https://placehold.co/${size[0]}x${size[1]}/${colors[0]}/${colors[1]}?text=${encodeURIComponent(text)}&font=roboto`

// ============================================
// Character/Banner Images
// ============================================

/**
 * DiceBear Lorelei - 캐릭터 일러스트 (배너용)
 * 더 세련된 설정으로 업데이트
 */
export const getMemberCharacterImage = (seed: string): string =>
  `https://api.dicebear.com/9.x/lorelei/svg?seed=${seed}&backgroundColor=transparent&size=400`

/**
 * 배너용 추상 아트 배경
 */
export const getBannerBackground = (id: number): string => {
  const patterns = [
    'linear-gradient(135deg, #fd68ba 0%, #4a0418 50%, #000 100%)',
    'linear-gradient(135deg, #1e3a5f 0%, #0d1b2a 50%, #000 100%)',
    'linear-gradient(135deg, #4a1c6b 0%, #1a0a2e 50%, #000 100%)',
    'linear-gradient(135deg, #2d1810 0%, #1a0a05 50%, #000 100%)',
  ]
  return patterns[id % patterns.length]
}

// ============================================
// Timeline Images
// ============================================

/**
 * 타임라인 이벤트 이미지
 */
export const getTimelinePlaceholder = (text: string, color: string = 'fd68ba'): string =>
  `https://placehold.co/600x400/${color}/ffffff?text=${encodeURIComponent(text)}&font=roboto`

// ============================================
// Date Utilities
// ============================================

/**
 * 날짜 오프셋 헬퍼 (스케줄용)
 */
export const getDateWithOffset = (daysOffset: number): string => {
  const date = new Date()
  date.setDate(date.getDate() + daysOffset)
  return date.toISOString()
}

/**
 * 현재 ISO 타임스탬프
 */
export const getCurrentTimestamp = (): string => new Date().toISOString()
