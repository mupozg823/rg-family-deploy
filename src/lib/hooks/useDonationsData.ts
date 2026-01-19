'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSupabaseContext } from '@/lib/context'
import type { JoinedProfile, JoinedSeason } from '@/types/common'

export interface DonationItem {
  id: number
  donorId: string | null
  donorName: string
  amount: number
  message: string
  seasonId: number
  seasonName: string
  createdAt: string
}

export interface SeasonItem {
  id: number
  name: string
}

export interface ProfileItem {
  id: string
  nickname: string
}

export type DuplicateHandling = 'skip' | 'overwrite' | 'accumulate'

export interface UploadCsvOptions {
  duplicateHandling?: DuplicateHandling
}

export interface UploadCsvResult {
  success: number
  errors: string[]
  skipped?: number
  updated?: number
}

export interface UseDonationsDataReturn {
  donations: DonationItem[]
  seasons: SeasonItem[]
  profiles: ProfileItem[]
  isLoading: boolean
  refetch: () => Promise<void>
  addDonation: (donation: Partial<DonationItem>) => Promise<boolean>
  updateDonation: (donation: Partial<DonationItem>) => Promise<boolean>
  deleteDonation: (id: number) => Promise<boolean>
  uploadCsv: (data: { [key: string]: string }[], options?: UploadCsvOptions) => Promise<UploadCsvResult>
}

