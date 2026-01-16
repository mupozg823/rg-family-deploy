/**
 * Mock Timeline Events Data
 * 히스토리 타임라인
 */

import type { TimelineEvent } from '@/types/database'
import { getTimelinePlaceholder } from './utils'

export const mockTimelineEvents: TimelineEvent[] = [
  {
    id: 1,
    event_date: '2024-01-01',
    title: 'RG 패밀리 공식 출범',
    description: '엑셀부와 크루부가 함께하는 RG 패밀리가 공식 출범했습니다.',
    image_url: getTimelinePlaceholder('RG Family Launch', 'fd68ba'),
    category: 'founding',
    season_id: 1,
    unit: null,  // 전체 (엑셀+크루)
    order_index: 1,
    created_at: '2024-01-01T00:00:00Z',
  },
  {
    id: 2,
    event_date: '2024-02-14',
    title: '첫 합동 방송',
    description: '발렌타인데이 기념 첫 합동 방송을 진행했습니다.',
    image_url: getTimelinePlaceholder('Valentine Collab', 'e91e63'),
    category: 'event',
    season_id: 1,
    unit: 'excel',  // 엑셀부
    order_index: 2,
    created_at: '2024-02-14T00:00:00Z',
  },
  {
    id: 3,
    event_date: '2024-04-01',
    title: '시즌 2 시작',
    description: '새로운 멤버들과 함께하는 시즌 2가 시작되었습니다.',
    image_url: getTimelinePlaceholder('Season 2', '9c27b0'),
    category: 'milestone',
    season_id: 2,
    unit: null,  // 전체
    order_index: 3,
    created_at: '2024-04-01T00:00:00Z',
  },
  {
    id: 4,
    event_date: '2024-06-15',
    title: '구독자 10만 달성',
    description: '팬 여러분 덕분에 통합 구독자 10만을 달성했습니다!',
    image_url: getTimelinePlaceholder('100K Subs!', 'ffc107'),
    category: 'milestone',
    season_id: 2,
    unit: 'crew',  // 크루부
    order_index: 4,
    created_at: '2024-06-15T00:00:00Z',
  },
  {
    id: 5,
    event_date: '2024-08-20',
    title: '여름 팬미팅',
    description: '첫 오프라인 팬미팅을 성황리에 마쳤습니다.',
    image_url: getTimelinePlaceholder('Fan Meeting', '4caf50'),
    category: 'event',
    season_id: 3,
    unit: 'excel',  // 엑셀부
    order_index: 5,
    created_at: '2024-08-20T00:00:00Z',
  },
  {
    id: 6,
    event_date: '2024-10-01',
    title: '시즌 4 시작 - 겨울의 축제',
    description: '올해의 마지막 시즌이 시작되었습니다.',
    image_url: getTimelinePlaceholder('Season 4', '2196f3'),
    category: 'milestone',
    season_id: 4,
    unit: null,  // 전체
    order_index: 6,
    created_at: '2024-10-01T00:00:00Z',
  },
  {
    id: 7,
    event_date: '2024-11-15',
    title: 'Nano 팬랭킹 1위 달성',
    description: 'Nano님이 팬더티비 팬랭킹 전체 1위를 달성했습니다!',
    image_url: getTimelinePlaceholder('Nano #1', 'ff5722'),
    category: 'member',
    season_id: 4,
    unit: 'crew',  // 크루부
    order_index: 7,
    created_at: '2024-11-15T00:00:00Z',
  },
]
