/**
 * Database Seeding Script
 * Mock 데이터를 실제 Supabase DB에 시딩합니다.
 *
 * 사용법:
 *   npx tsx scripts/seed-database.ts
 *   npm run db:seed
 *
 * 환경변수 필요:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY (RLS 우회를 위해 service role key 필요)
 */

import { config } from 'dotenv'
import { resolve } from 'path'

// Load .env file
config({ path: resolve(process.cwd(), '.env') })
config({ path: resolve(process.cwd(), '.env.local') })

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/types/database'

// ============================================
// Mock Data Imports
// ============================================
import { mockSeasons } from '../src/lib/mock/seasons'
import { mockOrganization } from '../src/lib/mock/organization'
import { mockNotices } from '../src/lib/mock/notices'
import { mockTimelineEvents } from '../src/lib/mock/timeline'
import { mockMediaContent } from '../src/lib/mock/media'
import { mockLiveStatus } from '../src/lib/mock/live-status'
import { mockBanners } from '../src/lib/mock/banners'
import { mockSignatures } from '../src/lib/mock/signatures'
import { mockSchedules } from '../src/lib/mock/schedules'

// ============================================
// Environment Check
// ============================================
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
  console.error('❌ 환경변수가 설정되지 않았습니다.')
  console.error('   NEXT_PUBLIC_SUPABASE_URL 와 SUPABASE_SERVICE_ROLE_KEY 가 필요합니다.')
  console.error('')
  console.error('   .env 파일에 다음을 추가하세요:')
  console.error('   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key')
  process.exit(1)
}

// Service Role Client (RLS 우회)
const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// ============================================
// Utility Functions
// ============================================
function log(message: string) {
  console.log(`[${new Date().toISOString()}] ${message}`)
}

function success(message: string) {
  console.log(`✅ ${message}`)
}

function error(message: string) {
  console.error(`❌ ${message}`)
}

type TableName = 'profiles' | 'organization' | 'seasons' | 'vip_rewards' | 'posts' | 'comments' | 'donations' | 'vip_images' | 'signatures' | 'schedules' | 'timeline_events' | 'notices' | 'media_content' | 'live_status' | 'banners' | 'tribute_guestbook'

async function clearTable(tableName: TableName) {
  log(`Clearing table: ${tableName}`)
  const { error: err } = await supabase.from(tableName).delete().neq('id', -999999 as never)
  if (err) {
    error(`Failed to clear ${tableName}: ${err.message}`)
    return false
  }
  success(`Cleared ${tableName}`)
  return true
}

// ============================================
// Seeding Functions
// ============================================

async function seedSeasons() {
  log('Seeding seasons...')

  const seasonsToInsert = mockSeasons.map(({ id, ...season }) => ({
    ...season,
  }))

  const { data, error: err } = await supabase
    .from('seasons')
    .upsert(mockSeasons, { onConflict: 'id' })
    .select()

  if (err) {
    error(`Failed to seed seasons: ${err.message}`)
    return false
  }

  success(`Seeded ${mockSeasons.length} seasons`)
  return true
}

async function seedOrganization() {
  log('Seeding organization...')

  // parent_id 관계를 위해 id를 유지하면서 삽입
  const orgToInsert = mockOrganization.map((org) => ({
    id: org.id,
    unit: org.unit,
    profile_id: org.profile_id,
    name: org.name,
    role: org.role,
    position_order: org.position_order,
    parent_id: org.parent_id,
    image_url: org.image_url,
    social_links: org.social_links,
    is_live: org.is_live,
    is_active: org.is_active,
    created_at: org.created_at,
  }))

  // 먼저 parent_id가 없는 것들 삽입
  const rootMembers = orgToInsert.filter((o) => o.parent_id === null)
  const childMembers = orgToInsert.filter((o) => o.parent_id !== null)

  const { error: rootErr } = await supabase
    .from('organization')
    .upsert(rootMembers, { onConflict: 'id' })

  if (rootErr) {
    error(`Failed to seed root organization: ${rootErr.message}`)
    return false
  }

  const { error: childErr } = await supabase
    .from('organization')
    .upsert(childMembers, { onConflict: 'id' })

  if (childErr) {
    error(`Failed to seed child organization: ${childErr.message}`)
    return false
  }

  success(`Seeded ${mockOrganization.length} organization members`)
  return true
}