export function useDonationsData(): UseDonationsDataReturn {
  const supabase = useSupabaseContext()
  const [donations, setDonations] = useState<DonationItem[]>([])
  const [seasons, setSeasons] = useState<SeasonItem[]>([])
  const [profiles, setProfiles] = useState<ProfileItem[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchData = useCallback(async () => {
    setIsLoading(true)

    // 후원 목록
    const { data: donationsData } = await supabase
      .from('donations')
      .select('*, profiles!donor_id(nickname), seasons(name)')
      .order('created_at', { ascending: false })

    // 시즌 목록
    const { data: seasonsData } = await supabase
      .from('seasons')
      .select('id, name')
      .order('start_date', { ascending: false })

    // 프로필 목록
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, nickname')
      .order('nickname')

    setDonations(
      (donationsData || []).map((d) => {
        const profile = d.profiles as JoinedProfile | null
        const season = d.seasons as JoinedSeason | null
        return {
          id: d.id,
          donorId: d.donor_id,
          donorName: profile?.nickname || '익명',
          amount: d.amount,
          message: d.message || '',
          seasonId: d.season_id,
          seasonName: season?.name || '',
          createdAt: d.created_at,
        }
      })
    )

    setSeasons(seasonsData || [])
    setProfiles(profilesData || [])
    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const addDonation = useCallback(
    async (donation: Partial<DonationItem>): Promise<boolean> => {
      if (!donation.donorId || !donation.amount) {
        return false
      }

      const selectedProfile = profiles.find((p) => p.id === donation.donorId)
      const donorName = selectedProfile?.nickname || '익명'

      const { error } = await supabase.from('donations').insert({
        donor_id: donation.donorId,
        donor_name: donorName,
        amount: donation.amount,
        message: donation.message,
        season_id: donation.seasonId,
      })

      if (error) {
        console.error('후원 등록 실패:', error)
        return false
      }

      // 프로필 총 후원금 업데이트
      if (donation.donorId) {
        await supabase.rpc('update_donation_total', {
          p_donor_id: donation.donorId,
          p_amount: donation.amount,
        })
      }

      await fetchData()
      return true
    },
    [supabase, profiles, fetchData]
  )

  const updateDonation = useCallback(
    async (donation: Partial<DonationItem>): Promise<boolean> => {
      if (!donation.id) return false

      const { error } = await supabase
        .from('donations')
        .update({
          amount: donation.amount,
          message: donation.message,
          season_id: donation.seasonId,
        })
        .eq('id', donation.id)

      if (error) {
        console.error('후원 수정 실패:', error)
        return false
      }

      await fetchData()
      return true
    },
    [supabase, fetchData]
  )

  const deleteDonation = useCallback(
    async (id: number): Promise<boolean> => {
      const { error } = await supabase.from('donations').delete().eq('id', id)

      if (error) {
        console.error('후원 삭제 실패:', error)
        return false
      }

      await fetchData()
      return true
    },
    [supabase, fetchData]
  )

  const uploadCsv = useCallback(
    async (
      data: { [key: string]: string }[],
      options: UploadCsvOptions = {}
    ): Promise<UploadCsvResult> => {
      const { duplicateHandling = 'skip' } = options
      const errors: string[] = []
      let successCount = 0
      let skippedCount = 0
      let updatedCount = 0

      const activeSeason = seasons[0]
      if (!activeSeason) {
        return { success: 0, errors: ['활성 시즌이 없습니다. 먼저 시즌을 생성해주세요.'], skipped: 0, updated: 0 }
      }

      for (let i = 0; i < data.length; i++) {
        const row = data[i]
        const rowNum = i + 2

        const donorId = row['ID'] || row['donor_id'] || row['id'] || ''
        const donorName = donorId || row['donor_name'] || ''
        const amountStr = row['하트'] || row['amount'] || row['hearts'] || '0'
        const message = row['내용'] || row['message'] || ''
        const dateStr = row['일시'] || row['date'] || ''

        if (!donorName) {
          errors.push(`행 ${rowNum}: 후원자 ID/이름이 필요합니다.`)
          continue
        }

        const amount = parseInt(amountStr.replace(/,/g, ''), 10)
        if (isNaN(amount) || amount <= 0) {
          errors.push(`행 ${rowNum}: 유효하지 않은 하트 수입니다.`)
          continue
        }

        let seasonId = activeSeason.id
        if (row.season_id) {
          const parsedSeasonId = parseInt(row.season_id, 10)
          if (!isNaN(parsedSeasonId) && seasons.some((s) => s.id === parsedSeasonId)) {
            seasonId = parsedSeasonId
          }
        }

        const matchedProfile = profiles.find(
          (p) => p.nickname.toLowerCase() === donorName.toLowerCase()
        )

        let createdAt = new Date().toISOString()
        if (dateStr) {
          try {
            const [datePart, timePart] = dateStr.split(' ')
            const [yy, mm, dd] = datePart.split('.')
            const year = parseInt(yy, 10) + 2000
            createdAt = new Date(`${year}-${mm}-${dd}T${timePart}Z`).toISOString()
          } catch {
            // 파싱 실패 시 현재 시간 사용
          }
        }

        try {
          // 중복 체크: 동일 후원자명 + 동일 시즌 + 동일 날짜(일 기준)
          const dateOnly = createdAt.split('T')[0]
          const { data: existingDonations } = await supabase
            .from('donations')
            .select('id, amount')
            .eq('donor_name', donorName)
            .eq('season_id', seasonId)
            .gte('created_at', `${dateOnly}T00:00:00Z`)
            .lt('created_at', `${dateOnly}T23:59:59Z`)

          const existingDonation = existingDonations?.[0]

          if (existingDonation) {
            // 중복 데이터 발견
            if (duplicateHandling === 'skip') {
              skippedCount++
              continue
            } else if (duplicateHandling === 'overwrite') {
              // 기존 데이터 덮어쓰기
              const { error } = await supabase
                .from('donations')
                .update({
                  amount: amount,
                  message: message || null,
                  created_at: createdAt,
                })
                .eq('id', existingDonation.id)

              if (error) {
                errors.push(`행 ${rowNum}: ${error.message}`)
              } else {
                updatedCount++

                // 프로필 총 후원금 조정 (기존 금액 차감 후 새 금액 추가)
                if (matchedProfile) {
                  const amountDiff = amount - existingDonation.amount
                  if (amountDiff !== 0) {
                    await supabase.rpc('update_donation_total', {
                      p_donor_id: matchedProfile.id,
                      p_amount: amountDiff,
                    })
                  }
                }
              }
              continue
            } else if (duplicateHandling === 'accumulate') {
              // 기존 데이터에 금액 누적
              const newAmount = existingDonation.amount + amount
              const { error } = await supabase
                .from('donations')
                .update({
                  amount: newAmount,
                  message: message ? `${existingDonation.amount}+${amount}: ${message}` : null,
                })
                .eq('id', existingDonation.id)

              if (error) {
                errors.push(`행 ${rowNum}: ${error.message}`)
              } else {
                updatedCount++

                // 프로필 총 후원금에 추가 금액만 반영
                if (matchedProfile) {
                  await supabase.rpc('update_donation_total', {
                    p_donor_id: matchedProfile.id,
                    p_amount: amount,
                  })
                }
              }
              continue
            }
          }

          // 신규 등록
          const { error } = await supabase.from('donations').insert({
            donor_id: matchedProfile?.id || null,
            donor_name: donorName,
            amount: amount,
            message: message || null,
            season_id: seasonId,
            created_at: createdAt,
          })

          if (error) {
            errors.push(`행 ${rowNum}: ${error.message}`)
          } else {
            successCount++

            if (matchedProfile) {
              await supabase.rpc('update_donation_total', {
                p_donor_id: matchedProfile.id,
                p_amount: amount,
              })
            }
          }
        } catch {
          errors.push(`행 ${rowNum}: 데이터베이스 오류`)
        }
      }

      if (successCount > 0 || updatedCount > 0) {
        await fetchData()
      }

      return { success: successCount, errors, skipped: skippedCount, updated: updatedCount }
    },
    [supabase, seasons, profiles, fetchData]
  )

  return {
    donations,
    seasons,
    profiles,
    isLoading,
    refetch: fetchData,
    addDonation,
    updateDonation,
    deleteDonation,
    uploadCsv,
  }
}
