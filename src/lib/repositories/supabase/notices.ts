/**
 * Supabase Notice Repository
 * 공지사항 데이터 관리
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { INoticeRepository } from '../types'
import type { Notice } from '@/types/database'

export class SupabaseNoticeRepository implements INoticeRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: number): Promise<Notice | null> {
    const { data } = await this.supabase
      .from('notices')
      .select('*')
      .eq('id', id)
      .single()
    return data
  }

  async findRecent(limit: number): Promise<Notice[]> {
    const { data } = await this.supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    return data || []
  }

  async findPublished(): Promise<Notice[]> {
    const { data } = await this.supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false })
    return data || []
  }

  async findAll(): Promise<Notice[]> {
    const { data } = await this.supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false })
    return data || []
  }
}