async function seedNotices() {
  log('Seeding notices...')

  const noticesToInsert = mockNotices.map((notice) => ({
    id: notice.id,
    title: notice.title,
    content: notice.content,
    category: notice.category,
    thumbnail_url: notice.thumbnail_url,
    is_pinned: notice.is_pinned,
    view_count: notice.view_count,
    author_id: notice.author_id,
    created_at: notice.created_at,
    updated_at: notice.updated_at,
  }))

  const { error: err } = await supabase
    .from('notices')
    .upsert(noticesToInsert, { onConflict: 'id' })

  if (err) {
    error(`Failed to seed notices: ${err.message}`)
    return false
  }

  success(`Seeded ${mockNotices.length} notices`)
  return true
}

async function seedTimelineEvents() {
  log('Seeding timeline events...')

  const eventsToInsert = mockTimelineEvents.map((event) => ({
    id: event.id,
    event_date: event.event_date,
    title: event.title,
    description: event.description,
    image_url: event.image_url,
    category: event.category,
    season_id: event.season_id,
    order_index: event.order_index,
    created_at: event.created_at,
  }))

  const { error: err } = await supabase
    .from('timeline_events')
    .upsert(eventsToInsert, { onConflict: 'id' })

  if (err) {
    error(`Failed to seed timeline events: ${err.message}`)
    return false
  }

  success(`Seeded ${mockTimelineEvents.length} timeline events`)
  return true
}

async function seedMediaContent() {
  log('Seeding media content...')

  const mediaToInsert = mockMediaContent.map((media) => ({
    id: media.id,
    content_type: media.content_type,
    title: media.title,
    description: media.description,
    thumbnail_url: media.thumbnail_url,
    video_url: media.video_url,
    unit: media.unit,
    duration: media.duration,
    view_count: media.view_count,
    is_featured: media.is_featured,
    created_at: media.created_at,
  }))

  const { error: err } = await supabase
    .from('media_content')
    .upsert(mediaToInsert, { onConflict: 'id' })

  if (err) {
    error(`Failed to seed media content: ${err.message}`)
    return false
  }

  success(`Seeded ${mockMediaContent.length} media content items`)
  return true
}

async function seedLiveStatus() {
  log('Seeding live status...')

  const liveToInsert = mockLiveStatus.map((live) => ({
    id: live.id,
    member_id: live.member_id,
    platform: live.platform,
    stream_url: live.stream_url,
    thumbnail_url: live.thumbnail_url,
    is_live: live.is_live,
    viewer_count: live.viewer_count,
    last_checked: live.last_checked,
  }))

  const { error: err } = await supabase
    .from('live_status')
    .upsert(liveToInsert, { onConflict: 'id' })

  if (err) {
    error(`Failed to seed live status: ${err.message}`)
    return false
  }

  success(`Seeded ${mockLiveStatus.length} live status entries`)
  return true
}

async function seedBanners() {
  log('Seeding banners...')

  // MockBanner 타입을 DB 스키마에 맞게 변환
  const bannersToInsert = mockBanners.map((banner) => ({
    id: banner.id,
    title: banner.title,
    image_url: banner.memberImageUrl || banner.imageUrl || '',
    link_url: banner.linkUrl,
    display_order: banner.displayOrder,
    is_active: banner.isActive,
  }))

  const { error: err } = await supabase
    .from('banners')
    .upsert(bannersToInsert, { onConflict: 'id' })

  if (err) {
    error(`Failed to seed banners: ${err.message}`)
    return false
  }

  success(`Seeded ${mockBanners.length} banners`)
  return true
}

