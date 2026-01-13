/**
 * 콘텐츠 타입
 *
 * 게시글, 공지사항, 시그니처 관련 타입 정의
 */

/** 공지사항 아이템 */
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

/** 게시글 아이템 */
export interface PostItem {
  id: number
  boardType: 'free' | 'vip'
  category?: string
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

/** 댓글 아이템 */
export interface CommentItem {
  id: number
  postId: number
  content: string
  authorId: string
  authorName: string
  authorAvatar: string | null
  createdAt: string
}

/** 시그니처 아이템 */
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

/** 타임라인 아이템 */
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

// Filter types
export type NoticeCategory = 'all' | 'official' | 'excel' | 'crew'
export type SortOrder = 'latest' | 'popular' | 'oldest'
