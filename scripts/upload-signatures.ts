/**
 * 시그니처 이미지 Supabase 업로드 스크립트
 * 사용법: npx tsx scripts/upload-signatures.ts
 */

import { createClient } from '@supabase/supabase-js'
import * as fs from 'fs'
import * as path from 'path'

const SUPABASE_URL = 'https://titqtnobfapyjvairgqy.supabase.co'
const SUPABASE_SERVICE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRpdHF0bm9iZmFweWp2YWlyZ3F5Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2ODc5NDQyNSwiZXhwIjoyMDg0MzcwNDI1fQ.M6mlPiqgRruYCd4jXBcIOsYIhtqgvJmGmzg6l3KakwU'

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: { persistSession: false }
})

const SIGNATURES_FOLDER = '/Users/bagjaeseog/Downloads/RG시그 리뉴얼/rg 리뉴얼 시그 최종'
const BUCKET_NAME = 'signatures'

interface SignatureFile {
  fileName: string
  sigNumber: number
  filePath: string
  extension: string
}

// 파일 이름에서 시그니처 번호 추출
function extractSigNumber(fileName: string): number | null {
  // "10000 수정16mb.gif" -> 10000
  // "1000.png" -> 1000
  const match = fileName.match(/^(\d+)/)
  return match ? parseInt(match[1], 10) : null
}

// 시그니처 제목 생성
function generateTitle(sigNumber: number): string {
  // 특별한 번호들은 별도 처리
  const specialTitles: Record<number, string> = {
    666: '악마의 시그',
    777: '럭키 세븐',
    1000: '천 시그',
    2000: '이천 시그',
    2222: '투투투투',
    3000: '삼천 시그',
    3333: '쓰리쓰리',
    4444: '사사사사',
    5000: '오천 시그',
    6666: '육육육육',
    7000: '칠천 시그',
    7777: '럭키 세븐세븐',
    9999: '구구구구',
    10000: '만 시그',
    30000: '삼만 시그',
    50000: '오만 시그',
    70000: '칠만 시그',
    100000: '십만 시그',
    200000: '이십만 시그',
    300000: '삼십만 시그',
  }

  return specialTitles[sigNumber] || `시그니처 ${sigNumber}`
}

async function ensureBucketExists() {
  console.log('📦 Storage 버킷 확인 중...')

  const { data: buckets, error } = await supabase.storage.listBuckets()

  if (error) {
    console.error('버킷 목록 조회 실패:', error)
    return false
  }

  const exists = buckets?.some(b => b.name === BUCKET_NAME)

  if (!exists) {
    console.log('📦 signatures 버킷 생성 중...')
    const { error: createError } = await supabase.storage.createBucket(BUCKET_NAME, {
      public: true,
      fileSizeLimit: 52428800 // 50MB
    })

    if (createError) {
      console.error('버킷 생성 실패:', createError)
      return false
    }
    console.log('✅ signatures 버킷 생성 완료')
  } else {
    console.log('✅ signatures 버킷 존재 확인')
  }

  return true
}

async function uploadFile(file: SignatureFile): Promise<string | null> {
  const fileBuffer = fs.readFileSync(file.filePath)
  const storagePath = `${file.sigNumber}.${file.extension}`

  const contentType = file.extension === 'gif' ? 'image/gif' : 'image/png'

  const { data, error } = await supabase.storage
    .from(BUCKET_NAME)
    .upload(storagePath, fileBuffer, {
      contentType,
      upsert: true
    })

  if (error) {
    console.error(`  ❌ 업로드 실패 [${file.sigNumber}]:`, error.message)
    return null
  }

  // Public URL 생성
  const { data: urlData } = supabase.storage
    .from(BUCKET_NAME)
    .getPublicUrl(storagePath)

  return urlData.publicUrl
}

async function upsertSignature(sigNumber: number, thumbnailUrl: string) {
  const title = generateTitle(sigNumber)

  // 기존 레코드 확인
  const { data: existing } = await supabase
    .from('signatures')
    .select('id')
    .eq('sig_number', sigNumber)
    .single()

  if (existing) {
    // 업데이트
    const { error } = await supabase
      .from('signatures')
      .update({ thumbnail_url: thumbnailUrl })
      .eq('sig_number', sigNumber)

    if (error) {
      console.error(`  ⚠️ DB 업데이트 실패 [${sigNumber}]:`, error.message)
      return false
    }
  } else {
    // 새로 삽입
    const { error } = await supabase
      .from('signatures')
      .insert({
        sig_number: sigNumber,
        title,
        description: '',
        thumbnail_url: thumbnailUrl,
        unit: 'excel', // 기본값
        is_group: false
      })

    if (error) {
      console.error(`  ⚠️ DB 삽입 실패 [${sigNumber}]:`, error.message)
      return false
    }
  }

  return true
}

async function main() {
  console.log('🚀 시그니처 이미지 업로드 시작')
  console.log(`📁 소스 폴더: ${SIGNATURES_FOLDER}`)
  console.log('')

  // 버킷 확인/생성
  const bucketReady = await ensureBucketExists()
  if (!bucketReady) {
    console.error('❌ 버킷 준비 실패. 종료합니다.')
    process.exit(1)
  }

  // 파일 목록 읽기
  const files = fs.readdirSync(SIGNATURES_FOLDER)
  const signatureFiles: SignatureFile[] = []

  for (const fileName of files) {
    const sigNumber = extractSigNumber(fileName)
    if (sigNumber === null) continue

    const extension = fileName.toLowerCase().endsWith('.gif') ? 'gif' : 'png'

    signatureFiles.push({
      fileName,
      sigNumber,
      filePath: path.join(SIGNATURES_FOLDER, fileName),
      extension
    })
  }

  // 번호순 정렬
  signatureFiles.sort((a, b) => a.sigNumber - b.sigNumber)

  console.log(`📊 총 ${signatureFiles.length}개 시그니처 파일 발견`)
  console.log('')

  let successCount = 0
  let failCount = 0

  for (let i = 0; i < signatureFiles.length; i++) {
    const file = signatureFiles[i]
    const progress = `[${i + 1}/${signatureFiles.length}]`

    process.stdout.write(`${progress} 시그 ${file.sigNumber} 업로드 중...`)

    const publicUrl = await uploadFile(file)

    if (publicUrl) {
      const dbSuccess = await upsertSignature(file.sigNumber, publicUrl)
      if (dbSuccess) {
        console.log(' ✅')
        successCount++
      } else {
        console.log(' ⚠️ (업로드됨, DB 실패)')
        failCount++
      }
    } else {
      console.log(' ❌')
      failCount++
    }

    // Rate limiting 방지
    await new Promise(resolve => setTimeout(resolve, 100))
  }

  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`✅ 성공: ${successCount}개`)
  console.log(`❌ 실패: ${failCount}개`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main().catch(console.error)
