/**
 * 중앙화된 환경 설정
 * 모든 환경 변수 및 기능 플래그를 여기서 관리
 */

// Mock 데이터 사용 여부
// - development: 환경변수가 'false'가 아니면 true
// - production: 환경변수가 'true'일 때만 true
export const USE_MOCK_DATA =
  process.env.NODE_ENV === 'development'
    ? process.env.NEXT_PUBLIC_USE_MOCK_DATA !== 'false'
    : process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true'

// Supabase 설정
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// 앱 설정
export const APP_CONFIG = {
  name: 'RG Family',
  description: '팬더티비 스트리머 팬 커뮤니티',
  platform: 'pandatv',
  units: {
    excel: { name: '엑셀부', label: 'EXCEL UNIT', country: '한국' },
    crew: { name: '크루부', label: 'CREW UNIT', country: '중국' },
  },
  donation: {
    unit: '하트',
    unitSymbol: '♥',
  },
  vip: {
    threshold: 50, // VIP 자격 순위 (1~50위)
    topRankerThreshold: 3, // 탑 랭커 순위 (1~3위)
  },
} as const

// 페이지네이션 기본값
export const PAGINATION = {
  defaultPageSize: 20,
  maxPageSize: 100,
} as const
