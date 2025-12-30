// API Response types
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Ranking types
export interface RankingItem {
  rank: number
  donorId: string | null
  donorName: string
  avatarUrl: string | null
  totalAmount: number
  seasonId?: number
  seasonName?: string
}

// Calendar types
export interface CalendarDay {
  date: Date
  isCurrentMonth: boolean
  isToday: boolean
  events: ScheduleEvent[]
}

export interface ScheduleEvent {
  id: number
  title: string
  description: string | null
  unit: 'excel' | 'crew' | null
  eventType: 'broadcast' | 'collab' | 'event' | 'notice' | '休'
  startDatetime: string
  endDatetime: string | null
  color: string | null
  isAllDay: boolean
}

// Organization tree types
export interface OrgMember {
  id: number
  name: string
  role: string
  imageUrl: string | null
  socialLinks: {
    pandatv?: string
    youtube?: string
    instagram?: string
  } | null
  isLive?: boolean
  children?: OrgMember[]
}

export interface OrgTreeData {
  excel: OrgMember[]
  crew: OrgMember[]
}

// VIP page types
export interface VipPageData {
  profile: {
    id: string
    nickname: string
    avatarUrl: string | null
    totalDonation: number
  }
  reward: {
    seasonId: number
    seasonName: string
    rank: number
    personalMessage: string | null
    dedicationVideoUrl: string | null
  }
  images: {
    id: number
    imageUrl: string
    title: string | null
  }[]
  donationHistory: {
    id: number
    amount: number
    message: string | null
    createdAt: string
  }[]
}

// Signature types
export interface SignatureItem {
  id: number
  title: string
  description: string | null
  unit: 'excel' | 'crew'
  memberName: string
  mediaType: 'video' | 'image' | 'gif'
  mediaUrl: string
  thumbnailUrl: string | null
  tags: string[]
  viewCount: number
  isFeatured: boolean
}

// Timeline types
export interface TimelineItem {
  id: number
  eventDate: string
  title: string
  description: string | null
  imageUrl: string | null
  category: string | null
  seasonId: number | null
  seasonName?: string
}

// Notice types
export interface NoticeItem {
  id: number
  title: string
  content: string
  category: 'official' | 'excel' | 'crew'
  thumbnailUrl: string | null
  isPinned: boolean
  viewCount: number
  authorName: string | null
  createdAt: string
}

// Post types
export interface PostItem {
  id: number
  boardType: 'free' | 'vip'
  title: string
  content: string
  authorId: string
  authorName: string
  authorAvatar: string | null
  viewCount: number
  likeCount: number
  commentCount: number
  isAnonymous: boolean
  createdAt: string
}

// Filter types
export type UnitFilter = 'all' | 'excel' | 'crew' | 'vip'
export type NoticeCategory = 'all' | 'official' | 'excel' | 'crew'
export type SortOrder = 'latest' | 'popular' | 'oldest'
