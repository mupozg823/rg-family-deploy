/**
 * Supabase Post Repository
 * 게시글 데이터 관리
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { IPostRepository } from '../types'
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
}
