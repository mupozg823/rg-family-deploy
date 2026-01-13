/**
 * Supabase Organization Repository
 * 조직 구조 데이터 관리
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { IOrganizationRepository } from '../types'
import type { Organization } from '@/types/database'

export class SupabaseOrganizationRepository implements IOrganizationRepository {
  constructor(private supabase: SupabaseClient) {}

  async findByUnit(unit: 'excel' | 'crew'): Promise<Organization[]> {
    const { data } = await this.supabase
      .from('organization')
      .select('*')
      .eq('unit', unit)
      .eq('is_active', true)
      .order('position_order')
    return data || []
  }

  async findLiveMembers(): Promise<Organization[]> {
    const { data } = await this.supabase
      .from('organization')
      .select('*')
      .eq('is_live', true)
    return data || []
  }

  async findAll(): Promise<Organization[]> {
    const { data } = await this.supabase
      .from('organization')
      .select('*')
      .eq('is_active', true)
      .order('position_order')
    return data || []
  }
}
