/**
 * Mock Media Content Data
 * Shorts & VOD
 */

import type { MediaContent } from '@/types/database'

// 기본 Shorts 콘텐츠
const baseShorts: MediaContent[] = [
  {
    id: 1,
    content_type: 'shorts',
    title: '아이린의 귀여운 실수 모음',
    description: '방송 중 귀여운 실수 모음집',
    thumbnail_url: '/assets/thumbnails/shorts_mock_1.jpg',
    video_url: 'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    unit: 'excel',
    duration: 58,
    view_count: 45230,
    is_featured: true,
    created_at: '2024-12-18T14:00:00Z',
  },
  {
    id: 2,
    content_type: 'shorts',
    title: '레오의 노래 커버',
    description: '크리스마스 캐롤 커버',
    thumbnail_url: '/assets/thumbnails/shorts_mock_2.jpg',
    video_url: 'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    unit: 'crew',
    duration: 45,
    view_count: 32100,
    is_featured: true,
    created_at: '2024-12-15T20:00:00Z',
  },
  {
    id: 3,
    content_type: 'shorts',
    title: '루나 vs 스텔라 대결',
    description: '게임 대결 하이라이트',
    thumbnail_url: '/assets/thumbnails/shorts_mock_3.jpg',
    video_url: 'https://www.youtube.com/shorts/dQw4w9WgXcQ',
    unit: 'excel',
    duration: 60,
    view_count: 28900,
    is_featured: false,
    created_at: '2024-12-12T16:00:00Z',
  },
]

// 기본 VOD 콘텐츠
const baseVods: MediaContent[] = [
  {
    id: 4,
    content_type: 'vod',
    title: '[풀영상] 연말 합동 방송',
    description: '2024 연말 특별 합동 방송 풀영상',
    thumbnail_url: '/assets/thumbnails/vod_mock_1.jpg',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    unit: null,
    duration: 10800,
    view_count: 15670,
    is_featured: true,
    created_at: '2024-12-20T23:00:00Z',
  },
  {
    id: 5,
    content_type: 'vod',
    title: '[풀영상] 아이린 게임 방송',
    description: '발로란트 랭크 도전기',
    thumbnail_url: '/assets/thumbnails/vod_mock_2.jpg',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    unit: 'excel',
    duration: 7200,
    view_count: 8940,
    is_featured: false,
    created_at: '2024-12-19T22:00:00Z',
  },
  {
    id: 6,
    content_type: 'vod',
    title: '[풀영상] 크루부 노래방 방송',
    description: '크루부 멤버들의 노래 실력 대공개!',
    thumbnail_url: '/assets/thumbnails/vod_mock_3.jpg',
    video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
    unit: 'crew',
    duration: 5400,
    view_count: 6780,
    is_featured: true,
    created_at: '2024-12-17T21:00:00Z',
  },
]

// 추가 Shorts (테스트용)
const additionalShorts: MediaContent[] = Array.from({ length: 12 }).map((_, i) => ({
  id: 100 + i,
  content_type: 'shorts' as const,
  title: `숏폼 콘텐츠 ${i + 1}`,
  description: `테스트용 숏폼 데이터 ${i + 1}`,
  thumbnail_url: `/assets/thumbnails/shorts_mock_${(i % 9) + 1}.jpg`,
  video_url: 'https://www.youtube.com/shorts/dQw4w9WgXcQ',
  unit: (i % 2 === 0 ? 'excel' : 'crew') as 'excel' | 'crew',
  duration: 30 + i * 5,
  view_count: 1000 * (i + 1),
  is_featured: false,
  created_at: new Date(Date.now() - i * 86400000).toISOString(),
}))

// 추가 VOD (테스트용)
const additionalVods: MediaContent[] = Array.from({ length: 5 }).map((_, i) => ({
  id: 200 + i,
  content_type: 'vod' as const,
  title: `VOD 콘텐츠 ${i + 1}`,
  description: `테스트용 VOD 데이터 ${i + 1}`,
  thumbnail_url: `/assets/thumbnails/vod_mock_${(i % 5) + 1}.jpg`,
  video_url: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
  unit: (i % 2 === 0 ? 'crew' : 'excel') as 'excel' | 'crew',
  duration: 3600 + i * 600,
  view_count: 500 * (i + 1),
  is_featured: false,
  created_at: new Date(Date.now() - i * 86400000 * 2).toISOString(),
}))

// 전체 미디어 콘텐츠
export const mockMediaContent: MediaContent[] = [
  ...baseShorts,
  ...baseVods,
  ...additionalShorts,
  ...additionalVods,
]
