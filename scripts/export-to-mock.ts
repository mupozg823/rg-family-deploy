/**
 * Database Export Script
 * 현재 Supabase DB 데이터를 Mock 데이터 형식으로 추출합니다.
 *
 * 사용법:
 *   npx tsx scripts/export-to-mock.ts
 *   npm run db:export
 *
 * 출력:
 *   scripts/exported-mock-data.ts (생성됨)
 */

import { config } from 'dotenv'
import { resolve } from 'path'
import { writeFileSync } from 'fs'

// Load .env file
config({ path: resolve(process.cwd(), '.env') })
config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/types/database'

// ============================================
// Environment Check
// ============================================
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ 환경변수가 설정되지 않았습니다.')
  console.error('   NEXT_PUBLIC_SUPABASE_URL 와 SUPABASE_SERVICE_ROLE_KEY 가 필요합니다.')
  process.exit(1)
}

const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// ============================================
// Export Functions
// ============================================

type TableName = 'profiles' | 'organization' | 'seasons' | 'vip_rewards' | 'posts' | 'comments' | 'donations' | 'vip_images' | 'signatures' | 'schedules' | 'timeline_events' | 'notices' | 'media_content' | 'live_status' | 'banners' | 'tribute_guestbook'

async function fetchTable<T>(tableName: TableName): Promise<T[]> {
  console.log(`📥 Fetching ${tableName}...`)
  const { data, error } = await supabase.from(tableName).select('*')

  if (error) {
    console.error(`❌ Failed to fetch ${tableName}: ${error.message}`)
    return []
  }

  console.log(`   ✅ ${data?.length || 0} rows`)
  return (data || []) as T[]
}

function formatData(data: unknown): string {
  return JSON.stringify(data, null, 2)
    .replace(/"([^"]+)":/g, '$1:') // Remove quotes from keys
    .replace(/"/g, "'") // Use single quotes for strings
}

async function main() {
  console.log('')
  console.log('========================================')
  console.log('  RG Family - DB Export to Mock Data   ')
  console.log('========================================')
  console.log('')
  console.log(`Source: ${SUPABASE_URL}`)
  console.log('')

  // Fetch all tables
  const seasons = await fetchTable('seasons')
  const organization = await fetchTable('organization')
  const notices = await fetchTable('notices')
  const timelineEvents = await fetchTable('timeline_events')
  const mediaContent = await fetchTable('media_content')
  const liveStatus = await fetchTable('live_status')
  const banners = await fetchTable('banners')
  const signatures = await fetchTable('signatures')
  const schedules = await fetchTable('schedules')
  const profiles = await fetchTable('profiles')
  const donations = await fetchTable('donations')

  // Generate TypeScript file
  const output = `/**
 * Exported Mock Data from Supabase
 * Generated at: ${new Date().toISOString()}
 * Source: ${SUPABASE_URL}
 *
 * 이 파일을 src/lib/mock/ 폴더의 각 파일에 복사하여 사용하세요.
 */

// ============================================
// Seasons (${seasons.length} rows)
// ============================================
export const exportedSeasons = ${JSON.stringify(seasons, null, 2)};

// ============================================
// Organization (${organization.length} rows)
// ============================================
export const exportedOrganization = ${JSON.stringify(organization, null, 2)};

// ============================================
// Notices (${notices.length} rows)
// ============================================
export const exportedNotices = ${JSON.stringify(notices, null, 2)};

// ============================================
// Timeline Events (${timelineEvents.length} rows)
// ============================================
export const exportedTimelineEvents = ${JSON.stringify(timelineEvents, null, 2)};

// ============================================
// Media Content (${mediaContent.length} rows)
// ============================================
export const exportedMediaContent = ${JSON.stringify(mediaContent, null, 2)};

// ============================================
// Live Status (${liveStatus.length} rows)
// ============================================
export const exportedLiveStatus = ${JSON.stringify(liveStatus, null, 2)};

// ============================================
// Banners (${banners.length} rows)
// ============================================
export const exportedBanners = ${JSON.stringify(banners, null, 2)};

// ============================================
// Signatures (${signatures.length} rows)
// ============================================
export const exportedSignatures = ${JSON.stringify(signatures, null, 2)};

// ============================================
// Schedules (${schedules.length} rows)
// ============================================
export const exportedSchedules = ${JSON.stringify(schedules, null, 2)};

// ============================================
// Profiles (${profiles.length} rows)
// ============================================
export const exportedProfiles = ${JSON.stringify(profiles, null, 2)};

// ============================================
// Donations (${donations.length} rows)
// ============================================
export const exportedDonations = ${JSON.stringify(donations, null, 2)};
`

  // 날짜 형식: YYYY-MM-DD
  const today = new Date().toISOString().split('T')[0]
  const outputPath = resolve(process.cwd(), `scripts/backup-${today}-supabase-data.ts`)
  writeFileSync(outputPath, output, 'utf-8')

  console.log('')
  console.log('========================================')
  console.log(`✅ 데이터 추출 완료!`)
  console.log(`📄 출력 파일: ${outputPath}`)
  console.log('========================================')
  console.log('')
  console.log('다음 단계:')
  console.log(`1. ${outputPath} 파일을 확인하세요`)
  console.log('2. 필요한 데이터를 src/lib/mock/ 폴더에 복사하세요')
  console.log('')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
