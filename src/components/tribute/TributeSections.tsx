'use client'

import { useState } from 'react'
import type { HallOfFameHonor } from '@/lib/mock'
import {
  TributeMessageSection,
  TributeVideoSection,
  TributeMemberVideosSection,
  TributeGallerySection,
  TributeSignaturesSection,
  TributeGuestbookSection,
  TributeHistorySection,
} from './sections'
import styles from './TributeSections.module.css'

interface TributeSectionsProps {
  honor: HallOfFameHonor
  allHonors: HallOfFameHonor[]
}

/**
 * TributeSections - 헌정 페이지 섹션 조합 컴포넌트
 *
 * 개별 섹션 컴포넌트는 ./sections/ 폴더에서 관리
 * 이 컴포넌트는 섹션들을 조합하는 역할만 담당
 */
export default function TributeSections({ honor, allHonors }: TributeSectionsProps) {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false)

  return (
    <div className={styles.container}>
      {/* Thank You Message */}
      {honor.tributeMessage && (
        <TributeMessageSection
          donorName={honor.donorName}
          message={honor.tributeMessage}
        />
      )}

      {/* Exclusive Video */}
      {honor.tributeVideoUrl && (
        <TributeVideoSection
          donorName={honor.donorName}
          videoUrl={honor.tributeVideoUrl}
          isPlaying={isVideoPlaying}
          onPlay={() => setIsVideoPlaying(true)}
        />
      )}

      {/* Member Videos */}
      <TributeMemberVideosSection memberVideos={honor.memberVideos} />

      {/* Photo Gallery */}
      <TributeGallerySection
        images={honor.tributeImages}
        legacyImage={honor.tributeImageUrl}
      />

      {/* VIP Signatures */}
      <TributeSignaturesSection
        donorName={honor.donorName}
        signatures={honor.exclusiveSignatures}
      />

      {/* Guestbook Section */}
      <TributeGuestbookSection donorName={honor.donorName} tributeUserId={honor.donorId} />

      {/* Hall of Fame History */}
      {allHonors.length > 1 && (
        <TributeHistorySection honors={allHonors} />
      )}
    </div>
  )
}
