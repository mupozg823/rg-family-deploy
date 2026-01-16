/**
 * Supabase Organization Repository
 * 조직 구조 데이터 관리
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { IOrganizationRepository } from '../types'
import type { Organization } from '@/types/database'
import type { OrganizationRecord, MemberProfile, SocialLinks } from '@/types/organization'

export class SupabaseOrganizationRepository implements IOrganizationRepository {
  constructor(private supabase: SupabaseClient) {}

  /**
   * DB 레코드를 OrganizationRecord로 변환
   * member_profile, social_links가 DB에 있으면 파싱, 없으면 null
   */
  private mapToRecord(data: Organization & { member_profile?: unknown }): OrganizationRecord {
    let profile: MemberProfile | null = null
    let socialLinks: SocialLinks | null = null

    // member_profile이 JSON 문자열이거나 객체인 경우 처리
    if (data.member_profile) {
      if (typeof data.member_profile === 'string') {
        try {
          profile = JSON.parse(data.member_profile)
        } catch {
          profile = null
        }
      } else if (typeof data.member_profile === 'object') {
        profile = data.member_profile as MemberProfile
      }
    }

    // social_links가 JSON 문자열이거나 객체인 경우 처리
    if (data.social_links) {
      if (typeof data.social_links === 'string') {
        try {
          socialLinks = JSON.parse(data.social_links)
        } catch {
          socialLinks = null
        }
      } else if (typeof data.social_links === 'object') {
        socialLinks = data.social_links as SocialLinks
      }
    }

    return {
      id: data.id,
      profile_id: data.profile_id,
      name: data.name,
      role: data.role,
      unit: data.unit,
      position_order: data.position_order,
      parent_id: data.parent_id,
      image_url: data.image_url,
      social_links: socialLinks,
      member_profile: profile,
      is_live: data.is_live,
      is_active: data.is_active,
      created_at: data.created_at,
    }
  }

  async findByUnit(unit: 'excel' | 'crew'): Promise<OrganizationRecord[]> {
    const { data } = await this.supabase
      .from('organization')
      .select('*')
      .eq('unit', unit)
      .eq('is_active', true)
      .order('position_order')
    return (data || []).map(d => this.mapToRecord(d))
  }

  async findLiveMembers(): Promise<OrganizationRecord[]> {
    const { data } = await this.supabase
      .from('organization')
      .select('*')
      .eq('is_live', true)
    return (data || []).map(d => this.mapToRecord(d))
  }

  async findAll(): Promise<OrganizationRecord[]> {
    const { data } = await this.supabase
      .from('organization')
      .select('*')
      .eq('is_active', true)
      .order('position_order')
    return (data || []).map(d => this.mapToRecord(d))
  }
}
