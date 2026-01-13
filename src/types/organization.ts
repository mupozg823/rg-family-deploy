/**
 * Organization (조직도) 관련 타입 정의
 *
 * 데이터베이스 스키마와 UI 컴포넌트 타입 통합
 */

// ==============================================
// Unit Types
// ==============================================

/** 유닛 타입 */
export type UnitType = 'excel' | 'crew'

/** 유닛 필터 (전체/VIP 포함) */
export type UnitFilter = 'all' | 'excel' | 'crew' | 'vip'

// ==============================================
// Organization Member Types
// ==============================================

/** 소셜 링크 타입 */
export interface SocialLinks {
  pandatv?: string
  chzzk?: string
  youtube?: string
  instagram?: string
}

/** 멤버 개인정보 타입 (소개 페이지용) */
export interface MemberProfile {
  nickname?: string        // 별명
  mbti?: string           // MBTI
  height?: number         // 키 (cm)
  weight?: number         // 몸무게 (kg)
  age?: number            // 나이
  birthday?: string       // 생일 (YYYY.MM.DD 또는 MM-DD)
  bloodType?: string      // 혈액형
  hobby?: string          // 취미
  specialty?: string      // 특기
  favoriteFood?: string   // 좋아하는 음식
  introduction?: string   // 자기소개
}

/**
 * 데이터베이스 Organization 레코드 (snake_case)
 * Supabase organization 테이블과 매핑
 */
export interface OrganizationRecord {
  id: number
  profile_id: string | null
  name: string
  role: string
  unit: UnitType
  position_order: number
  parent_id: number | null
  image_url: string | null
  social_links: SocialLinks | null
  member_profile: MemberProfile | null  // 멤버 개인정보
  is_live: boolean
  is_active: boolean
  created_at: string
}

/**
 * UI 컴포넌트용 조직 멤버 (MemberCard 등에서 사용)
 * snake_case 유지 (DB 매핑 일관성)
 */
export interface OrgMember {
  id: number
  name: string
  role: string
  unit: UnitType
  position_order: number
  parent_id: number | null
  image_url: string | null
  social_links?: SocialLinks | null
  member_profile?: MemberProfile | null  // 멤버 개인정보
  is_live?: boolean
}

/**
 * 라이브 상태 멤버 (LivePage에서 사용)
 */
export interface LiveMember {
  id: number
  name: string
  role: string
  unit: UnitType
  image_url: string | null
  is_live: boolean
  social_links?: SocialLinks
}

// ==============================================
// Organization Tree Types
// ==============================================

/**
 * 조직도 트리 노드 (camelCase - 레거시 호환)
 * @deprecated OrgMember 사용 권장
 */
export interface OrgTreeMember {
  id: number
  name: string
  role: string
  imageUrl: string | null
  socialLinks: SocialLinks | null
  isLive?: boolean
  children?: OrgTreeMember[]
}

/**
 * 유닛별 조직도 데이터
 */
export interface OrgTreeData {
  excel: OrgTreeMember[]
  crew: OrgTreeMember[]
}

// ==============================================
// Grouped Members Types
// ==============================================

/**
 * 역할별 그룹화된 멤버
 */
export interface GroupedMembers<T> {
  leaders: T[]
  directors: T[]
  managers: T[]
  members: T[]
}

/**
 * 역할별 그룹화를 위한 최소 인터페이스
 */
export interface GroupableMember {
  role: string
}
