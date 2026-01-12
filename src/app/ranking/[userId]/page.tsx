'use client'

import { useEffect, use } from 'react'
import { useRouter } from 'next/navigation'
import { getTributePageUrl } from '@/lib/utils/hash'
import styles from './page.module.css'

/**
 * Legacy Tribute Page - Hash URL로 리다이렉트
 *
 * /ranking/[userId] 접근 시 /ranking/tribute/[hash]로 자동 리다이렉트
 * URL에서 userId 노출을 방지
 */
export default function TributePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params)
  const router = useRouter()

  useEffect(() => {
    // 해시 URL로 리다이렉트
    const hashUrl = getTributePageUrl(userId)
    router.replace(hashUrl)
  }, [userId, router])

  return (
    <div className={styles.main}>
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <span>페이지 이동 중...</span>
      </div>
    </div>
  )
}
