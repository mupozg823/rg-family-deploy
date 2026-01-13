/**
 * Supabase Schedule Repository
 * 일정 데이터 관리
 */

import { SupabaseClient } from '@supabase/supabase-js'
import { IScheduleRepository } from '../types'
import type { Schedule } from '@/types/database'

export class SupabaseScheduleRepository implements IScheduleRepository {
  constructor(private supabase: SupabaseClient) {}

  async findByMonth(year: number, month: number): Promise<Schedule[]> {
    const startOfMonth = new Date(year, month, 1)
    const endOfMonth = new Date(year, month + 1, 0)

    const { data, error } = await this.supabase
      .from('schedules')
      .select('*')
      .gte('start_datetime', startOfMonth.toISOString())
      .lte('start_datetime', endOfMonth.toISOString())
      .order('start_datetime', { ascending: true })

    if (error) throw error
    return data || []
  }

  async findByMonthAndUnit(year: number, month: number, unit: string | null): Promise<Schedule[]> {
    const startOfMonth = new Date(year, month, 1)
    const endOfMonth = new Date(year, month + 1, 0)

    let query = this.supabase
      .from('schedules')
      .select('*')
      .gte('start_datetime', startOfMonth.toISOString())
      .lte('start_datetime', endOfMonth.toISOString())
      .order('start_datetime', { ascending: true })

    if (unit && unit !== 'all') {
      query = query.or(`unit.eq.${unit},unit.is.null`)
    }

    const { data, error } = await query

    if (error) throw error
    return data || []
  }
}
