/**
 * Tribute Guestbook Mock Data
 *
 * Top 1-3 후원자 헌정 페이지의 방명록 데이터
 */

import type { TributeGuestbook } from '@/types/database'

// 방명록 엔트리 타입 (프론트엔드용 확장)
export interface GuestbookEntry extends Omit<TributeGuestbook, 'is_deleted' | 'is_approved' | 'updated_at'> {
  // 추가 표시용 필드
  author_avatar?: string | null
  author_unit?: 'excel' | 'crew' | null
}

// Top 1 (Gold) 방명록
const goldGuestbook: GuestbookEntry[] = [
  {
    id: 1,
    tribute_user_id: 'user-6',
    author_id: null,
    author_name: '린아',
    message: '핑크하트님! 항상 응원해주셔서 감사해요! 덕분에 매일 힘이 나요 💖',
    is_member: true,
    created_at: '2026-01-10T14:30:00Z',
    author_unit: 'excel',
  },
  {
    id: 2,
    tribute_user_id: 'user-6',
    author_id: null,
    author_name: '엑셀부 일동',
    message: '최고의 후원자님! 항상 감사합니다. 앞으로도 좋은 방송으로 보답할게요!',
    is_member: true,
    created_at: '2026-01-08T10:15:00Z',
    author_unit: 'excel',
  },
  {
    id: 3,
    tribute_user_id: 'user-6',
    author_id: null,
    author_name: '크루부 일동',
    message: '핑크하트님 덕분에 항상 즐거운 방송 할 수 있어요! 감사합니다~',
    is_member: true,
    created_at: '2026-01-05T18:00:00Z',
    author_unit: 'crew',
  },
  {
    id: 4,
    tribute_user_id: 'user-6',
    author_id: 'user-3',
    author_name: '팬더사랑',
    message: '핑크하트님 진짜 대단하세요! 저도 열심히 응원할게요!',
    is_member: false,
    created_at: '2026-01-04T20:45:00Z',
  },
  {
    id: 5,
    tribute_user_id: 'user-6',
    author_id: 'user-7',
    author_name: '별빛수호자',
    message: '1위 축하드립니다! 존경해요!!',
    is_member: false,
    created_at: '2026-01-03T12:30:00Z',
  },
]

// Top 2 (Silver) 방명록
const silverGuestbook: GuestbookEntry[] = [
  {
    id: 6,
    tribute_user_id: 'user-1',
    author_id: null,
    author_name: '나노',
    message: 'gul***님, 변함없는 응원 정말 감사해요! 항상 건강하세요 💕',
    is_member: true,
    created_at: '2026-01-09T16:00:00Z',
    author_unit: 'excel',
  },
  {
    id: 7,
    tribute_user_id: 'user-1',
    author_id: null,
    author_name: '크루부',
    message: 'gul***님의 따뜻한 응원 덕분에 힘이 납니다. 감사합니다!',
    is_member: true,
    created_at: '2026-01-06T14:20:00Z',
    author_unit: 'crew',
  },
  {
    id: 8,
    tribute_user_id: 'user-1',
    author_id: 'user-4',
    author_name: '하트뿅뿅',
    message: '2위 축하드려요! 대단하세요~',
    is_member: false,
    created_at: '2026-01-02T11:00:00Z',
  },
]

// Top 3 (Bronze) 방명록
const bronzeGuestbook: GuestbookEntry[] = [
  {
    id: 9,
    tribute_user_id: 'user-5',
    author_id: null,
    author_name: '린아',
    message: '영원한서포터님, 닉네임처럼 정말 영원히 함께해주세요! 감사합니다 💖',
    is_member: true,
    created_at: '2026-01-08T20:30:00Z',
    author_unit: 'excel',
  },
  {
    id: 10,
    tribute_user_id: 'user-5',
    author_id: null,
    author_name: '엑셀부',
    message: '항상 응원해주셔서 감사합니다! 최고!',
    is_member: true,
    created_at: '2026-01-05T09:45:00Z',
    author_unit: 'excel',
  },
  {
    id: 11,
    tribute_user_id: 'user-5',
    author_id: 'user-2',
    author_name: '달빛요정',
    message: 'TOP 3 축하드립니다!! 대단해요!',
    is_member: false,
    created_at: '2026-01-01T15:15:00Z',
  },
]

// 전체 방명록 데이터
export const mockTributeGuestbook: GuestbookEntry[] = [
  ...goldGuestbook,
  ...silverGuestbook,
  ...bronzeGuestbook,
]

/**
 * 헌정 대상 사용자 ID로 방명록 조회
 */
export function getGuestbookByTributeUserId(tributeUserId: string): GuestbookEntry[] {
  return mockTributeGuestbook
    .filter(entry => entry.tribute_user_id === tributeUserId)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}

/**
 * 순위로 방명록 조회
 */
export function getGuestbookByRank(rank: 1 | 2 | 3): GuestbookEntry[] {
  const userIdMap: Record<number, string> = {
    1: 'user-6',  // Gold (핑크하트)
    2: 'user-1',  // Silver (gul***)
    3: 'user-5',  // Bronze (영원한서포터)
  }
  return getGuestbookByTributeUserId(userIdMap[rank])
}

/**
 * 방명록 개수 조회
 */
export function getGuestbookCountByTributeUserId(tributeUserId: string): number {
  return mockTributeGuestbook.filter(entry => entry.tribute_user_id === tributeUserId).length
}

/**
 * 멤버(엑셀부/크루부) 작성 방명록만 조회
 */
export function getMemberGuestbookByTributeUserId(tributeUserId: string): GuestbookEntry[] {
  return mockTributeGuestbook
    .filter(entry => entry.tribute_user_id === tributeUserId && entry.is_member)
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
}