async function seedSignatures() {
  log('Seeding signatures...')

  // mockSignatures가 존재하는 경우에만 시딩
  if (!mockSignatures || mockSignatures.length === 0) {
    log('No signatures to seed')
    return true
  }

  const sigsToInsert = mockSignatures.map((sig: {
    id: number
    title: string
    description?: string | null
    unit: 'excel' | 'crew'
    member_name: string
    media_type: 'video' | 'image' | 'gif'
    media_url: string
    thumbnail_url?: string | null
    tags?: string[] | null
    view_count?: number
    is_featured?: boolean
    created_at?: string
  }) => ({
    id: sig.id,
    title: sig.title,
    description: sig.description,
    unit: sig.unit,
    member_name: sig.member_name,
    media_type: sig.media_type,
    media_url: sig.media_url,
    thumbnail_url: sig.thumbnail_url,
    tags: sig.tags,
    view_count: sig.view_count || 0,
    is_featured: sig.is_featured || false,
    created_at: sig.created_at,
  }))

  const { error: err } = await supabase
    .from('signatures')
    .upsert(sigsToInsert, { onConflict: 'id' })

  if (err) {
    error(`Failed to seed signatures: ${err.message}`)
    return false
  }

  success(`Seeded ${mockSignatures.length} signatures`)
  return true
}

async function seedSchedules() {
  log('Seeding schedules...')

  if (!mockSchedules || mockSchedules.length === 0) {
    log('No schedules to seed')
    return true
  }

  const schedulesToInsert = mockSchedules.map((sched) => ({
    id: sched.id,
    title: sched.title,
    description: sched.description,
    unit: sched.unit,
    event_type: sched.event_type,
    start_datetime: sched.start_datetime,
    end_datetime: sched.end_datetime,
    location: sched.location,
    is_all_day: sched.is_all_day,
    color: sched.color,
    created_by: sched.created_by,
    created_at: sched.created_at,
  }))

  const { error: err } = await supabase
    .from('schedules')
    .upsert(schedulesToInsert, { onConflict: 'id' })

  if (err) {
    error(`Failed to seed schedules: ${err.message}`)
    return false
  }

  success(`Seeded ${mockSchedules.length} schedules`)
  return true
}

// ============================================
// Main Execution
// ============================================

async function main() {
  console.log('')
  console.log('========================================')
  console.log('  RG Family - Database Seeding Script  ')
  console.log('========================================')
  console.log('')
  console.log(`Target: ${SUPABASE_URL}`)
  console.log('')

  const args = process.argv.slice(2)
  const shouldClear = args.includes('--clear') || args.includes('-c')

  if (shouldClear) {
    console.log('🗑️  --clear 옵션: 기존 데이터를 삭제합니다...')
    console.log('')

    // 외래키 의존성 순서대로 삭제 (자식 먼저)
    await clearTable('live_status')
    await clearTable('media_content')
    await clearTable('timeline_events')
    await clearTable('notices')
    await clearTable('signatures')
    await clearTable('schedules')
    await clearTable('banners')
    await clearTable('organization')
    await clearTable('seasons')

    console.log('')
  }

  console.log('📥 Mock 데이터 시딩 시작...')
  console.log('')

  // 외래키 의존성 순서대로 삽입 (부모 먼저)
  let allSuccess = true

  allSuccess = (await seedSeasons()) && allSuccess
  allSuccess = (await seedOrganization()) && allSuccess
  allSuccess = (await seedNotices()) && allSuccess
  allSuccess = (await seedTimelineEvents()) && allSuccess
  allSuccess = (await seedMediaContent()) && allSuccess
  allSuccess = (await seedLiveStatus()) && allSuccess
  allSuccess = (await seedBanners()) && allSuccess
  allSuccess = (await seedSignatures()) && allSuccess
  allSuccess = (await seedSchedules()) && allSuccess

  console.log('')
  console.log('========================================')

  if (allSuccess) {
    console.log('✅ 모든 데이터 시딩 완료!')
  } else {
    console.log('⚠️  일부 데이터 시딩 실패. 위 로그를 확인하세요.')
  }

  console.log('========================================')
  console.log('')
}

main().catch((err) => {
  console.error('Fatal error:', err)
  process.exit(1)
})
