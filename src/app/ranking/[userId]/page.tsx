'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import { Crown, ArrowLeft } from 'lucide-react'
import Footer from '@/components/Footer'
import {
  TributeGate,
  TributeAccessDenied,
  TributeNav,
  TributePageHero,
  TributeSections,
} from '@/components/tribute'
import { useTributeData, useContentProtection } from '@/lib/hooks'
import styles from './page.module.css'

export default function TributePage({ params }: { params: Promise<{ userId: string }> }) {
  const { userId } = use(params)
  const [showGate, setShowGate] = useState(true)

  const {
    hallOfFameData,
    primaryHonor,
    isLoading,
    authLoading,
    accessDenied,
  } = useTributeData({ userId })

  // VIP 콘텐츠 보호 (접근이 허용된 경우에만)
  useContentProtection({
    preventContextMenu: !accessDenied,
    preventDrag: !accessDenied,
    preventSelect: !accessDenied,
    preventKeyboardShortcuts: !accessDenied,
    preventPrint: !accessDenied,
    showConsoleWarning: !accessDenied,
  })

  // 2.5초 후 자동으로 게이트 열림
  useEffect(() => {
    if (accessDenied) return
    const timer = setTimeout(() => {
      setShowGate(false)
    }, 2500)
    return () => clearTimeout(timer)
  }, [accessDenied])

  // 인증 로딩 중
  if (authLoading) {
    return (
      <div className={styles.main}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>인증 확인 중...</span>
        </div>
        <Footer />
      </div>
    )
  }

  // 접근 거부
  if (accessDenied) {
    return (
      <div className={styles.main}>
        <TributeAccessDenied reason={accessDenied} />
        <Footer />
      </div>
    )
  }

  // 로딩 중
  if (isLoading) {
    return (
      <div className={styles.main}>
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>헌정 페이지 확인 중...</span>
        </div>
        <Footer />
      </div>
    )
  }

  // 데이터 없음
  if (!hallOfFameData || hallOfFameData.length === 0 || !primaryHonor) {
    return (
      <div className={styles.main}>
        <div className={styles.empty}>
          <Crown size={48} />
          <p>헌정 페이지 정보를 찾을 수 없습니다</p>
          <Link href="/ranking" className={styles.backBtn}>
            <ArrowLeft size={18} />
            <span>랭킹으로 돌아가기</span>
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  return (
    <div className={styles.main}>
      {/* Entrance Gate Animation */}
      <TributeGate
        isVisible={showGate}
        donorName={primaryHonor.donorName}
        rank={primaryHonor.rank}
        onClose={() => setShowGate(false)}
      />

      {/* Navigation Bar */}
      <TributeNav />

      {/* Hero */}
      <TributePageHero honor={primaryHonor} />

      {/* Content Sections */}
      <TributeSections honor={primaryHonor} allHonors={hallOfFameData} />

      <Footer />
    </div>
  )
}
