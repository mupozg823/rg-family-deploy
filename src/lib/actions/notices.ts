'use server'

import { adminAction, publicAction, type ActionResult } from './index'
import type { InsertTables, UpdateTables, Notice } from '@/types/database'

type NoticeInsert = InsertTables<'notices'>
type NoticeUpdate = UpdateTables<'notices'>

/**
 * 공지사항 생성
 */
export async function createNotice(
  data: NoticeInsert
): Promise<ActionResult<Notice>> {
  return adminAction(async (supabase) => {
    const { data: { user } } = await supabase.auth.getUser()

    const { data: notice, error } = await supabase
      .from('notices')
      .insert({
        ...data,
        author_id: user?.id
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return notice
  }, ['/admin/notices', '/notice'])
}

/**
 * 공지사항 수정
 */
export async function updateNotice(
  id: number,
  data: NoticeUpdate
): Promise<ActionResult<Notice>> {
  return adminAction(async (supabase) => {
    const { data: notice, error } = await supabase
      .from('notices')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return notice
  }, ['/admin/notices', '/notice', `/notice/${id}`])
}

/**
 * 공지사항 삭제
 */
export async function deleteNotice(
  id: number
): Promise<ActionResult<null>> {
  return adminAction(async (supabase) => {
    const { error } = await supabase
      .from('notices')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
    return null
  }, ['/admin/notices', '/notice'])
}

/**
 * 공지사항 고정/해제
 */
export async function toggleNoticePinned(
  id: number,
  isPinned: boolean
): Promise<ActionResult<Notice>> {
  return adminAction(async (supabase) => {
    const { data: notice, error } = await supabase
      .from('notices')
      .update({ is_pinned: isPinned })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return notice
  }, ['/admin/notices', '/notice'])
}

/**
 * 공지사항 목록 조회 (공개)
 */
export async function getNotices(options?: {
  category?: 'official' | 'excel' | 'crew'
  limit?: number
}): Promise<ActionResult<Notice[]>> {
  return publicAction(async (supabase) => {
    let query = supabase
      .from('notices')
      .select('*')
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })

    if (options?.category) {
      query = query.eq('category', options.category)
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
 * 공지사항 상세 조회 (공개) - 조회수 증가
 */
export async function getNoticeById(
  id: number
): Promise<ActionResult<Notice | null>> {
  return publicAction(async (supabase) => {
    // 먼저 데이터 조회
    const { data, error } = await supabase
      .from('notices')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw new Error(error.message)

    // 조회수 증가 (별도 업데이트)
    if (data) {
      try {
        await supabase
          .from('notices')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', id)
      } catch {
        // 조회수 증가 실패해도 무시
      }
    }

    return data
  })
}
