/**
 * useGuestbook Hook
 *
 * 헌정 페이지 방명록 데이터 관리
 * - 방명록 조회 (Mock/Supabase)
 * - 방명록 작성 (인증된 사용자)
 */

import { useState, useEffect, useCallback } from 'react'
import { USE_MOCK_DATA } from '@/lib/config'
import {
  getGuestbookByTributeUserId,
  type GuestbookEntry,
} from '@/lib/mock'
import { useAuthContext, useSupabaseContext } from '@/lib/context'

interface UseGuestbookOptions {
  tributeUserId: string
}

interface UseGuestbookReturn {
  entries: GuestbookEntry[]
  isLoading: boolean
  error: string | null
  submitEntry: (message: string) => Promise<boolean>
  isSubmitting: boolean
  canWrite: boolean
  refetch: () => void
}

export function useGuestbook({ tributeUserId }: UseGuestbookOptions): UseGuestbookReturn {
  const { user, profile, isAuthenticated } = useAuthContext()
  const supabase = useSupabaseContext()
  const [entries, setEntries] = useState<GuestbookEntry[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // 작성 권한: 로그인된 사용자만
  const canWrite = isAuthenticated && !!user

  // 방명록 조회
  const fetchGuestbook = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      if (USE_MOCK_DATA) {
        // Mock 데이터 사용
        const mockEntries = getGuestbookByTributeUserId(tributeUserId)
        setEntries(mockEntries)
      } else {
        // Supabase 쿼리 (테이블 미생성 시 mock fallback)
        const { data, error: fetchError } = await supabase
          .from('tribute_guestbook')
          .select('*')
          .eq('tribute_user_id', tributeUserId)
          .eq('is_approved', true)
          .eq('is_deleted', false)
          .order('created_at', { ascending: false })

        if (fetchError) {
          // 테이블 없거나 에러 시 mock 데이터 사용
          console.warn('Guestbook fetch fallback to mock:', fetchError.message)
          const mockEntries = getGuestbookByTributeUserId(tributeUserId)
          setEntries(mockEntries)
        } else {
          setEntries(data || [])
        }
      }
    } catch (err) {
      setError('방명록을 불러오는데 실패했습니다.')
      console.error('Guestbook fetch error:', err)
    } finally {
      setIsLoading(false)
    }
  }, [tributeUserId, supabase])

  // 방명록 작성
  const submitEntry = useCallback(async (message: string): Promise<boolean> => {
    if (!canWrite || !user || !profile) {
      setError('로그인이 필요합니다.')
      return false
    }

    if (!message.trim()) {
      setError('메시지를 입력해주세요.')
      return false
    }

    if (message.length > 500) {
      setError('메시지는 500자 이내로 작성해주세요.')
      return false
    }

    setIsSubmitting(true)
    setError(null)

    try {
      // 새 엔트리 객체 생성
      const newEntry: GuestbookEntry = {
        id: Date.now(),
        tribute_user_id: tributeUserId,
        author_id: user.id,
        author_name: profile.nickname || '익명',
        message: message.trim(),
        is_member: profile.unit !== null, // 엑셀부/크루부 멤버인지
        created_at: new Date().toISOString(),
        author_unit: profile.unit,
      }

      if (USE_MOCK_DATA) {
        // Mock 모드: 로컬 상태에만 추가 (새로고침 시 초기화)
        setEntries(prev => [newEntry, ...prev])
        return true
      } else {
        // Supabase 쿼리 (테이블 미생성 시 mock fallback)
        const { error: insertError } = await supabase
          .from('tribute_guestbook')
          .insert({
            tribute_user_id: tributeUserId,
            author_id: user.id,
            author_name: profile.nickname || '익명',
            message: message.trim(),
            is_member: profile.unit !== null,
            author_unit: profile.unit,
          })

        if (insertError) {
          // 테이블 없으면 로컬 상태만 업데이트
          console.warn('Guestbook insert fallback to local:', insertError.message)
          setEntries(prev => [newEntry, ...prev])
        } else {
          // 성공 시 새로고침
          await fetchGuestbook()
        }
        return true
      }
    } catch (err) {
      setError('방명록 작성에 실패했습니다.')
      console.error('Guestbook submit error:', err)
      return false
    } finally {
      setIsSubmitting(false)
    }
  }, [canWrite, user, profile, tributeUserId, supabase, fetchGuestbook])

  // 초기 로드
  useEffect(() => {
    fetchGuestbook()
  }, [fetchGuestbook])

  return {
    entries,
    isLoading,
    error,
    submitEntry,
    isSubmitting,
    canWrite,
    refetch: fetchGuestbook,
  }
}
