/**
 * Supabase Media Content Repository
 * Shorts/VOD 미디어 콘텐츠 데이터 관리
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { IMediaContentRepository } from '../types'
import type { MediaContent } from '@/types/database'

export class SupabaseMediaContentRepository implements IMediaContentRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(): Promise<MediaContent[]> {
    const { data } = await this.supabase
      .from('media_content')
      .select('*')
      .order('created_at', { ascending: false })
    return data || []
  }

  async findById(id: number): Promise<MediaContent | null> {
    const { data } = await this.supabase
      .from('media_content')
      .select('*')
      .eq('id', id)
      .single()
    return data
  }

  async findByType(contentType: 'shorts' | 'vod'): Promise<MediaContent[]> {
    const { data } = await this.supabase
      .from('media_content')
      .select('*')
      .eq('content_type', contentType)
      .order('created_at', { ascending: false })
    return data || []
  }

  async findByUnit(unit: 'excel' | 'crew' | null): Promise<MediaContent[]> {
    let query = this.supabase
      .from('media_content')
      .select('*')

    if (unit === null) {
      query = query.is('unit', null)
    } else {
      query = query.eq('unit', unit)
    }

    const { data } = await query.order('created_at', { ascending: false })
    return data || []
  }

  async findFeatured(): Promise<MediaContent[]> {
    const { data } = await this.supabase
      .from('media_content')
      .select('*')
      .eq('is_featured', true)
      .order('created_at', { ascending: false })
    return data || []
  }

  // 추가 헬퍼 메서드들
  async findShorts(limit?: number): Promise<MediaContent[]> {
    let query = this.supabase
      .from('media_content')
      .select('*')
      .eq('content_type', 'shorts')
      .order('created_at', { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    const { data } = await query
    return data || []
  }

  async findVODs(limit?: number): Promise<MediaContent[]> {
    let query = this.supabase
      .from('media_content')
      .select('*')
      .eq('content_type', 'vod')
      .order('created_at', { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    const { data } = await query
    return data || []
  }

  async incrementViewCount(id: number): Promise<void> {
    await this.supabase.rpc('increment_media_view_count', { media_id: id })
  }

  async search(query: string): Promise<MediaContent[]> {
    const { data } = await this.supabase
      .from('media_content')
      .select('*')
      .or(`title.ilike.%${query}%,description.ilike.%${query}%`)
      .order('created_at', { ascending: false })
    return data || []
  }

  async findByTypeAndUnit(
    contentType: 'shorts' | 'vod',
    unit: 'excel' | 'crew' | null
  ): Promise<MediaContent[]> {
    let query = this.supabase
      .from('media_content')
      .select('*')
      .eq('content_type', contentType)

    if (unit === null) {
      query = query.is('unit', null)
    } else {
      query = query.eq('unit', unit)
    }

    const { data } = await query.order('created_at', { ascending: false })
    return data || []
  }
}
