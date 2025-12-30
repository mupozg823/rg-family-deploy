/**
 * Mock Media Content Data
 * Shorts & VOD - 아이돌 직캠 YouTube 영상 (실제 YouTube ID 사용)
 */

import type { MediaContent } from '@/types/database'

// YouTube 썸네일 URL 생성
const getYouTubeThumbnail = (videoId: string) =>
  `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`

// ============================================
// Shorts 콘텐츠 - 실제 아이돌 직캠
// ============================================
const baseShorts: MediaContent[] = [
  {
    id: 1,
    content_type: 'shorts',
    title: '카리나 - Supernova 직캠',
    description: 'aespa 카리나 Supernova 뮤직뱅크 직캠 240524',
    thumbnail_url: getYouTubeThumbnail('FFEKMEj2zfE'),
    video_url: 'https://www.youtube.com/watch?v=FFEKMEj2zfE',
    unit: 'excel',
    duration: 205,
    view_count: 6400000,
    is_featured: true,
    created_at: '2024-05-24T14:00:00Z',
  },
  {
    id: 2,
    content_type: 'shorts',
    title: '윈터 - Dirty Work 직캠',
    description: 'aespa 윈터 Dirty Work + Rich Man 가요대축제 직캠 251219',
    thumbnail_url: getYouTubeThumbnail('aATx6QdS5g0'),
    video_url: 'https://www.youtube.com/watch?v=aATx6QdS5g0',
    unit: 'excel',
    duration: 230,
    view_count: 2300000,
    is_featured: true,
    created_at: '2024-12-19T20:00:00Z',
  },
  {
    id: 3,
    content_type: 'shorts',
    title: '장원영 - REBEL HEART 직캠',
    description: 'IVE 장원영 REBEL HEART 뮤직뱅크 글로벌 페스티벌 251230',
    thumbnail_url: getYouTubeThumbnail('OSz9y6mIeHE'),
    video_url: 'https://www.youtube.com/watch?v=OSz9y6mIeHE',
    unit: 'excel',
    duration: 195,
    view_count: 344000,
    is_featured: true,
    created_at: '2024-12-30T16:00:00Z',
  },
  {
    id: 4,
    content_type: 'shorts',
    title: '안유진 - XOXZ 직캠',
    description: 'IVE 안유진 XOXZ 뮤직뱅크 글로벌 페스티벌 251230',
    thumbnail_url: getYouTubeThumbnail('-qsus78K7jk'),
    video_url: 'https://www.youtube.com/watch?v=-qsus78K7jk',
    unit: 'excel',
    duration: 185,
    view_count: 344000,
    is_featured: true,
    created_at: '2024-12-30T18:00:00Z',
  },
  {
    id: 5,
    content_type: 'shorts',
    title: '해린 - New Jeans 직캠',
    description: 'NewJeans 해린 New Jeans 뮤직뱅크 직캠 230714',
    thumbnail_url: getYouTubeThumbnail('k3jV6DMTCSE'),
    video_url: 'https://www.youtube.com/watch?v=k3jV6DMTCSE',
    unit: 'crew',
    duration: 213,
    view_count: 21300000,
    is_featured: true,
    created_at: '2023-07-14T19:00:00Z',
  },
  {
    id: 6,
    content_type: 'shorts',
    title: '민지 - Supernatural 직캠',
    description: 'NewJeans 민지 Supernatural 뮤직뱅크 직캠 240712',
    thumbnail_url: getYouTubeThumbnail('KTIY11xxsBI'),
    video_url: 'https://www.youtube.com/watch?v=KTIY11xxsBI',
    unit: 'crew',
    duration: 201,
    view_count: 2600000,
    is_featured: true,
    created_at: '2024-07-12T20:00:00Z',
  },
  {
    id: 7,
    content_type: 'shorts',
    title: '채원 - SPAGHETTI 직캠',
    description: 'LE SSERAFIM 김채원 SPAGHETTI 뮤직뱅크 직캠 251024',
    thumbnail_url: getYouTubeThumbnail('iZ-fHb5ayFs'),
    video_url: 'https://www.youtube.com/watch?v=iZ-fHb5ayFs',
    unit: 'excel',
    duration: 198,
    view_count: 600000,
    is_featured: false,
    created_at: '2024-10-24T20:00:00Z',
  },
]

// ============================================
// VOD 콘텐츠 - 아이돌 풀 무대 영상
// ============================================
const baseVods: MediaContent[] = [
  {
    id: 101,
    content_type: 'vod',
    title: '[풀버전] aespa - Supernova 뮤직뱅크',
    description: 'aespa Supernova 뮤직뱅크 풀버전 240524',
    thumbnail_url: getYouTubeThumbnail('FFEKMEj2zfE'),
    video_url: 'https://www.youtube.com/watch?v=FFEKMEj2zfE',
    unit: 'excel',
    duration: 205,
    view_count: 15670000,
    is_featured: true,
    created_at: '2024-05-24T23:00:00Z',
  },
  {
    id: 102,
    content_type: 'vod',
    title: '[풀버전] IVE - REBEL HEART 글로벌 페스티벌',
    description: 'IVE REBEL HEART 뮤직뱅크 글로벌 페스티벌 251230',
    thumbnail_url: getYouTubeThumbnail('OSz9y6mIeHE'),
    video_url: 'https://www.youtube.com/watch?v=OSz9y6mIeHE',
    unit: 'excel',
    duration: 195,
    view_count: 12940000,
    is_featured: true,
    created_at: '2024-12-30T22:00:00Z',
  },
  {
    id: 103,
    content_type: 'vod',
    title: '[풀버전] NewJeans - Supernatural 뮤직뱅크',
    description: 'NewJeans Supernatural 뮤직뱅크 풀버전 240712',
    thumbnail_url: getYouTubeThumbnail('KTIY11xxsBI'),
    video_url: 'https://www.youtube.com/watch?v=KTIY11xxsBI',
    unit: 'crew',
    duration: 201,
    view_count: 8780000,
    is_featured: true,
    created_at: '2024-07-12T21:00:00Z',
  },
  {
    id: 104,
    content_type: 'vod',
    title: '[풀버전] LE SSERAFIM - SPAGHETTI 뮤직뱅크',
    description: 'LE SSERAFIM SPAGHETTI 뮤직뱅크 풀버전 251024',
    thumbnail_url: getYouTubeThumbnail('iZ-fHb5ayFs'),
    video_url: 'https://www.youtube.com/watch?v=iZ-fHb5ayFs',
    unit: 'excel',
    duration: 198,
    view_count: 9540000,
    is_featured: false,
    created_at: '2024-10-24T20:00:00Z',
  },
  {
    id: 105,
    content_type: 'vod',
    title: '[풀버전] aespa - Dirty Work 가요대축제',
    description: 'aespa Dirty Work + Rich Man 가요대축제 251219',
    thumbnail_url: getYouTubeThumbnail('aATx6QdS5g0'),
    video_url: 'https://www.youtube.com/watch?v=aATx6QdS5g0',
    unit: 'crew',
    duration: 230,
    view_count: 5670000,
    is_featured: false,
    created_at: '2024-12-19T19:00:00Z',
  },
]

// ============================================
// Export
// ============================================
export const mockMediaContent: MediaContent[] = [
  ...baseShorts,
  ...baseVods,
]
