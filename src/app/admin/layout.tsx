'use client'

import { useEffect, useMemo } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/admin'
import { useAuthContext } from '@/lib/context'
import styles from './layout.module.css'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile, isLoading } = useAuthContext()
  const router = useRouter()

  // 관리자 권한 체크 (useMemo로 계산)
  const isAuthorized = useMemo(() => {
    if (isLoading || !user) return false
    const allowedRoles = ['superadmin', 'admin', 'moderator']
    return profile && allowedRoles.includes(profile.role)
  }, [user, profile, isLoading])

  // 리다이렉트 처리
  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.push('/login?redirect=/admin')
    } else if (!isAuthorized) {
      router.push('/')
    }
  }, [user, isAuthorized, isLoading, router])

  if (isLoading || !isAuthorized) {
    return (
      <div className={styles.loadingWrapper}>
        <div className={styles.spinner} />
        <span>권한을 확인하는 중...</span>
      </div>
    )
  }

  return (
    <div className={styles.layout}>
      <Sidebar />
      <main className={styles.main}>
        <div className={styles.content}>
          {children}
        </div>
      </main>
    </div>
  )
}
