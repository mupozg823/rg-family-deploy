/**
 * Supabase Guestbook Repository
 * 헌정 페이지 방명록 데이터 관리
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { IGuestbookRepository } from '../types'
import type { TributeGuestbook } from '@/types/database'

export class SupabaseGuestbookRepository implements IGuestbookRepository {
  constructor(private supabase: SupabaseClient) {}

  async findByTributeUserId(tributeUserId: string): Promise<TributeGuestbook[]> {
    const { data } = await this.supabase
      .from('tribute_guestbook')
      .select('*')
      .eq('tribute_user_id', tributeUserId)
      .eq('is_approved', true)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
    return data || []
  }

  async findById(id: number): Promise<TributeGuestbook | null> {
    const { data } = await this.supabase
      .from('tribute_guestbook')
      .select('*')
      .eq('id', id)
      .single()
    return data
  }

  async create(data: {
    tribute_user_id: string
    author_id: string
    author_name: string
    message: string
    is_member?: boolean
  }): Promise<TributeGuestbook | null> {
    const { data: newEntry, error } = await this.supabase
      .from('tribute_guestbook')
      .insert({
        tribute_user_id: data.tribute_user_id,
        author_id: data.author_id,
        author_name: data.author_name,
        message: data.message,
        is_member: data.is_member ?? false,
        is_approved: true, // 기본 승인 (스팸 방지 필요시 false로)
        is_deleted: false,
      })
      .select()
      .single()

    if (error) {
      console.error('Guestbook create error:', error)
      return null
    }

    return newEntry
  }

  async delete(id: number): Promise<boolean> {
    // Soft delete
    const { error } = await this.supabase
      .from('tribute_guestbook')
      .update({ is_deleted: true })
      .eq('id', id)

    return !error
  }

  // 추가 헬퍼 메서드들
  async findMemberGuestbookByTributeUserId(tributeUserId: string): Promise<TributeGuestbook[]> {
    const { data } = await this.supabase
      .from('tribute_guestbook')
      .select('*')
      .eq('tribute_user_id', tributeUserId)
      .eq('is_member', true)
      .eq('is_approved', true)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
    return data || []
  }

  async getCountByTributeUserId(tributeUserId: string): Promise<number> {
    const { count } = await this.supabase
      .from('tribute_guestbook')
      .select('*', { count: 'exact', head: true })
      .eq('tribute_user_id', tributeUserId)
      .eq('is_approved', true)
      .eq('is_deleted', false)
    return count || 0
  }

  async findPendingApproval(): Promise<TributeGuestbook[]> {
    const { data } = await this.supabase
      .from('tribute_guestbook')
      .select('*')
      .eq('is_approved', false)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
    return data || []
  }

  async approve(id: number): Promise<boolean> {
    const { error } = await this.supabase
      .from('tribute_guestbook')
      .update({ is_approved: true })
      .eq('id', id)

    return !error
  }

  async findByAuthorId(authorId: string): Promise<TributeGuestbook[]> {
    const { data } = await this.supabase
      .from('tribute_guestbook')
      .select('*')
      .eq('author_id', authorId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
    return data || []
  }

  async findAll(): Promise<TributeGuestbook[]> {
    const { data } = await this.supabase
      .from('tribute_guestbook')
      .select('*')
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
    return data || []
  }
}
