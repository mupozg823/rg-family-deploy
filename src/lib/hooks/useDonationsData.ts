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

      // Step 1: 전체 데이터 파싱 및 유효성 검사
      interface ParsedRow {
        rowNum: number
        donorName: string
        amount: number
        message: string
        seasonId: number
        createdAt: string
        dateOnly: string
        matchedProfileId: string | null
      }

      const parsedRows: ParsedRow[] = []

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

        parsedRows.push({
          rowNum,
          donorName,
          amount,
          message,
          seasonId,
          createdAt,
          dateOnly: createdAt.split('T')[0],
          matchedProfileId: matchedProfile?.id || null,
        })
      }

      if (parsedRows.length === 0) {
        return { success: 0, errors, skipped: 0, updated: 0 }
      }

      // Step 2: 배치로 기존 데이터 조회 (단일 쿼리)
      const uniqueDonorNames = [...new Set(parsedRows.map((r) => r.donorName))]
      const uniqueSeasonIds = [...new Set(parsedRows.map((r) => r.seasonId))]

      const { data: existingDonations } = await supabase
        .from('donations')
        .select('id, amount, donor_name, season_id, created_at')
        .in('donor_name', uniqueDonorNames)
        .in('season_id', uniqueSeasonIds)

      // 기존 데이터를 키(donor_name|season_id|dateOnly)로 맵핑
      const existingMap = new Map<string, { id: number; amount: number }>()
      existingDonations?.forEach((d) => {
        const dateOnly = d.created_at.split('T')[0]
        const key = `${d.donor_name}|${d.season_id}|${dateOnly}`
        existingMap.set(key, { id: d.id, amount: d.amount })
      })

      // Step 3: 배치 분류 (insert/update/skip)
      interface InsertItem {
        donor_id: string | null
        donor_name: string
        amount: number
        message: string | null
        season_id: number
        created_at: string
      }

      interface UpdateItem {
        id: number
        data: { amount: number; message: string | null; created_at?: string }
        profileId: string | null
        amountDiff: number
      }

      const toInsert: InsertItem[] = []
      const toUpdate: UpdateItem[] = []
      const profileTotals = new Map<string, number>()

      for (const row of parsedRows) {
        const key = `${row.donorName}|${row.seasonId}|${row.dateOnly}`
        const existing = existingMap.get(key)

        if (existing) {
          if (duplicateHandling === 'skip') {
            skippedCount++
            continue
          } else if (duplicateHandling === 'overwrite') {
            toUpdate.push({
              id: existing.id,
              data: {
                amount: row.amount,
                message: row.message || null,
                created_at: row.createdAt,
              },
              profileId: row.matchedProfileId,
              amountDiff: row.amount - existing.amount,
            })
          } else if (duplicateHandling === 'accumulate') {
            const newAmount = existing.amount + row.amount
            toUpdate.push({
              id: existing.id,
              data: {
                amount: newAmount,
                message: row.message ? `${existing.amount}+${row.amount}: ${row.message}` : null,
              },
              profileId: row.matchedProfileId,
              amountDiff: row.amount,
            })
          }
        } else {
          toInsert.push({
            donor_id: row.matchedProfileId,
            donor_name: row.donorName,
            amount: row.amount,
            message: row.message || null,
            season_id: row.seasonId,
            created_at: row.createdAt,
          })

          // 신규 등록 시 프로필 총 후원금 집계
          if (row.matchedProfileId) {
            profileTotals.set(
              row.matchedProfileId,
              (profileTotals.get(row.matchedProfileId) || 0) + row.amount
            )
          }
        }
      }

      // Step 4: 배치 Insert (100개씩 청크)
      const BATCH_SIZE = 100
      for (let i = 0; i < toInsert.length; i += BATCH_SIZE) {
        const batch = toInsert.slice(i, i + BATCH_SIZE)
        const { error } = await supabase.from('donations').insert(batch)
        if (error) {
          errors.push(`배치 ${Math.floor(i / BATCH_SIZE) + 1}: ${error.message}`)
        } else {
          successCount += batch.length
        }
      }

      // Step 5: 개별 Update (Supabase는 배치 update 미지원)
      for (const item of toUpdate) {
        const { error } = await supabase
          .from('donations')
          .update(item.data)
          .eq('id', item.id)

        if (error) {
          errors.push(`업데이트 실패 (ID: ${item.id}): ${error.message}`)
        } else {
          updatedCount++

          // 업데이트 시 프로필 총 후원금 집계
          if (item.profileId && item.amountDiff !== 0) {
            profileTotals.set(
              item.profileId,
              (profileTotals.get(item.profileId) || 0) + item.amountDiff
            )
          }
        }
      }

      // Step 6: 프로필별 총 후원금 배치 업데이트
      for (const [profileId, amount] of profileTotals) {
        if (amount !== 0) {
          await supabase.rpc('update_donation_total', {
            p_donor_id: profileId,
            p_amount: amount,
          })
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
