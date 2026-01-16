/**
 * Supabase Timeline Repository
 * 타임라인 이벤트 데이터 관리
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { ITimelineRepository } from '../types'
import type { TimelineItem, JoinedSeason } from '@/types/common'

export class SupabaseTimelineRepository implements ITimelineRepository {
  constructor(private supabase: SupabaseClient) {}

  private formatEvent(event: Record<string, unknown>): TimelineItem {
    const season = event.seasons as JoinedSeason | null
    return {
      id: event.id as number,
      eventDate: event.event_date as string,
      title: event.title as string,
      description: event.description as string | null,
      imageUrl: event.image_url as string | null,
      category: event.category as string | null,
      seasonId: event.season_id as number | null,
      seasonName: season?.name,
    }
  }

  async findAll(): Promise<TimelineItem[]> {
    const { data, error } = await this.supabase
      .from('timeline_events')
      .select('*, seasons(name)')
      .order('event_date', { ascending: false })

    if (error) throw error
    return (data || []).map(e => this.formatEvent(e))
  }

  async findByFilter(options: {
    seasonId?: number | null
    category?: string | null
  }): Promise<TimelineItem[]> {
    const { seasonId, category } = options

    let query = this.supabase
      .from('timeline_events')
      .select('*, seasons(name)')
      .order('event_date', { ascending: false })

    if (seasonId) {
      query = query.eq('season_id', seasonId)
    }

    if (category) {
      query = query.eq('category', category)
    }

    const { data, error } = await query

    if (error) throw error
    return (data || []).map(e => this.formatEvent(e))
  }

  async getCategories(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('timeline_events')
      .select('category')

    if (error) throw error

    const cats = new Set<string>()
    ;(data || []).forEach(e => {
      if (e.category) cats.add(e.category)
    })
    return Array.from(cats)
  }
}
