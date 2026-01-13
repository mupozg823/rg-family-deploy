/**
 * Supabase Comment Repository
 * 댓글 데이터 관리
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { ICommentRepository } from '../types'
import type { Comment } from '@/types/database'
import type { JoinedProfile } from '@/types/common'
import type { CommentItem } from '@/types/content'

export class SupabaseCommentRepository implements ICommentRepository {
  constructor(private supabase: SupabaseClient) {}

  private mapCommentItem(comment: Comment & { profiles?: JoinedProfile | null }): CommentItem {
    const profile = comment.profiles as JoinedProfile | null
    return {
      id: comment.id,
      postId: comment.post_id,
      content: comment.content,
      authorId: comment.author_id,
      authorName: profile?.nickname || '익명',
      authorAvatar: profile?.avatar_url || null,
      createdAt: comment.created_at,
    }
  }

  async findByPostId(postId: number): Promise<CommentItem[]> {
    const { data } = await this.supabase
      .from('comments')
      .select(`
        id,
        post_id,
        author_id,
        content,
        created_at,
        profiles:author_id (nickname, avatar_url)
      `)
      .eq('post_id', postId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
    return (data || []).map((comment) => this.mapCommentItem(comment as unknown as Comment & { profiles?: JoinedProfile | null }))
  }

  async findById(id: number): Promise<CommentItem | null> {
    const { data } = await this.supabase
      .from('comments')
      .select(`
        id,
        post_id,
        author_id,
        content,
        created_at,
        profiles:author_id (nickname, avatar_url)
      `)
      .eq('id', id)
      .single()
    return data ? this.mapCommentItem(data as unknown as Comment & { profiles?: JoinedProfile | null }) : null
  }

  async create(data: {
    post_id: number
    author_id: string
    content: string
    parent_id?: number
  }): Promise<CommentItem | null> {
    const { data: newComment, error } = await this.supabase
      .from('comments')
      .insert({
        post_id: data.post_id,
        author_id: data.author_id,
        content: data.content,
        parent_id: data.parent_id || null,
      })
      .select(`
        id,
        post_id,
        author_id,
        content,
        created_at,
        profiles:author_id (nickname, avatar_url)
      `)
      .single()

    if (error) {
      console.error('Comment create error:', error)
      return null
    }

    const { error: rpcError } = await this.supabase
      .rpc('increment_comment_count', { post_id: data.post_id })

    if (rpcError) {
      const { data: postData } = await this.supabase
        .from('posts')
        .select('comment_count')
        .eq('id', data.post_id)
        .single()

      if (postData) {
        await this.supabase
          .from('posts')
          .update({ comment_count: (postData.comment_count || 0) + 1 })
          .eq('id', data.post_id)
      }
    }

    return newComment ? this.mapCommentItem(newComment as unknown as Comment & { profiles?: JoinedProfile | null }) : null
  }

  async delete(id: number): Promise<boolean> {
    const { data: commentRow, error } = await this.supabase
      .from('comments')
      .select('post_id')
      .eq('id', id)
      .single()

    if (error || !commentRow) {
      return false
    }

    const { error: deleteError } = await this.supabase
      .from('comments')
      .update({ is_deleted: true })
      .eq('id', id)

    if (deleteError) {
      return false
    }

    const { error: rpcError } = await this.supabase
      .rpc('decrement_comment_count', { post_id: commentRow.post_id })

    if (rpcError) {
      const { data: postData } = await this.supabase
        .from('posts')
        .select('comment_count')
        .eq('id', commentRow.post_id)
        .single()

      if (postData) {
        const nextCount = Math.max((postData.comment_count || 0) - 1, 0)
        await this.supabase
          .from('posts')
          .update({ comment_count: nextCount })
          .eq('id', commentRow.post_id)
      }
    }

    return true
  }

  // 추가 헬퍼 메서드들
  async findRootCommentsByPostId(postId: number): Promise<Comment[]> {
    const { data } = await this.supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .is('parent_id', null)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
    return data || []
  }

  async findRepliesByParentId(parentId: number): Promise<Comment[]> {
    const { data } = await this.supabase
      .from('comments')
      .select('*')
      .eq('parent_id', parentId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })
    return data || []
  }

  async getCommentCountByPostId(postId: number): Promise<number> {
    const { count } = await this.supabase
      .from('comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
      .eq('is_deleted', false)
    return count || 0
  }
}
