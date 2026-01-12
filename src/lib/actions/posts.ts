'use server'

import { adminAction, authAction, publicAction, type ActionResult } from './index'
import type { InsertTables, UpdateTables, Post, Comment } from '@/types/database'

type PostInsert = InsertTables<'posts'>
type PostUpdate = UpdateTables<'posts'>
type CommentInsert = InsertTables<'comments'>
type CommentUpdate = UpdateTables<'comments'>

// ==================== Posts ====================

/**
 * 게시글 생성 (인증 필요)
 */
export async function createPost(
  data: Omit<PostInsert, 'author_id'>
): Promise<ActionResult<Post>> {
  return authAction(async (supabase, userId) => {
    const { data: post, error } = await supabase
      .from('posts')
      .insert({
        ...data,
        author_id: userId
      })
      .select()
      .single()

    if (error) throw new Error(error.message)
    return post
  }, ['/community/free', '/community/vip'])
}

/**
 * 게시글 수정 (작성자 또는 Admin)
 */
export async function updatePost(
  id: number,
  data: PostUpdate
): Promise<ActionResult<Post>> {
  return authAction(async (supabase, userId) => {
    // 작성자 확인
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', id)
      .single()

    if (fetchError) throw new Error(fetchError.message)

    // 작성자가 아니면 Admin 권한 확인
    if (existingPost.author_id !== userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (!profile || !['admin', 'superadmin', 'moderator'].includes(profile.role)) {
        throw new Error('수정 권한이 없습니다.')
      }
    }

    const { data: post, error } = await supabase
      .from('posts')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return post
  }, ['/community/free', '/community/vip'])
}

/**
 * 게시글 삭제 (작성자 또는 Admin)
 */
export async function deletePost(
  id: number
): Promise<ActionResult<null>> {
  return authAction(async (supabase, userId) => {
    // Soft delete
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('author_id')
      .eq('id', id)
      .single()

    if (fetchError) throw new Error(fetchError.message)

    if (existingPost.author_id !== userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (!profile || !['admin', 'superadmin', 'moderator'].includes(profile.role)) {
        throw new Error('삭제 권한이 없습니다.')
      }
    }

    const { error } = await supabase
      .from('posts')
      .update({ is_deleted: true })
      .eq('id', id)

    if (error) throw new Error(error.message)
    return null
  }, ['/community/free', '/community/vip'])
}

/**
 * 게시글 목록 조회 (공개)
 */
export async function getPosts(options: {
  boardType: 'free' | 'vip'
  page?: number
  limit?: number
}): Promise<ActionResult<{ data: Post[]; count: number }>> {
  return publicAction(async (supabase) => {
    const { boardType, page = 1, limit = 20 } = options
    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabase
      .from('posts')
      .select('*', { count: 'exact' })
      .eq('board_type', boardType)
      .eq('is_deleted', false)
      .order('created_at', { ascending: false })
      .range(from, to)

    if (error) throw new Error(error.message)
    return { data: data || [], count: count || 0 }
  })
}

/**
 * 게시글 상세 조회 (공개)
 */
export async function getPostById(
  id: number
): Promise<ActionResult<Post | null>> {
  return publicAction(async (supabase) => {
    const { data, error } = await supabase
      .from('posts')
      .select('*')
      .eq('id', id)
      .eq('is_deleted', false)
      .single()

    if (error) throw new Error(error.message)

    // 조회수 증가
    if (data) {
      try {
        await supabase
          .from('posts')
          .update({ view_count: (data.view_count || 0) + 1 })
          .eq('id', id)
      } catch {
        // 무시
      }
    }

    return data
  })
}

// ==================== Comments ====================

/**
 * 댓글 생성 (인증 필요)
 */
export async function createComment(
  data: Omit<CommentInsert, 'author_id'>
): Promise<ActionResult<Comment>> {
  return authAction(async (supabase, userId) => {
    const { data: comment, error } = await supabase
      .from('comments')
      .insert({
        ...data,
        author_id: userId
      })
      .select()
      .single()

    if (error) throw new Error(error.message)

    // 댓글 수 증가
    const { data: post } = await supabase
      .from('posts')
      .select('comment_count')
      .eq('id', data.post_id)
      .single()

    if (post) {
      try {
        await supabase
          .from('posts')
          .update({ comment_count: (post.comment_count || 0) + 1 })
          .eq('id', data.post_id)
      } catch {
        // 무시
      }
    }

    return comment
  })
}

/**
 * 댓글 수정 (작성자 또는 Admin)
 */
export async function updateComment(
  id: number,
  data: CommentUpdate
): Promise<ActionResult<Comment>> {
  return authAction(async (supabase, userId) => {
    const { data: existingComment, error: fetchError } = await supabase
      .from('comments')
      .select('author_id')
      .eq('id', id)
      .single()

    if (fetchError) throw new Error(fetchError.message)

    if (existingComment.author_id !== userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (!profile || !['admin', 'superadmin', 'moderator'].includes(profile.role)) {
        throw new Error('수정 권한이 없습니다.')
      }
    }

    const { data: comment, error } = await supabase
      .from('comments')
      .update(data)
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return comment
  })
}

/**
 * 댓글 삭제 (작성자 또는 Admin)
 */
export async function deleteComment(
  id: number
): Promise<ActionResult<null>> {
  return authAction(async (supabase, userId) => {
    const { data: existingComment, error: fetchError } = await supabase
      .from('comments')
      .select('author_id, post_id')
      .eq('id', id)
      .single()

    if (fetchError) throw new Error(fetchError.message)

    if (existingComment.author_id !== userId) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', userId)
        .single()

      if (!profile || !['admin', 'superadmin', 'moderator'].includes(profile.role)) {
        throw new Error('삭제 권한이 없습니다.')
      }
    }

    // Soft delete
    const { error } = await supabase
      .from('comments')
      .update({ is_deleted: true })
      .eq('id', id)

    if (error) throw new Error(error.message)
    return null
  })
}

/**
 * 게시글의 댓글 목록 조회 (공개)
 */
export async function getCommentsByPostId(
  postId: number
): Promise<ActionResult<Comment[]>> {
  return publicAction(async (supabase) => {
    const { data, error } = await supabase
      .from('comments')
      .select('*')
      .eq('post_id', postId)
      .eq('is_deleted', false)
      .order('created_at', { ascending: true })

    if (error) throw new Error(error.message)
    return data || []
  })
}

// ==================== Admin Only ====================

/**
 * 게시글 강제 삭제 (Admin - Hard Delete)
 */
export async function hardDeletePost(
  id: number
): Promise<ActionResult<null>> {
  return adminAction(async (supabase) => {
    const { error } = await supabase
      .from('posts')
      .delete()
      .eq('id', id)

    if (error) throw new Error(error.message)
    return null
  }, ['/admin/posts', '/community/free', '/community/vip'])
}

/**
 * 게시글 복구 (Admin)
 */
export async function restorePost(
  id: number
): Promise<ActionResult<Post>> {
  return adminAction(async (supabase) => {
    const { data: post, error } = await supabase
      .from('posts')
      .update({ is_deleted: false })
      .eq('id', id)
      .select()
      .single()

    if (error) throw new Error(error.message)
    return post
  }, ['/admin/posts', '/community/free', '/community/vip'])
}
