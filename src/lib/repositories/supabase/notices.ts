/**
 * Supabase Notice Repository
 * 공지사항 데이터 관리
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { INoticeRepository, PaginationOptions, PaginatedResult, SearchOptions } from '../types'
import type { Notice } from '@/types/database'

export class SupabaseNoticeRepository implements INoticeRepository {
  constructor(private supabase: SupabaseClient) {}

  async findById(id: number): Promise<Notice | null> {
    const { data } = await this.supabase
      .from('notices')
      .select('*')
      .eq('id', id)
      .single()
    return data
  }

  async findRecent(limit: number): Promise<Notice[]> {
    const { data } = await this.supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit)
    return data || []
  }

  async findPublished(): Promise<Notice[]> {
    const { data } = await this.supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false })
    return data || []
  }

  async findAll(): Promise<Notice[]> {
    const { data } = await this.supabase
      .from('notices')
      .select('*')
      .order('created_at', { ascending: false })
    return data || []
  }

  async findPaginated(
    options: PaginationOptions & { category?: string }
  ): Promise<PaginatedResult<Notice>> {
    const { page, limit, category } = options
    const offset = (page - 1) * limit

    // 전체 개수 조회
    let countQuery = this.supabase
      .from('notices')
      .select('*', { count: 'exact', head: true })

    if (category && category !== 'all') {
      countQuery = countQuery.eq('category', category)
    }

    const { count } = await countQuery
    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / limit)

    // 데이터 조회
    let dataQuery = this.supabase
      .from('notices')
      .select('*')

    if (category && category !== 'all') {
      dataQuery = dataQuery.eq('category', category)
    }

    const { data } = await dataQuery
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    return {
      data: data || [],
      totalCount,
      page,
      limit,
      totalPages,
    }
  }

  async search(
    query: string,
    options: SearchOptions & { category?: string }
  ): Promise<PaginatedResult<Notice>> {
    const { page, limit, searchType = 'all', category } = options
    const offset = (page - 1) * limit

    // 기본 쿼리 구성
    let baseQuery = this.supabase.from('notices').select('*')

    if (category && category !== 'all') {
      baseQuery = baseQuery.eq('category', category)
    }

    if (query) {
      baseQuery = baseQuery.ilike('title', `%${query}%`)
    }

    // 전체 개수 조회
    let countQuery = this.supabase
      .from('notices')
      .select('*', { count: 'exact', head: true })

    if (category && category !== 'all') {
      countQuery = countQuery.eq('category', category)
    }
    if (query) {
      countQuery = countQuery.ilike('title', `%${query}%`)
    }

    const { count } = await countQuery
    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / limit)

    // 데이터 조회
    const { data } = await baseQuery
      .order('is_pinned', { ascending: false })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    return {
      data: data || [],
      totalCount,
      page,
      limit,
      totalPages,
    }
  }
}
