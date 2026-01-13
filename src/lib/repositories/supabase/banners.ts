/**
 * Supabase Banner Repository
 * 배너 데이터 관리
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { IBannerRepository } from '../types'
import type { Banner } from '@/types/database'

export class SupabaseBannerRepository implements IBannerRepository {
  constructor(private supabase: SupabaseClient) {}

  async findAll(): Promise<Banner[]> {
    const { data } = await this.supabase
      .from('banners')
      .select('*')
      .order('display_order', { ascending: true })
    return data || []
  }

  async findActive(): Promise<Banner[]> {
    const { data } = await this.supabase
      .from('banners')
      .select('*')
      .eq('is_active', true)
      .order('display_order', { ascending: true })
    return data || []
  }

  async findById(id: number): Promise<Banner | null> {
    const { data } = await this.supabase
      .from('banners')
      .select('*')
      .eq('id', id)
      .single()
    return data
  }

  // 추가 CRUD 메서드들
  async create(data: {
    image_url: string
    title?: string
    link_url?: string
    display_order?: number
    is_active?: boolean
  }): Promise<Banner | null> {
    const { data: newBanner, error } = await this.supabase
      .from('banners')
      .insert({
        image_url: data.image_url,
        title: data.title || null,
        link_url: data.link_url || null,
        display_order: data.display_order ?? 0,
        is_active: data.is_active ?? true,
      })
      .select()
      .single()

    if (error) {
      console.error('Banner create error:', error)
      return null
    }

    return newBanner
  }

  async update(id: number, data: Partial<Banner>): Promise<Banner | null> {
    const { data: updatedBanner, error } = await this.supabase
      .from('banners')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Banner update error:', error)
      return null
    }

    return updatedBanner
  }

  async delete(id: number): Promise<boolean> {
    const { error } = await this.supabase
      .from('banners')
      .delete()
      .eq('id', id)

    return !error
  }

  async toggleActive(id: number): Promise<boolean> {
    const banner = await this.findById(id)
    if (!banner) return false

    const { error } = await this.supabase
      .from('banners')
      .update({ is_active: !banner.is_active })
      .eq('id', id)

    return !error
  }

  async reorder(bannerIds: number[]): Promise<boolean> {
    // 트랜잭션처럼 순서대로 업데이트
    for (let i = 0; i < bannerIds.length; i++) {
      const { error } = await this.supabase
        .from('banners')
        .update({ display_order: i })
        .eq('id', bannerIds[i])

      if (error) {
        console.error('Banner reorder error:', error)
        return false
      }
    }

    return true
  }
}
