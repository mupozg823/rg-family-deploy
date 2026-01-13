/**
 * Mock Organization Data
 * 조직도 멤버 정보
 *
 * RG Family 구조:
 * - 한백설 (대표)
 * - Excel Unit: 한백설, 해린, 월아, 채은, 가윤, 설윤, 한세아, 청아, 손밍, 키키, 홍서하, 퀸로니
 */

import type { OrganizationRecord } from '@/types/organization'
import { getMemberAvatar } from './utils'

export const mockOrganization: OrganizationRecord[] = [
  // ========== Excel Unit ==========
  // 대표 - 한백설
  {
    id: 1,
    unit: 'excel',
    profile_id: null,
    name: '한백설',
    role: '대표',
    position_order: 1,
    parent_id: null,
    image_url: getMemberAvatar('hanbaekseol'),
    social_links: {
      pandatv: 'https://www.pandalive.co.kr/hanbaekseol',
    },
    member_profile: {
      nickname: '백설',
      mbti: 'ISTP',
      height: 168,
      weight: 46,
      birthday: '1997.11.26',
      bloodType: 'O',
      introduction: 'RG Family 대표 한백설입니다 💖',
    },
    is_live: false,
    is_active: true,
    created_at: '2024-01-01T00:00:00Z',
  },

  // Excel 멤버 - 해린
  {
    id: 2,
    unit: 'excel',
    profile_id: null,
    name: '해린',
    role: '멤버',
    position_order: 2,
    parent_id: 1,
    image_url: getMemberAvatar('haerin'),
    social_links: {
      pandatv: 'https://www.pandalive.co.kr/haerin',
    },
    member_profile: {
      nickname: '해린',
      mbti: 'ESFP',
      height: 157,
      weight: 50,
      birthday: '2005.07.05',
      bloodType: 'B',
    },
    is_live: true,
    is_active: true,
    created_at: '2024-01-15T00:00:00Z',
  },

  // Excel 멤버 - 월아
  {
    id: 3,
    unit: 'excel',
    profile_id: null,
    name: '월아',
    role: '멤버',
    position_order: 3,
    parent_id: 1,
    image_url: getMemberAvatar('wola'),
    social_links: {
      pandatv: 'https://www.pandalive.co.kr/wola',
    },
    member_profile: {
      nickname: '월아',
      birthday: '04.02', // 연도 미상
    },
    is_live: false,
    is_active: true,
    created_at: '2024-02-01T00:00:00Z',
  },

  // Excel 멤버 - 채은
  {
    id: 4,
    unit: 'excel',
    profile_id: null,
    name: '채은',
    role: '멤버',
    position_order: 4,
    parent_id: 1,
    image_url: getMemberAvatar('chaeeun'),
    social_links: {
      pandatv: 'https://www.pandalive.co.kr/chaeeun',
    },
    member_profile: {
      nickname: '채은',
      birthday: '2004.03.24',
    },
    is_live: true,
    is_active: true,
    created_at: '2024-02-15T00:00:00Z',
  },

  // Excel 멤버 - 가윤
  {
    id: 5,
    unit: 'excel',
    profile_id: null,
    name: '가윤',
    role: '멤버',
    position_order: 5,
    parent_id: 1,
    image_url: getMemberAvatar('gayoon'),
    social_links: {
      pandatv: 'https://www.pandalive.co.kr/gayoon',
    },
    member_profile: {
      nickname: '가윤',
      birthday: '1996.01.03',
    },
    is_live: false,
    is_active: true,
    created_at: '2024-03-01T00:00:00Z',
  },

  // Excel 멤버 - 설윤
  {
    id: 6,
    unit: 'excel',
    profile_id: null,
    name: '설윤',
    role: '멤버',
    position_order: 6,
    parent_id: 1,
    image_url: getMemberAvatar('seolyoon'),
    social_links: {
      pandatv: 'https://www.pandalive.co.kr/seolyoon',
    },
    member_profile: {
      nickname: '설윤',
      birthday: '2000.01.10',
    },
    is_live: true,
    is_active: true,
    created_at: '2024-03-15T00:00:00Z',
  },

  // Excel 멤버 - 한세아
  {
    id: 7,
    unit: 'excel',
    profile_id: null,
    name: '한세아',
    role: '멤버',
    position_order: 7,
    parent_id: 1,
    image_url: getMemberAvatar('hansea'),
    social_links: {
      pandatv: 'https://www.pandalive.co.kr/hansea',
    },
    member_profile: {
      nickname: '세아',
      birthday: '1992.12.14',
    },
    is_live: false,
    is_active: true,
    created_at: '2024-04-01T00:00:00Z',
  },

  // Excel 멤버 - 청아
  {
    id: 8,
    unit: 'excel',
    profile_id: null,
    name: '청아',
    role: '멤버',
    position_order: 8,
    parent_id: 1,
    image_url: getMemberAvatar('cheonga'),
    social_links: {
      pandatv: 'https://www.pandalive.co.kr/cheonga',
    },
    member_profile: {
      nickname: '청아',
      birthday: '2004.01.03',
    },
    is_live: true,
    is_active: true,
    created_at: '2024-04-15T00:00:00Z',
  },

  // Excel 멤버 - 손밍
  {
    id: 9,
    unit: 'excel',
    profile_id: null,
    name: '손밍',
    role: '멤버',
    position_order: 9,
    parent_id: 1,
    image_url: getMemberAvatar('sonming'),
    social_links: {
      pandatv: 'https://www.pandalive.co.kr/sonming',
    },
    member_profile: {
      nickname: '손밍',
      birthday: '1996.07.25',
    },
    is_live: false,
    is_active: true,
    created_at: '2024-05-01T00:00:00Z',
  },

  // Excel 멤버 - 키키
  {
    id: 10,
    unit: 'excel',
    profile_id: null,
    name: '키키',
    role: '멤버',
    position_order: 10,
    parent_id: 1,
    image_url: getMemberAvatar('kiki'),
    social_links: {
      pandatv: 'https://www.pandalive.co.kr/kiki',
    },
    member_profile: {
      nickname: '키키',
      birthday: '1999.02.10',
    },
    is_live: true,
    is_active: true,
    created_at: '2024-05-15T00:00:00Z',
  },

  // Excel 멤버 - 홍서하
  {
    id: 11,
    unit: 'excel',
    profile_id: null,
    name: '홍서하',
    role: '멤버',
    position_order: 11,
    parent_id: 1,
    image_url: getMemberAvatar('hongseohaa'),
    social_links: {
      pandatv: 'https://www.pandalive.co.kr/hongseohaa',
    },
    member_profile: {
      nickname: '서하',
      birthday: '2001.08.30',
    },
    is_live: false,
    is_active: true,
    created_at: '2024-06-01T00:00:00Z',
  },

  // Excel 멤버 - 퀸로니
  {
    id: 12,
    unit: 'excel',
    profile_id: null,
    name: '퀸로니',
    role: '멤버',
    position_order: 12,
    parent_id: 1,
    image_url: getMemberAvatar('queenroni'),
    social_links: {
      pandatv: 'https://www.pandalive.co.kr/queenroni',
    },
    member_profile: {
      nickname: '로니',
      birthday: '1991.09.30',
    },
    is_live: true,
    is_active: true,
    created_at: '2024-06-15T00:00:00Z',
  },
]
