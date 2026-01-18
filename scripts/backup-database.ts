/**
 * Supabase 데이터베이스 백업 스크립트
 *
 * 사용법:
 *   npx ts-node --esm scripts/backup-database.ts
 *   npx tsx scripts/backup-database.ts
 *
 * 환경변수:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY (또는 NEXT_PUBLIC_SUPABASE_ANON_KEY)
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// 환경변수 로드
import dotenv from 'dotenv'
dotenv.config({ path: path.join(__dirname, '..', '.env.local') })
dotenv.config({ path: path.join(__dirname, '..', '.env') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase 환경변수가 설정되지 않았습니다.')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// 백업할 테이블 목록 (순서 중요: FK 의존성 고려)
const TABLES = [
  'profiles',
  'seasons',
  'organization',
  'donations',
  'vip_rewards',
  'vip_images',
  'signatures',
  'signature_videos',
  'schedules',
  'timeline_events',
  'notices',
  'posts',
  'comments',
  'media_content',
  'live_status',
  'banners',
  'tribute_guestbook',
]

interface BackupData {
  exported_at: string
  supabase_url: string
  tables: Record<string, unknown[]>
}

async function backupTable(tableName: string): Promise<unknown[]> {
  console.log(`  📦 ${tableName}...`)

  const { data, error } = await supabase
    .from(tableName)
    .select('*')
    .order('id', { ascending: true })

  if (error) {
    console.error(`    ⚠️ ${tableName} 백업 실패:`, error.message)
    return []
  }

  console.log(`    ✓ ${data?.length || 0}건`)
  return data || []
}

async function main() {
  console.log('🚀 RG Family 데이터베이스 백업 시작\n')
  console.log(`📍 Supabase URL: ${supabaseUrl}\n`)

  const backup: BackupData = {
    exported_at: new Date().toISOString(),
    supabase_url: supabaseUrl,
    tables: {},
  }

  for (const table of TABLES) {
    backup.tables[table] = await backupTable(table)
  }

  // 백업 파일 저장
  const timestamp = new Date().toISOString().slice(0, 10).replace(/-/g, '')
  const backupDir = path.join(__dirname, '..', 'supabase', 'backups')

  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true })
  }

  const backupPath = path.join(backupDir, `backup_${timestamp}.json`)
  fs.writeFileSync(backupPath, JSON.stringify(backup, null, 2))

  console.log(`\n✅ 백업 완료: ${backupPath}`)

  // 테이블별 통계
  console.log('\n📊 백업 통계:')
  for (const table of TABLES) {
    const count = backup.tables[table].length
    if (count > 0) {
      console.log(`  ${table}: ${count}건`)
    }
  }
}

main().catch(console.error)
