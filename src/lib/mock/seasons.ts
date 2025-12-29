/**
 * Mock Seasons Data
 * 시즌 정보
 */

import type { Season } from '@/types/database'

export const mockSeasons: Season[] = [
  {
    id: 1,
    name: '시즌 1 - 시작의 불꽃',
    start_date: '2024-01-01',
    end_date: '2024-03-31',
    is_active: false,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    name: '시즌 2 - 성장의 계절',
    start_date: '2024-04-01',
    end_date: '2024-06-30',
    is_active: false,
    created_at: '2024-04-01T00:00:00Z',
  },
  {
    id: 3,
    name: '시즌 3 - 빛나는 여름',
    start_date: '2024-07-01',
    end_date: '2024-09-30',
    is_active: false,
    created_at: '2024-07-01T00:00:00Z',
  },
  {
    id: 4,
    name: '시즌 4 - 겨울의 축제',
    start_date: '2024-10-01',
    end_date: null,
    is_active: true,
    created_at: '2024-10-01T00:00:00Z',
  },
]
