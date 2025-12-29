/**
 * Mock Live Status Data
 * 라이브 방송 상태
 */

import type { LiveStatus } from '@/types/database'
import { getCurrentTimestamp } from './utils'

export const mockLiveStatus: LiveStatus[] = [
  {
    id: 1,
    member_id: 1, // Nano
    platform: 'pandatv',
    stream_url: 'https://www.pandalive.co.kr/nano',
    thumbnail_url: '/assets/members/nano.jpg',
    is_live: true,
    viewer_count: 4523,
    last_checked: getCurrentTimestamp(),
  },
  {
    id: 2,
    member_id: 3, // Luna
    platform: 'pandatv',
    stream_url: 'https://www.pandalive.co.kr/luna',
    thumbnail_url: '/assets/members/luna.jpg',
    is_live: true,
    viewer_count: 2341,
    last_checked: getCurrentTimestamp(),
  },
  {
    id: 3,
    member_id: 10, // Jay
    platform: 'youtube',
    stream_url: 'https://youtube.com/live/jay',
    thumbnail_url: '/assets/members/jay.jpg',
    is_live: true,
    viewer_count: 1876,
    last_checked: getCurrentTimestamp(),
  },
  {
    id: 4,
    member_id: 9, // Leo
    platform: 'pandatv',
    stream_url: 'https://www.pandalive.co.kr/leo',
    thumbnail_url: '/assets/members/leo.jpg',
    is_live: true,
    viewer_count: 3200,
    last_checked: getCurrentTimestamp(),
  },
  {
    id: 5,
    member_id: 5, // Bibi
    platform: 'pandatv',
    stream_url: 'https://www.pandalive.co.kr/bibi',
    thumbnail_url: '/assets/members/bibi.jpg',
    is_live: true,
    viewer_count: 1520,
    last_checked: getCurrentTimestamp(),
  },
  {
    id: 6,
    member_id: 13, // Timo
    platform: 'youtube',
    stream_url: 'https://youtube.com/live/timo',
    thumbnail_url: '/assets/members/timo.jpg',
    is_live: true,
    viewer_count: 980,
    last_checked: getCurrentTimestamp(),
  },
  {
    id: 7,
    member_id: 2, // Irene
    platform: 'pandatv',
    stream_url: 'https://www.pandalive.co.kr/irene',
    thumbnail_url: '/assets/members/irene.jpg',
    is_live: false,
    viewer_count: 0,
    last_checked: getCurrentTimestamp(),
  },
]
