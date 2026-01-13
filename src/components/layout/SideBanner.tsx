'use client'

import Image from 'next/image'
import styles from './SideBanner.module.css'

interface SideBannerProps {
  /** 배너 이미지 경로 */
  src: string
  /** 대체 텍스트 */
  alt: string
  /** 클릭 시 이동할 링크 (선택적) */
  href?: string
  /** 추가 클래스명 */
  className?: string
}

/**
 * SideBanner - 사이드바 광고/프로모션 배너 컴포넌트
 *
 * 특징:
 * - 세로 긴 이미지 최적화 (스크롤 가능)
 * - 선택적 외부 링크 지원
 * - 호버 효과 (glow)
 * - 반응형: 900px 이하에서 자동 숨김 (PageLayout에서 처리)
 */
export default function SideBanner({
  src,
  alt,
  href,
  className = '',
}: SideBannerProps) {
  const content = (
    <div className={`${styles.bannerContainer} ${className}`}>
      <div className={styles.imageWrapper}>
        <Image
          src={src}
          alt={alt}
          width={180}
          height={540}
          sizes="(max-width: 900px) 0px, 180px"
          className={styles.image}
          priority={false}
          style={{ width: '100%', height: 'auto', objectFit: 'contain' }}
        />
      </div>
    </div>
  )

  if (href) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className={styles.link}
      >
        {content}
      </a>
    )
  }

  return content
}
