'use server'

import { adminAction, publicAction, type ActionResult } from './index'
import type { InsertTables, UpdateTables, Signature } from '@/types/database'

type SignatureInsert = InsertTables<'signatures'>
type SignatureUpdate = UpdateTables<'signatures'>

/**
 * 시그니처 생성
 */
export async function createSignature(
  data: SignatureInsert
): Promise<ActionResult<Signature>> {
  return adminAction(async (supabase) => {
    const { data: signature, error } = await supabase
      .from('signatures')
      .insert(data)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return signature
  }, ['/admin/signatures', '/signature'])
}

/**
 * 시그니처 수정
 */
export async function updateSignature(
  id: number,
  data: SignatureUpdate
): Promise<ActionResult<Signature>> {
  return adminAction(async (supabase) => {
    const { data: signature, error } = await supabase
      .from('signatures')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return signature
  }, ['/admin/signatures', '/signature'])
}

/**
 * 시그니처 삭제
 */
export async function deleteSignature(
  id: number
): Promise<ActionResult<null>> {
  return adminAction(async (supabase) => {
    const { error } = await supabase
      .from('signatures')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
    return null
  }, ['/admin/signatures', '/signature'])
}

/**
 * Featured 토글
 */
export async function toggleSignatureFeatured(
  id: number,
  isFeatured: boolean
): Promise<ActionResult<Signature>> {
  return adminAction(async (supabase) => {
    const { data: signature, error } = await supabase
      .from('signatures')
      .update({ is_featured: isFeatured })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return signature
  }, ['/admin/signatures', '/signature'])
}

/**
 * 시그니처 목록 조회 (공개)
 */
export async function getSignatures(options?: {
  unit?: 'excel' | 'crew'
  mediaType?: 'video' | 'image' | 'gif'
  memberName?: string
  tag?: string
  featured?: boolean
  limit?: number
}): Promise<ActionResult<Signature[]>> {
  return publicAction(async (supabase) => {
    let query = supabase
      .from('signatures')
      .select('*')
      .order('created_at', { ascending: false })

    if (options?.unit) {
      query = query.eq('unit', options.unit)
    }
    if (options?.mediaType) {
      query = query.eq('media_type', options.mediaType)
    }
    if (options?.memberName) {
      query = query.eq('member_name', options.memberName)
    }
    if (options?.tag) {
      query = query.contains('tags', [options.tag])
    }
    if (options?.featured) {
      query = query.eq('is_featured', true)
    }
    if (options?.limit) {
      query = query.limit(options.limit)
    }

    const { data, error } = await query

    if (error) throw new Error(error.message)
    return data || []
  })
}

/**
 * Featured 시그니처 조회 (공개)
 */
export async function getFeaturedSignatures(
  limit: number = 6
): Promise<ActionResult<Signature[]>> {
  return getSignatures({ featured: true, limit })
}

/**
 * 멤버별 시그니처 조회 (공개)
 */
export async function getSignaturesByMember(
  memberName: string
): Promise<ActionResult<Signature[]>> {
  return getSignatures({ memberName })
}

/**
 * 시그니처 조회수 증가 (공개)
 */
export async function incrementSignatureViewCount(
  id: number
): Promise<ActionResult<null>> {
  return publicAction(async (supabase) => {
    // 현재 조회수 조회 후 증가
    const { data } = await supabase
      .from('signatures')
      .select('view_count')
      .eq('id', id)
      .single()

    if (data) {
      try {
        await supabase
          .from('signatures')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', id)
      } catch {
        // 조회수 증가 실패해도 무시
      }
    }

    return null
  })
}
