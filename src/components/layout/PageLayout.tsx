'use client'

import { ReactNode } from 'react'
import styles from './PageLayout.module.css'

interface PageLayoutProps {
  children: ReactNode
  /** 사이드 배너 표시 여부 (기본: true) */
  showSideBanners?: boolean
  /** 왼쪽 배너 컨텐츠 */
  leftBanner?: ReactNode
  /** 오른쪽 배너 컨텐츠 */
  rightBanner?: ReactNode
  /** 전체 너비 사용 (배너 없이) */
  fullWidth?: boolean
  /** 추가 클래스명 */
  className?: string
}

/**
 * PageLayout - 사이드 배너 여백을 포함한 페이지 레이아웃
 *
 * 구조:
 * [Left Banner] [Main Content] [Right Banner]
 *
 * - 데스크톱: 양쪽 160px 배너 영역
 * - 태블릿: 양쪽 120px 배너 영역
 * - 모바일: 배너 숨김, 전체 너비 사용
 */
export default function PageLayout({
  children,
  showSideBanners = true,
  leftBanner,
  rightBanner,
  fullWidth = false,
  className = '',
}: PageLayoutProps) {
  if (fullWidth || !showSideBanners) {
    return (
      <div className={`${styles.wrapper} ${styles.fullWidth} ${className}`}>
        <main className={styles.mainFull}>{children}</main>
      </div>
    )
  }

  return (
    <div className={`${styles.wrapper} ${className}`}>
      {/* Left Banner Area */}
      <aside className={styles.sidebarLeft}>
        {leftBanner || (
          <div className={styles.bannerPlaceholder}>
            <span>AD</span>
          </div>
        )}
      </aside>

      {/* Main Content */}
      <main className={styles.main}>{children}</main>

      {/* Right Banner Area */}
      <aside className={styles.sidebarRight}>
        {rightBanner || (
          <div className={styles.bannerPlaceholder}>
            <span>AD</span>
          </div>
        )}
      </aside>
    </div>
  )
}
