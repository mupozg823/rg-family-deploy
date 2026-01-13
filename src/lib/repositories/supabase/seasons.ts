/**
 * Supabase Season Repository
 * 시즌 데이터 관리
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { ISeasonRepository } from '../types'
import type { Season } from '@/types/database'

export class SupabaseSeasonRepository implements ISeasonRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: number): Promise<Season | null> {
    const { data } = await this.supabase
      .from('seasons')
      .select('*')
      .eq('id', id)
      .single()
    return data
  }

  async findActive(): Promise<Season | null> {
    const { data } = await this.supabase
      .from('seasons')
      .select('*')
      .eq('is_active', true)
      .single()
    return data
  }

  async findAll(): Promise<Season[]> {
    const { data } = await this.supabase
      .from('seasons')
      .select('*')
      .order('start_date', { ascending: false })
    return data || []
  }
}
