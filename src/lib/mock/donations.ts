/**
 * Mock Donations Data
 * 후원 내역 (하트 단위)
 */

import type { Donation } from '@/types/database'

export const mockDonations: Donation[] = [
  // ========== 시즌 4 (현재) ==========
  { id: 1, donor_id: 'user-1', donor_name: 'gul***', amount: 15000, season_id: 4, unit: 'excel', message: null, created_at: '2024-12-29T05:16:29Z' },
  { id: 2, donor_id: 'user-1', donor_name: 'gul***', amount: 5000, season_id: 4, unit: 'excel', message: null, created_at: '2024-12-29T05:18:20Z' },
  { id: 3, donor_id: 'user-1', donor_name: 'gul***', amount: 4000, season_id: 4, unit: 'excel', message: null, created_at: '2024-12-29T05:21:29Z' },
  { id: 4, donor_id: 'user-1', donor_name: 'gul***', amount: 6000, season_id: 4, unit: 'excel', message: null, created_at: '2024-12-25T01:57:52Z' },
  { id: 5, donor_id: 'user-1', donor_name: 'gul***', amount: 8002, season_id: 4, unit: 'excel', message: null, created_at: '2024-12-25T02:11:43Z' },
  { id: 6, donor_id: 'user-6', donor_name: '핑크하트', amount: 20000, season_id: 4, unit: 'excel', message: '나노님 화이팅!', created_at: '2024-12-28T20:00:00Z' },
  { id: 7, donor_id: 'user-6', donor_name: '핑크하트', amount: 15000, season_id: 4, unit: 'excel', message: '오늘 방송 너무 재밌어요', created_at: '2024-12-27T21:00:00Z' },
  { id: 8, donor_id: 'user-6', donor_name: '핑크하트', amount: 10000, season_id: 4, unit: 'excel', message: null, created_at: '2024-12-26T19:30:00Z' },
  { id: 9, donor_id: 'user-2', donor_name: '별빛수호자', amount: 12000, season_id: 4, unit: 'crew', message: '바나나님 최고!', created_at: '2024-12-28T22:00:00Z' },
  { id: 10, donor_id: 'user-2', donor_name: '별빛수호자', amount: 8000, season_id: 4, unit: 'crew', message: null, created_at: '2024-12-25T18:00:00Z' },
  { id: 11, donor_id: 'user-2', donor_name: '별빛수호자', amount: 5000, season_id: 4, unit: 'crew', message: '메리 크리스마스!', created_at: '2024-12-25T00:00:00Z' },
  { id: 12, donor_id: 'user-5', donor_name: '영원한서포터', amount: 30000, season_id: 4, unit: null, message: '연말 이벤트 응원합니다!', created_at: '2024-12-28T15:00:00Z' },
  { id: 13, donor_id: 'user-7', donor_name: '나노사랑', amount: 22000, season_id: 4, unit: 'excel', message: '나노 오빠 사랑해요!', created_at: '2024-12-20T20:30:00Z' },
  { id: 14, donor_id: 'user-3', donor_name: '달콤한팬심', amount: 8000, season_id: 4, unit: 'excel', message: null, created_at: '2024-12-22T19:00:00Z' },
  { id: 15, donor_id: 'user-3', donor_name: '달콤한팬심', amount: 4000, season_id: 4, unit: 'excel', message: '루나님 화이팅', created_at: '2024-12-18T21:00:00Z' },
  { id: 16, donor_id: 'user-8', donor_name: '크루지킴이', amount: 10000, season_id: 4, unit: 'crew', message: '레오님 노래 최고', created_at: '2024-12-23T20:00:00Z' },
  { id: 17, donor_id: 'user-8', donor_name: '크루지킴이', amount: 5000, season_id: 4, unit: 'crew', message: null, created_at: '2024-12-21T18:30:00Z' },
  { id: 18, donor_id: 'user-4', donor_name: '행복한오늘', amount: 5000, season_id: 4, unit: 'crew', message: '티모님 응원해요', created_at: '2024-12-24T17:00:00Z' },
  { id: 19, donor_id: 'user-4', donor_name: '행복한오늘', amount: 3000, season_id: 4, unit: 'crew', message: null, created_at: '2024-12-19T16:00:00Z' },

  // ========== 시즌 3 ==========
  { id: 20, donor_id: 'user-6', donor_name: '핑크하트', amount: 25000, season_id: 3, unit: 'excel', message: '시즌3 화이팅!', created_at: '2024-08-10T14:00:00Z' },
  { id: 21, donor_id: 'user-2', donor_name: '별빛수호자', amount: 18000, season_id: 3, unit: 'crew', message: '여름 방송 최고', created_at: '2024-07-20T11:00:00Z' },
  { id: 22, donor_id: 'user-1', donor_name: 'gul***', amount: 15000, season_id: 3, unit: 'excel', message: null, created_at: '2024-09-15T20:00:00Z' },
]
