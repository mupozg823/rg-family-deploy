'use client'

/**
 * useOrganizationData Hook
 *
 * Organization 데이터 로딩 및 상태 관리를 위한 커스텀 훅
 * - Repository 패턴 활용
 * - 로딩/에러 상태 관리
 * - 실시간 업데이트 구독 (옵션)
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { useOrganization } from '@/lib/context'
import { useSupabaseContext } from '@/lib/context'
import { USE_MOCK_DATA } from '@/lib/config'
import type { UnitType, GroupableMember, OrganizationRecord } from '@/types/organization'

interface UseOrganizationDataOptions {
  /** 특정 유닛만 필터링 */
  unit?: UnitType
  /** 라이브 멤버만 필터링 */
  liveOnly?: boolean
  /** 실시간 업데이트 구독 여부 */
  realtime?: boolean
}

interface UseOrganizationDataReturn {
  /** 조직 멤버 목록 */
  members: OrganizationRecord[]
  /** 로딩 상태 */
  isLoading: boolean
  /** 에러 메시지 */
  error: string | null
  /** 데이터 새로고침 */
  refresh: () => Promise<void>
  /** 유닛별 필터링된 멤버 반환 */
  getByUnit: (unit: UnitType) => OrganizationRecord[]
  /** 라이브 멤버만 반환 */
  getLiveMembers: () => OrganizationRecord[]
  /** 역할별 그룹화된 멤버 반환 (제네릭 타입 지원) */
  getGroupedByRole: <T extends GroupableMember>(members: T[]) => {
    leaders: T[]
    directors: T[]
    managers: T[]
    members: T[]
  }
}

export function useOrganizationData(
  options: UseOrganizationDataOptions = {}
): UseOrganizationDataReturn {
  const { unit, liveOnly = false, realtime = false } = options

  const organizationRepo = useOrganization()
  const supabase = useSupabaseContext()

  const [members, setMembers] = useState<OrganizationRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // K-0005: mounted 체크로 언마운트 후 상태 업데이트 방지
  const isMountedRef = useRef(true)

  // 데이터 페칭 함수
  const fetchData = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      let data: OrganizationRecord[]

      if (liveOnly) {
        data = await organizationRepo.findLiveMembers()
      } else if (unit) {
        data = await organizationRepo.findByUnit(unit)
      } else {
        data = await organizationRepo.findAll()
      }

      // 언마운트된 경우 상태 업데이트 스킵
      if (!isMountedRef.current) return

      setMembers(data)
    } catch (err) {
      if (!isMountedRef.current) return
      const message = err instanceof Error ? err.message : '데이터를 불러오는데 실패했습니다'
      setError(message)
      console.error('Organization data fetch error:', err)
    } finally {
      if (isMountedRef.current) {
        setIsLoading(false)
      }
    }
  }, [organizationRepo, unit, liveOnly])

  // fetchData를 ref로 유지하여 구독 effect에서 안정적으로 참조
  const fetchDataRef = useRef(fetchData)
  useEffect(() => {
    fetchDataRef.current = fetchData
  }, [fetchData])

  // 초기 데이터 로드
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // K-0005: 언마운트 시 cleanup
  useEffect(() => {
    return () => {
      isMountedRef.current = false
    }
  }, [])

  // 실시간 구독 (별도 effect로 분리하여 재구독 최소화)
  useEffect(() => {
    // Mock 데이터 사용 시 실시간 구독 불필요
    if (USE_MOCK_DATA || !realtime) return

    // Supabase 실시간 구독
    const channel = supabase
      .channel('organization_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'organization' },
        () => {
          fetchDataRef.current()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [supabase, realtime])

  // 유틸리티 함수들
  const getByUnit = useCallback(
    (targetUnit: UnitType): OrganizationRecord[] => {
      return members.filter((m) => m.unit === targetUnit)
    },
    [members]
  )

  const getLiveMembers = useCallback((): OrganizationRecord[] => {
    return members.filter((m) => m.is_live)
  }, [members])

  const getGroupedByRole = useCallback(
    <T extends GroupableMember>(memberList: T[]) => {
      // 한글/영문 역할 모두 지원
      const leaders = memberList.filter(
        (m) => m.role === '대표' || m.role === 'R대표' || m.role === 'G대표' ||
               m.role === 'LEADER' || m.role === 'CEO'
      )
      const directors = memberList.filter(
        (m) => m.role === '부장' || m.role === 'DIRECTOR'
      )
      const managers = memberList.filter(
        (m) => m.role === '팀장' || m.role === 'MANAGER'
      )
      const regularMembers = memberList.filter(
        (m) => m.role === '멤버' || m.role === '크루' ||
               m.role === 'MEMBER' || m.role === 'CREW'
      )
      return { leaders, directors, managers, members: regularMembers }
    },
    []
  )

  return {
    members,
    isLoading,
    error,
    refresh: fetchData,
    getByUnit,
    getLiveMembers,
    getGroupedByRole,
  }
}

export default useOrganizationData
