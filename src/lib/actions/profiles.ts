'use server'

import { adminAction, authAction, publicAction, type ActionResult } from './index'
import type { InsertTables, UpdateTables, Profile } from '@/types/database'

type ProfileInsert = InsertTables<'profiles'>
type ProfileUpdate = UpdateTables<'profiles'>

/**
 * 프로필 생성 (Admin)
 */
export async function createProfile(
  data: ProfileInsert
): Promise<ActionResult<Profile>> {
  return adminAction(async (supabase) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert(data)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return profile
  }, ['/admin/members'])
}

/**
 * 프로필 수정 (Admin)
 */
export async function updateProfileByAdmin(
  id: string,
  data: ProfileUpdate
): Promise<ActionResult<Profile>> {
  return adminAction(async (supabase) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return profile
  }, ['/admin/members', '/ranking'])
}

/**
 * 프로필 삭제 (Admin)
 */
export async function deleteProfile(
  id: string
): Promise<ActionResult<null>> {
  return adminAction(async (supabase) => {
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
    return null
  }, ['/admin/members'])
}

/**
 * 역할 변경 (Admin)
 */
export async function updateUserRole(
  id: string,
  role: Profile['role']
): Promise<ActionResult<Profile>> {
  return adminAction(async (supabase) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return profile
  }, ['/admin/members'])
}

/**
 * 자신의 프로필 수정
 */
export async function updateMyProfile(
  data: Pick<ProfileUpdate, 'nickname' | 'avatar_url'>
): Promise<ActionResult<Profile>> {
  return authAction(async (supabase, userId) => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .update(data)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return profile
  })
}

/**
 * 프로필 목록 조회 (Admin)
 */
export async function getProfiles(options?: {
  page?: number
  limit?: number
  role?: Profile['role']
  unit?: 'excel' | 'crew'
}): Promise<ActionResult<{ data: Profile[]; count: number }>> {
  return adminAction(async (supabase) => {
    const { page = 1, limit = 20, role, unit } = options || {}
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
      .from('profiles')
      .select('*', { count: 'exact' })
      .order('total_donation', { ascending: false })
      .range(from, to)

    if (role) {
      query = query.eq('role', role)
    }
    if (unit) {
      query = query.eq('unit', unit)
    }

    const { data, error, count } = await query

    if (error) throw new Error(error.message)
    return { data: data || [], count: count || 0 }
  })
}

/**
 * 프로필 조회 (공개)
 */
export async function getProfileById(
  id: string
): Promise<ActionResult<Profile | null>> {
  return publicAction(async (supabase) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single()

    if (error && error.code !== 'PGRST116') {
      throw new Error(error.message)
    }
    return data
  })
}

/**
 * Top N 후원자 조회 (공개)
 */
export async function getTopDonors(
  limit: number = 50
): Promise<ActionResult<Profile[]>> {
  return publicAction(async (supabase) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .gt('total_donation', 0)
      .order('total_donation', { ascending: false })
      .limit(limit)

    if (error) throw new Error(error.message)
    return data || []
  })
}
