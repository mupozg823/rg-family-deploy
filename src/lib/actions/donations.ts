'use server'

import { adminAction, type ActionResult } from './index'
import type { InsertTables, UpdateTables, Donation } from '@/types/database'

type DonationInsert = InsertTables<'donations'>
type DonationUpdate = UpdateTables<'donations'>

/**
 * 후원 생성
 */
export async function createDonation(
  data: DonationInsert
): Promise<ActionResult<Donation>> {
  return adminAction(async (supabase) => {
    const { data: donation, error } = await supabase
      .from('donations')
      .insert(data)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return donation
  }, ['/admin/donations', '/ranking'])
}

/**
 * 후원 대량 생성 (CSV 업로드용)
 */
export async function bulkCreateDonations(
  data: DonationInsert[]
): Promise<ActionResult<Donation[]>> {
  return adminAction(async (supabase) => {
    const { data: donations, error } = await supabase
      .from('donations')
      .insert(data)
      .select()

    if (error) throw new Error(error.message)
    return donations
  }, ['/admin/donations', '/ranking'])
}

/**
 * 후원 수정
 */
export async function updateDonation(
  id: number,
  data: DonationUpdate
): Promise<ActionResult<Donation>> {
  return adminAction(async (supabase) => {
    const { data: donation, error } = await supabase
      .from('donations')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return donation
  }, ['/admin/donations', '/ranking'])
}

/**
 * 후원 삭제
 */
export async function deleteDonation(
  id: number
): Promise<ActionResult<null>> {
  return adminAction(async (supabase) => {
    const { error } = await supabase
      .from('donations')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
    return null
  }, ['/admin/donations', '/ranking'])
}

/**
 * 여러 후원 삭제
 */
export async function bulkDeleteDonations(
  ids: number[]
): Promise<ActionResult<null>> {
  return adminAction(async (supabase) => {
    const { error } = await supabase
      .from('donations')
      .delete()
      .in('id', ids)

    if (error) throw new Error(error.message)
    return null
  }, ['/admin/donations', '/ranking'])
}

/**
 * 후원 목록 조회 (페이지네이션)
 */
export async function getDonations(options: {
  page?: number
  limit?: number
  seasonId?: number
  unit?: 'excel' | 'crew'
}): Promise<ActionResult<{ data: Donation[]; count: number }>> {
  return adminAction(async (supabase) => {
    const { page = 1, limit = 20, seasonId, unit } = options
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
      .from('donations')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(from, to)

    if (seasonId) {
      query = query.eq('season_id', seasonId)
    }
    if (unit) {
      query = query.eq('unit', unit)
    }

    const { data, error, count } = await query

    if (error) throw new Error(error.message)
    return { data: data || [], count: count || 0 }
  })
}
