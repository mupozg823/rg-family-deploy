/**
 * Supabase VIP Reward Repository
 * VIP 보상 및 이미지 데이터 관리
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { IVipRewardRepository, IVipImageRepository } from '../types'
import type { VipReward, VipImage } from '@/types/database'

export class SupabaseVipRewardRepository implements IVipRewardRepository {
  constructor(private supabase: SupabaseClient) {}

  async findByProfileId(profileId: string): Promise<VipReward | null> {
    const { data } = await this.supabase
      .from('vip_rewards')
      .select('*')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    return data
  }

  async findByRank(rank: number, seasonId?: number): Promise<VipReward | null> {
    let query = this.supabase
      .from('vip_rewards')
      .select('*')
      .eq('rank', rank)

    if (seasonId) {
      query = query.eq('season_id', seasonId)
    }

    const { data } = await query
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    return data
  }

  async findBySeason(seasonId: number): Promise<VipReward[]> {
    const { data } = await this.supabase
      .from('vip_rewards')
      .select('*')
      .eq('season_id', seasonId)
      .order('rank', { ascending: true })
    return data || []
  }

  async findTop3(seasonId?: number): Promise<VipReward[]> {
    let query = this.supabase
      .from('vip_rewards')
      .select('*')
      .lte('rank', 3)

    if (seasonId) {
      query = query.eq('season_id', seasonId)
    }

    const { data } = await query.order('rank', { ascending: true })
    return data || []
  }

  async findTop50(seasonId?: number): Promise<VipReward[]> {
    let query = this.supabase
      .from('vip_rewards')
      .select('*')
      .lte('rank', 50)

    if (seasonId) {
      query = query.eq('season_id', seasonId)
    }

    const { data } = await query.order('rank', { ascending: true })
    return data || []
  }

  // 프로필과 조인해서 가져오기
  async findWithProfile(profileId: string): Promise<(VipReward & { profile: { nickname: string; avatar_url: string | null } }) | null> {
    const { data } = await this.supabase
      .from('vip_rewards')
      .select(`
        *,
        profile:profiles(nickname, avatar_url)
      `)
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()
    return data
  }
}

export class SupabaseVipImageRepository implements IVipImageRepository {
  constructor(private supabase: SupabaseClient) {}

  async findByRewardId(rewardId: number): Promise<VipImage[]> {
    const { data } = await this.supabase
      .from('vip_images')
      .select('*')
      .eq('reward_id', rewardId)
      .order('order_index', { ascending: true })
    return data || []
  }

  async findByProfileId(profileId: string): Promise<VipImage[]> {
    // 먼저 reward_id를 찾고 이미지 조회
    const { data: reward } = await this.supabase
      .from('vip_rewards')
      .select('id')
      .eq('profile_id', profileId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (!reward) return []

    return this.findByRewardId(reward.id)
  }

  async create(data: { reward_id: number; image_url: string; title?: string; order_index?: number }): Promise<VipImage | null> {
    const { data: newImage, error } = await this.supabase
      .from('vip_images')
      .insert({
        reward_id: data.reward_id,
        image_url: data.image_url,
        title: data.title || null,
        order_index: data.order_index || 0,
      })
      .select()
      .single()

    if (error) {
      console.error('VipImage create error:', error)
      return null
    }

    return newImage
  }

  async delete(id: number): Promise<boolean> {
    const { error } = await this.supabase
      .from('vip_images')
      .delete()
      .eq('id', id)

    return !error
  }
}
