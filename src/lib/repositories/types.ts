/**
 * Repository Interfaces - Clean Architecture
 * 데이터 접근 추상화 레이어
 */

import type { Profile, Season, Donation, Organization, Notice, Post } from '@/types/database'
import type { RankingItem, UnitFilter } from '@/types/common'

// ============================================
// Base Repository Interface
// ============================================
export interface IRepository<T> {
  findById(id: string | number): Promise<T | null>
  findAll(): Promise<T[]>
}

// ============================================
// Domain-Specific Repositories
// ============================================

export interface IRankingRepository {
  getRankings(options: {
    seasonId?: number | null
    unitFilter?: UnitFilter
  }): Promise<RankingItem[]>

  getTopRankers(limit: number): Promise<RankingItem[]>
}

export interface ISeasonRepository extends IRepository<Season> {
  findActive(): Promise<Season | null>
  findAll(): Promise<Season[]>
}

export interface IProfileRepository extends IRepository<Profile> {
  findByNickname(nickname: string): Promise<Profile | null>
  findVipMembers(): Promise<Profile[]>
}

export interface IDonationRepository {
  findByDonor(donorId: string): Promise<Donation[]>
  findBySeason(seasonId: number): Promise<Donation[]>
  getTotal(donorId: string): Promise<number>
}

export interface IOrganizationRepository {
  findByUnit(unit: 'excel' | 'crew'): Promise<Organization[]>
  findLiveMembers(): Promise<Organization[]>
  findAll(): Promise<Organization[]>
}

export interface INoticeRepository extends IRepository<Notice> {
  findRecent(limit: number): Promise<Notice[]>
  findPublished(): Promise<Notice[]>
}

export interface IPostRepository extends IRepository<Post> {
  findByCategory(category: string): Promise<Post[]>
  findRecent(limit: number): Promise<Post[]>
}

// ============================================
// Data Provider Interface (Strategy Pattern)
// ============================================
export interface IDataProvider {
  rankings: IRankingRepository
  seasons: ISeasonRepository
  profiles: IProfileRepository
  donations: IDonationRepository
  organization: IOrganizationRepository
  notices: INoticeRepository
  posts: IPostRepository
}

// ============================================
// Factory Pattern for Provider Creation
// ============================================
export type DataProviderType = 'mock' | 'supabase'
