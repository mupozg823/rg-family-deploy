/**
 * Supabase Signature Repository
 * 시그니처 갤러리 데이터 관리
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { ISignatureRepository } from '../types'
import type { Signature } from '@/types/database'

export class SupabaseSignatureRepository implements ISignatureRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(): Promise<Signature[]> {
    const { data } = await this.supabase
      .from('signatures')
      .select('*')
      .order('created_at', { ascending: false })
    return data || []
  }

  async findById(id: number): Promise<Signature | null> {
    const { data } = await this.supabase
      .from('signatures')
      .select('*')
      .eq('id', id)
      .single()
    return data
  }

  async findByUnit(unit: 'excel' | 'crew'): Promise<Signature[]> {
    const { data } = await this.supabase
      .from('signatures')
      .select('*')
      .eq('unit', unit)
      .order('created_at', { ascending: false })
    return data || []
  }

  async findByMemberName(memberName: string): Promise<Signature[]> {
    const { data } = await this.supabase
      .from('signatures')
      .select('*')
      .eq('member_name', memberName)
      .order('created_at', { ascending: false })
    return data || []
  }

  async findFeatured(): Promise<Signature[]> {
    const { data } = await this.supabase
      .from('signatures')
      .select('*')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
    return data || []
  }

  // 추가 헬퍼 메서드
  async findByTags(tags: string[]): Promise<Signature[]> {
    const { data } = await this.supabase
      .from('signatures')
      .select('*')
      .overlaps('tags', tags)
      .order('created_at', { ascending: false })
    return data || []
  }

  async incrementViewCount(id: number): Promise<void> {
    await this.supabase.rpc('increment_signature_view_count', { sig_id: id })
  }

  async search(query: string): Promise<Signature[]> {
    const { data } = await this.supabase
      .from('signatures')
      .select('*')
      .or(`title.ilike.%${query}%,member_name.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false })
    return data || []
  }
}
