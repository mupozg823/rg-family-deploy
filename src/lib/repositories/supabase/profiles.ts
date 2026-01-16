/**
 * Supabase Profile Repository
 * 사용자 프로필 데이터 관리
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { IProfileRepository } from '../types'
import type { Profile } from '@/types/database'

export class SupabaseProfileRepository implements IProfileRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: string): Promise<Profile | null> {
    const { data } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()
    return data
  }

  async findByNickname(nickname: string): Promise<Profile | null> {
    const { data } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('nickname', nickname)
      .single()
    return data
  }

  async findVipMembers(): Promise<Profile[]> {
    const { data } = await this.supabase
      .from('profiles')
      .select('*')
      .eq('role', 'vip')
    return data || []
  }

  async findAll(): Promise<Profile[]> {
    const { data } = await this.supabase
      .from('profiles')
      .select('*')
    return data || []
  }
}
