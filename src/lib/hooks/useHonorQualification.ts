'use client'

import { useEffect, useState } from 'react'
import { useAuthContext, useSupabaseContext } from '@/lib/context'
import { USE_MOCK_DATA } from '@/lib/config'
import { hasHonorPageQualification } from '@/lib/mock'

interface HonorQualificationResult {
  isQualified: boolean
  isLoading: boolean
  rank: number | null
  seasonId: number | null
}

export function useHonorQualification(): HonorQualificationResult {
  const supabase = useSupabaseContext()
  const { user, profile, isLoading: authLoading } = useAuthContext()
  const [isQualified, setIsQualified] = useState(false)
  const [rank, setRank] = useState<number | null>(null)
  const [seasonId, setSeasonId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchQualification = async () => {
      if (authLoading) return

      if (!user) {
        setIsQualified(false)
        setRank(null)
        setSeasonId(null)
        setIsLoading(false)
        return
      }

      if (profile?.role === 'admin' || profile?.role === 'superadmin') {
        setIsQualified(true)
        setIsLoading(false)
        return
      }

      if (USE_MOCK_DATA) {
        setIsQualified(hasHonorPageQualification(user.id))
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase.rpc('get_user_rank_active_season', {
        p_user_id: user.id,
      })

      if (error) {
        console.error('헌정 자격 조회 실패:', error)
        setIsQualified(false)
        setIsLoading(false)
        return
      }

      const row = Array.isArray(data) ? data[0] : null
      const userRank = row?.rank ?? null
      setRank(userRank)
      setSeasonId(row?.season_id ?? null)
      setIsQualified(userRank !== null && userRank <= 3)
      setIsLoading(false)
    }

    fetchQualification()
  }, [authLoading, user, profile, supabase])

  return { isQualified, isLoading, rank, seasonId }
}

