/**
 * Supabase Post Repository
 * 게시글 데이터 관리
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { IPostRepository, PaginationOptions, PaginatedResult, SearchOptions } from '../types'
import type { Post } from '@/types/database'
import type { JoinedProfile } from '@/types/common'
import type { PostItem } from '@/types/content'

export class SupabasePostRepository implements IPostRepository {
  constructor(private supabase: SupabaseClient) {}

  private mapPostItem(post: Post & { profiles?: JoinedProfile | null; category?: string | null }): PostItem {
    const profile = post.profiles as JoinedProfile | null
    return {
      id: post.id,
      boardType: post.board_type,
      category: post.category || undefined,
      title: post.title,
      content: post.content || '',
      authorId: post.author_id,
      authorName: post.is_anonymous ? '익명' : (profile?.nickname || '익명'),
      authorAvatar: post.is_anonymous ? null : (profile?.avatar_url || null),
      viewCount: post.view_count || 0,
      likeCount: post.like_count || 0,
      commentCount: post.comment_count || 0,
      isAnonymous: post.is_anonymous,
      createdAt: post.created_at,
    }
  }

  async findById(id: number): Promise<PostItem | null> {
    const { data } = await this.supabase
      .from('posts')
      .select(`
        id,
        board_type,
        title,
        content,
        author_id,
        view_count,
        like_count,
        comment_count,
        is_anonymous,
        created_at,
        profiles:author_id (nickname, avatar_url),
        category
      `)
      .eq('id', id)
      .single()

    return data
      ? this.mapPostItem(data as unknown as Post & { profiles?: JoinedProfile | null; category?: string | null })
      : null
  }

  async findByCategory(category: string): Promise<PostItem[]> {
    const { data } = await this.supabase
      .from('posts')
      .select(`
        id,
        board_type,
        title,
        content,
        author_id,
        view_count,
        like_count,
        comment_count,
        is_anonymous,
        created_at,
        profiles:author_id (nickname, avatar_url),
        category
      `)
      .eq('board_type', category)
      .order('created_at', { ascending: false })

    return (data || []).map((post) =>
      this.mapPostItem(post as unknown as Post & { profiles?: JoinedProfile | null; category?: string | null })
    )
  }

  async findRecent(limit: number): Promise<PostItem[]> {
    const { data } = await this.supabase
      .from('posts')
      .select(`
        id,
        board_type,
        title,
        content,
        author_id,
        view_count,
        like_count,
        comment_count,
        is_anonymous,
        created_at,
        profiles:author_id (nickname, avatar_url),
        category
      `)
      .order('created_at', { ascending: false })
      .limit(limit)

    return (data || []).map((post) =>
      this.mapPostItem(post as unknown as Post & { profiles?: JoinedProfile | null; category?: string | null })
    )
  }

  async findAll(): Promise<PostItem[]> {
    const { data } = await this.supabase
      .from('posts')
      .select(`
        id,
        board_type,
        title,
        content,
        author_id,
        view_count,
        like_count,
        comment_count,
        is_anonymous,
        created_at,
        profiles:author_id (nickname, avatar_url),
        category
      `)
      .order('created_at', { ascending: false })

    return (data || []).map((post) =>
      this.mapPostItem(post as unknown as Post & { profiles?: JoinedProfile | null; category?: string | null })
    )
  }

  async incrementViewCount(id: number, currentCount?: number): Promise<number | null> {
    const nextCount = (currentCount || 0) + 1
    const { data, error } = await this.supabase
      .from('posts')
      .update({ view_count: nextCount })
      .eq('id', id)
      .select('view_count')
      .single()

    if (error) {
      console.error('Post view count update error:', error)
      return null
    }

    return data?.view_count ?? nextCount
  }

  async delete(id: number): Promise<boolean> {
    const { error } = await this.supabase
      .from('posts')
      .delete()
      .eq('id', id)
    return !error
  }

  async findPaginated(
    category: string,
    options: PaginationOptions
  ): Promise<PaginatedResult<PostItem>> {
    const { page, limit } = options
    const offset = (page - 1) * limit

    // 전체 개수 조회
    const { count } = await this.supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })
      .eq('board_type', category)

    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / limit)

    // 페이지네이션된 데이터 조회
    const { data } = await this.supabase
      .from('posts')
      .select(`
        id,
        board_type,
        title,
        content,
        author_id,
        view_count,
        like_count,
        comment_count,
        is_anonymous,
        created_at,
        profiles:author_id (nickname, avatar_url),
        category
      `)
      .eq('board_type', category)
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const posts = (data || []).map((post) =>
      this.mapPostItem(post as unknown as Post & { profiles?: JoinedProfile | null; category?: string | null })
    )

    return {
      data: posts,
      totalCount,
      page,
      limit,
      totalPages,
    }
  }

  async search(
    query: string,
    options: SearchOptions & { category?: string }
  ): Promise<PaginatedResult<PostItem>> {
    const { page, limit, searchType = 'all', category } = options
    const offset = (page - 1) * limit

    let baseQuery = this.supabase
      .from('posts')
      .select(`
        id,
        board_type,
        title,
        content,
        author_id,
        view_count,
        like_count,
        comment_count,
        is_anonymous,
        created_at,
        profiles:author_id (nickname, avatar_url),
        category
      `)

    // 카테고리 필터
    if (category) {
      baseQuery = baseQuery.eq('board_type', category)
    }

    // 검색 조건 적용
    if (query) {
      if (searchType === 'title') {
        baseQuery = baseQuery.ilike('title', `%${query}%`)
      } else {
        // 'all' - 제목 검색 (작성자 검색은 클라이언트에서 처리)
        baseQuery = baseQuery.ilike('title', `%${query}%`)
      }
    }

    // 전체 개수 조회
    let countQuery = this.supabase
      .from('posts')
      .select('*', { count: 'exact', head: true })

    if (category) {
      countQuery = countQuery.eq('board_type', category)
    }
    if (query && searchType === 'title') {
      countQuery = countQuery.ilike('title', `%${query}%`)
    } else if (query) {
      countQuery = countQuery.ilike('title', `%${query}%`)
    }

    const { count } = await countQuery
    const totalCount = count || 0
    const totalPages = Math.ceil(totalCount / limit)

    // 데이터 조회
    const { data } = await baseQuery
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    const posts = (data || []).map((post) =>
      this.mapPostItem(post as unknown as Post & { profiles?: JoinedProfile | null; category?: string | null })
    )

    return {
      data: posts,
      totalCount,
      page,
      limit,
      totalPages,
    }
  }

  async toggleLike(postId: number, userId: string): Promise<{ liked: boolean; likeCount: number } | null> {
    // 이미 좋아요 했는지 확인
    const { data: existingLike } = await this.supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single()

    let liked: boolean

    if (existingLike) {
      // 좋아요 취소
      const { error: deleteError } = await this.supabase
        .from('post_likes')
        .delete()
        .eq('post_id', postId)
        .eq('user_id', userId)

      if (deleteError) {
        console.error('좋아요 취소 실패:', deleteError)
        return null
      }
      liked = false
    } else {
      // 좋아요 추가
      const { error: insertError } = await this.supabase
        .from('post_likes')
        .insert({ post_id: postId, user_id: userId })

      if (insertError) {
        console.error('좋아요 추가 실패:', insertError)
        return null
      }
      liked = true
    }

    // 좋아요 수 업데이트 (count로 계산)
    const { count } = await this.supabase
      .from('post_likes')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)

    const likeCount = count || 0

    // posts 테이블의 like_count 동기화
    await this.supabase
      .from('posts')
      .update({ like_count: likeCount })
      .eq('id', postId)

    return { liked, likeCount }
  }

  async hasUserLiked(postId: number, userId: string): Promise<boolean> {
    const { data } = await this.supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', userId)
      .single()

    return !!data
  }
}
