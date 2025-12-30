/**
 * Mock Signatures Data
 * cnine.kr 스타일 - 번호 기반 시그니처 시스템
 */

import { getPicsumThumbnail } from './utils'

// 시그니처 아이템 타입 (멤버별 영상)
export interface SignatureVideo {
  id: number
  memberName: string
  videoUrl: string
  thumbnailUrl: string
  date: string
  duration: string
  viewCount: number
}

// 시그니처 타입 (여러 멤버가 같은 시그니처 가능)
export interface SignatureData {
  id: number
  number: number // 시그니처 번호 (예: 1212, 1252)
  title: string
  category: 'all' | 'new' | 'group' | '1000-2000' | '2000-3000' | '3000-5000' | '5000-10000' | '10000-20000' | '20000+'
  thumbnailUrl: string
  unit: 'excel' | 'crew'
  videos: SignatureVideo[] // 멤버별 영상들
  totalVideoCount: number
  isFeatured: boolean
  createdAt: string
}

// 기존 타입 호환을 위한 export
export interface Signature {
  id: number
  title: string
  description: string | null
  unit: 'excel' | 'crew'
  member_name: string
  media_type: 'video' | 'gif' | 'image'
  media_url: string
  thumbnail_url: string
  tags: string[]
  view_count: number
  is_featured: boolean
  created_at: string
}

