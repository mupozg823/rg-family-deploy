/**
 * Supabase Live Status Repository
 * 라이브 방송 상태 데이터 관리
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { ILiveStatusRepository } from '../types'
import type { LiveStatus } from '@/types/database'

export class SupabaseLiveStatusRepository implements ILiveStatusRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(): Promise<LiveStatus[]> {
    const { data } = await this.supabase
      .from('live_status')
      .select('*')
      .order('last_checked', { ascending: false })
    return data || []
  }

  async findByMemberId(memberId: number): Promise<LiveStatus[]> {
    const { data } = await this.supabase
      .from('live_status')
      .select('*')
      .eq('member_id', memberId)
    return data || []
  }

  async findLive(): Promise<LiveStatus[]> {
    const { data } = await this.supabase
      .from('live_status')
      .select('*')
      .eq('is_live', true)
      .order('viewer_count', { ascending: false })
    return data || []
  }

  async updateStatus(
    memberId: number,
    isLive: boolean,
    viewerCount?: number
  ): Promise<boolean> {
    const updateData: Partial<LiveStatus> = {
      is_live: isLive,
      last_checked: new Date().toISOString(),
    }

    if (viewerCount !== undefined) {
      updateData.viewer_count = viewerCount
    }

    const { error } = await this.supabase
      .from('live_status')
      .update(updateData)
      .eq('member_id', memberId)

    return !error
  }

  // 추가 헬퍼 메서드들
  async findByPlatform(platform: LiveStatus['platform']): Promise<LiveStatus[]> {
    const { data } = await this.supabase
      .from('live_status')
      .select('*')
      .eq('platform', platform)
    return data || []
  }

  async findLiveByPlatform(platform: LiveStatus['platform']): Promise<LiveStatus[]> {
    const { data } = await this.supabase
      .from('live_status')
      .select('*')
      .eq('platform', platform)
      .eq('is_live', true)
      .order('viewer_count', { ascending: false })
    return data || []
  }

  async upsert(data: {
    member_id: number
    platform: LiveStatus['platform']
    stream_url: string
    thumbnail_url?: string
    is_live?: boolean
    viewer_count?: number
  }): Promise<LiveStatus | null> {
    const { data: result, error } = await this.supabase
      .from('live_status')
      .upsert(
        {
          member_id: data.member_id,
          platform: data.platform,
          stream_url: data.stream_url,
          thumbnail_url: data.thumbnail_url || null,
          is_live: data.is_live ?? false,
          viewer_count: data.viewer_count ?? 0,
          last_checked: new Date().toISOString(),
        },
        { onConflict: 'member_id,platform' }
      )
      .select()
      .single()

    if (error) {
      console.error('LiveStatus upsert error:', error)
      return null
    }

    return result
  }

  async getLiveCount(): Promise<number> {
    const { count } = await this.supabase
      .from('live_status')
      .select('*', { count: 'exact', head: true })
      .eq('is_live', true)
    return count || 0
  }

  async findWithMemberInfo(): Promise<(LiveStatus & { member: { name: string; image_url: string | null } })[]> {
    const { data } = await this.supabase
      .from('live_status')
      .select(`
        *,
        member:organization(name, image_url)
      `)
      .eq('is_live', true)
      .order('viewer_count', { ascending: false })
    return data || []
  }
}
