'use server'

import { createServerSupabaseClient } from '@/lib/supabase/server'

/**
 * 닉네임으로 이메일 찾기
 * 보안상 이메일 일부만 마스킹하여 반환
 */
export async function findEmailByNickname(nickname: string): Promise<{
  data: { email: string } | null
  error: string | null
}> {
  if (!nickname || nickname.trim().length < 2) {
    return { data: null, error: '닉네임을 2자 이상 입력해주세요.' }
  }

  const supabase = await createServerSupabaseClient()

  // 닉네임으로 프로필 검색
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('email')
    .eq('nickname', nickname.trim())
    .single()

  if (error || !profile) {
    return { data: null, error: '해당 닉네임으로 등록된 계정을 찾을 수 없습니다.' }
  }

  if (!profile.email) {
    return { data: null, error: '이메일 정보가 없습니다.' }
  }

  // 이메일 마스킹 처리 (예: test@example.com → te**@ex*****.com)
  const maskedEmail = maskEmail(profile.email)

  return { data: { email: maskedEmail }, error: null }
}

/**
 * 이메일 마스킹
 * example@domain.com → ex****e@do****.com
 */
function maskEmail(email: string): string {
  const [localPart, domain] = email.split('@')

  if (!domain) return email

  // 로컬 파트 마스킹 (앞 2자 + ** + 마지막 1자)
  let maskedLocal = localPart
  if (localPart.length > 3) {
    maskedLocal = localPart.slice(0, 2) + '****' + localPart.slice(-1)
  } else if (localPart.length > 1) {
    maskedLocal = localPart[0] + '**'
  }

  // 도메인 마스킹 (앞 2자 + ****)
  const [domainName, tld] = domain.split('.')
  let maskedDomain = domain
  if (domainName && tld) {
    if (domainName.length > 2) {
      maskedDomain = domainName.slice(0, 2) + '****.' + tld
    }
  }

  return `${maskedLocal}@${maskedDomain}`
}
