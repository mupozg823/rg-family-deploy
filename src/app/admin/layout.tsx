'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Sidebar } from '@/components/admin'
import { useAuth } from '@/lib/hooks/useAuth'
import styles from './layout.module.css'

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { user, profile, isLoading } = useAuth()
  const router = useRouter()
  const [isAuthorized, setIsAuthorized] = useState(false)

  useEffect(() => {
    if (isLoading) return

    if (!user) {
      router.push('/login?redirect=/admin')
      return
    }

    // 관리자 권한 체크
    const allowedRoles = ['superadmin', 'admin', 'moderator']
    if (!profile || !allowedRoles.includes(profile.role)) {
      router.push('/')
      return
    }

    setIsAuthorized(true)
  }, [user, profile, isLoading, router])

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