// cnine 스타일 시그니처 데이터
export const mockSignatureData: SignatureData[] = [
  {
    id: 1,
    number: 1212,
    title: '진압해',
    category: '1000-2000',
    thumbnailUrl: getPicsumThumbnail(1212, 400, 400),
    unit: 'excel',
    videos: [
      { id: 1, memberName: '주성', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnailUrl: getPicsumThumbnail(1001, 640, 360), date: '2025.12.13', duration: '00:32', viewCount: 15420 },
      { id: 2, memberName: '해밍', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnailUrl: getPicsumThumbnail(1002, 640, 360), date: '2025.12.13', duration: '00:28', viewCount: 12300 },
      { id: 3, memberName: '슬하', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnailUrl: getPicsumThumbnail(1003, 640, 360), date: '2025.12.08', duration: '00:35', viewCount: 9800 },
    ],
    totalVideoCount: 17,
    isFeatured: true,
    createdAt: '2024-12-01T10:00:00Z',
  },
  {
    id: 2,
    number: 1225,
    title: '첫눈',
    category: '1000-2000',
    thumbnailUrl: getPicsumThumbnail(1225, 400, 400),
    unit: 'excel',
    videos: [
      { id: 4, memberName: 'Nano', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnailUrl: getPicsumThumbnail(1004, 640, 360), date: '2025.12.10', duration: '00:45', viewCount: 8930 },
      { id: 5, memberName: 'Luna', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnailUrl: getPicsumThumbnail(1005, 640, 360), date: '2025.12.09', duration: '00:42', viewCount: 7650 },
    ],
    totalVideoCount: 8,
    isFeatured: false,
    createdAt: '2024-11-15T14:00:00Z',
  },
  {
    id: 3,
    number: 1233,
    title: '내 얘길 들어봐',
    category: '1000-2000',
    thumbnailUrl: getPicsumThumbnail(1233, 400, 400),
    unit: 'excel',
    videos: [
      { id: 6, memberName: 'Irene', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnailUrl: getPicsumThumbnail(1006, 640, 360), date: '2025.12.05', duration: '00:38', viewCount: 11200 },
    ],
    totalVideoCount: 5,
    isFeatured: false,
    createdAt: '2024-11-20T16:00:00Z',
  },
  {
    id: 4,
    number: 1240,
    title: 'taylor swift',
    category: '1000-2000',
    thumbnailUrl: getPicsumThumbnail(1240, 400, 400),
    unit: 'excel',
    videos: [
      { id: 7, memberName: 'Banana', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnailUrl: getPicsumThumbnail(1007, 640, 360), date: '2025.11.28', duration: '00:55', viewCount: 14500 },
      { id: 8, memberName: 'Leo', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnailUrl: getPicsumThumbnail(1008, 640, 360), date: '2025.11.25', duration: '00:48', viewCount: 12100 },
    ],
    totalVideoCount: 12,
    isFeatured: true,
    createdAt: '2024-10-25T11:00:00Z',
  },
  {
    id: 5,
    number: 1252,
    title: '날라리',
    category: '1000-2000',
    thumbnailUrl: getPicsumThumbnail(1252, 400, 400),
    unit: 'excel',
    videos: [
      { id: 9, memberName: 'Jay', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnailUrl: getPicsumThumbnail(1009, 640, 360), date: '2025.12.01', duration: '00:33', viewCount: 9500 },
    ],
    totalVideoCount: 6,
    isFeatured: false,
    createdAt: '2024-11-10T14:00:00Z',
  },
  {
    id: 6,
    number: 1272,
    title: '카리나 닮았대',
    category: '1000-2000',
    thumbnailUrl: getPicsumThumbnail(1272, 400, 400),
    unit: 'excel',
    videos: [
      { id: 10, memberName: 'Luna', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnailUrl: getPicsumThumbnail(1010, 640, 360), date: '2025.11.20', duration: '00:29', viewCount: 16800 },
    ],
    totalVideoCount: 9,
    isFeatured: true,
    createdAt: '2024-11-20T18:00:00Z',
  },
  {
    id: 7,
    number: 1279,
    title: 'candy thief',
    category: '1000-2000',
    thumbnailUrl: getPicsumThumbnail(1279, 400, 400),
    unit: 'crew',
    videos: [
      { id: 11, memberName: 'Leo', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnailUrl: getPicsumThumbnail(1011, 640, 360), date: '2025.11.15', duration: '00:41', viewCount: 7200 },
    ],
    totalVideoCount: 4,
    isFeatured: false,
    createdAt: '2024-10-15T10:00:00Z',
  },
  {
    id: 8,
    number: 1288,
    title: '버블버블',
    category: '1000-2000',
    thumbnailUrl: getPicsumThumbnail(1288, 400, 400),
    unit: 'excel',
    videos: [
      { id: 12, memberName: 'Nano', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnailUrl: getPicsumThumbnail(1012, 640, 360), date: '2025.11.10', duration: '00:36', viewCount: 8900 },
    ],
    totalVideoCount: 7,
    isFeatured: false,
    createdAt: '2024-09-20T14:00:00Z',
  },
  {
    id: 9,
    number: 1333,
    title: '무아',
    category: '1000-2000',
    thumbnailUrl: getPicsumThumbnail(1333, 400, 400),
    unit: 'crew',
    videos: [
      { id: 13, memberName: 'Banana', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnailUrl: getPicsumThumbnail(1013, 640, 360), date: '2025.10.28', duration: '00:44', viewCount: 10300 },
    ],
    totalVideoCount: 5,
    isFeatured: true,
    createdAt: '2024-10-01T16:00:00Z',
  },
  {
    id: 10,
    number: 1452,
    title: '빗을따라서',
    category: '1000-2000',
    thumbnailUrl: getPicsumThumbnail(1452, 400, 400),
    unit: 'excel',
    videos: [
      { id: 14, memberName: 'Irene', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnailUrl: getPicsumThumbnail(1014, 640, 360), date: '2025.10.15', duration: '00:52', viewCount: 13400 },
      { id: 15, memberName: 'Jay', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnailUrl: getPicsumThumbnail(1015, 640, 360), date: '2025.10.12', duration: '00:49', viewCount: 11800 },
    ],
    totalVideoCount: 11,
    isFeatured: false,
    createdAt: '2024-09-15T11:00:00Z',
  },
  {
    id: 11,
    number: 2500,
    title: '하이라이트',
    category: '2000-3000',
    thumbnailUrl: getPicsumThumbnail(2500, 400, 400),
    unit: 'excel',
    videos: [
      { id: 16, memberName: 'Nano', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnailUrl: getPicsumThumbnail(1016, 640, 360), date: '2025.09.28', duration: '01:05', viewCount: 18200 },
    ],
    totalVideoCount: 8,
    isFeatured: true,
    createdAt: '2024-08-20T14:00:00Z',
  },
  {
    id: 12,
    number: 3500,
    title: '럭키비키',
    category: '3000-5000',
    thumbnailUrl: getPicsumThumbnail(3500, 400, 400),
    unit: 'crew',
    videos: [
      { id: 17, memberName: 'Luna', videoUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ', thumbnailUrl: getPicsumThumbnail(1017, 640, 360), date: '2025.09.15', duration: '01:12', viewCount: 21500 },
    ],
    totalVideoCount: 6,
    isFeatured: true,
    createdAt: '2024-08-10T16:00:00Z',
  },
]

// 기존 형식 호환용 데이터
export const mockSignatures: Signature[] = mockSignatureData.flatMap(sig =>
  sig.videos.map((video, idx) => ({
    id: video.id,
    title: `${sig.title} (${sig.number})`,
    description: `${video.memberName}의 시그니처 영상`,
    unit: sig.unit,
    member_name: video.memberName,
    media_type: 'video' as const,
    media_url: video.videoUrl,
    thumbnail_url: video.thumbnailUrl,
    tags: [sig.title, video.memberName, `${sig.number}`],
    view_count: video.viewCount,
    is_featured: sig.isFeatured && idx === 0,
    created_at: sig.createdAt,
  }))
)

// 카테고리 목록
export const signatureCategories = [
  { id: 'all', label: '전체' },
  { id: 'new', label: '신규' },
  { id: 'group', label: '단체' },
  { id: '1000-2000', label: '1000~2000' },
  { id: '2000-3000', label: '2000~3000' },
  { id: '3000-5000', label: '3000~5000' },
  { id: '5000-10000', label: '5000~10000' },
  { id: '10000-20000', label: '10000~20000' },
  { id: '20000+', label: '20000~' },
] as const
