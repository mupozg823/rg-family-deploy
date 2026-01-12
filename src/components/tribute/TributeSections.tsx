'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import Image from 'next/image'
import {
  Heart,
  Play,
  Film,
  Crown,
  Video,
  ImageIcon,
  Download,
  Sparkles,
  Trophy,
  Upload,
  MessageSquare,
  Send,
  User,
} from 'lucide-react'
import type { HallOfFameHonor } from '@/lib/mock'
import { formatAmount } from '@/lib/utils/format'
import styles from './TributeSections.module.css'

interface TributeSectionsProps {
  honor: HallOfFameHonor
  allHonors: HallOfFameHonor[]
}

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
      <TributeGuestbookSection donorName={honor.donorName} />

      {/* Hall of Fame History */}
      {allHonors.length > 1 && (
        <TributeHistorySection honors={allHonors} />
      )}
    </div>
  )
}

// Message Section
function TributeMessageSection({ donorName, message }: { donorName: string; message: string }) {
  return (
    <motion.section
      className={styles.section}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className={styles.sectionHeader}>
        <Heart size={20} />
        <h2>TO. {donorName}</h2>
      </div>
      <div className={styles.messageCard}>
        <p>{message}</p>
      </div>
    </motion.section>
  )
}

// Video Section
function TributeVideoSection({
  donorName,
  videoUrl,
  isPlaying,
  onPlay,
}: {
  donorName: string
  videoUrl: string
  isPlaying: boolean
  onPlay: () => void
}) {
  return (
    <motion.section
      className={styles.section}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      <div className={styles.sectionHeader}>
        <Film size={20} />
        <h2>EXCLUSIVE VIDEO</h2>
      </div>
      <div className={styles.videoWrapper}>
        <div className={styles.videoInner}>
          <div className={styles.video} onClick={onPlay}>
            {isPlaying ? (
              <video
                src={videoUrl}
                controls
                autoPlay
                style={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            ) : (
              <>
                <div className={styles.videoBadge}>
                  <Crown size={12} />
                  TRIBUTE
                </div>
                <button className={styles.playBtn}>
                  <Play size={32} />
                </button>
                <span className={styles.videoLabel}>{donorName} 헌정 영상</span>
              </>
            )}
          </div>
        </div>
      </div>
    </motion.section>
  )
}

// Member Videos Section
function TributeMemberVideosSection({
  memberVideos,
}: {
  memberVideos?: HallOfFameHonor['memberVideos']
}) {
  if (memberVideos && memberVideos.length > 0) {
    return (
      <motion.section
        className={styles.section}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <div className={styles.sectionHeader}>
          <Play size={20} />
          <h2>멤버 감사 영상</h2>
        </div>
        <div className={styles.videosGrid}>
          {memberVideos.map((video) => (
            <div key={video.id} className={styles.videoCard}>
              <div className={styles.videoThumbnail}>
                <div className={styles.videoPlaceholder}>
                  <Play size={32} />
                </div>
                <div className={styles.unitBadge} data-unit={video.memberUnit}>
                  {video.memberUnit === 'excel' ? 'EXCEL' : 'CREW'}
                </div>
              </div>
              <div className={styles.videoInfo}>
                <h3>{video.memberName}</h3>
                <p>{video.message}</p>
              </div>
            </div>
          ))}
        </div>
      </motion.section>
    )
  }

  return (
    <motion.section
      className={styles.emptySection}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
    >
      <div className={styles.emptySectionContent}>
        <Video size={32} />
        <h3>멤버 감사 영상</h3>
        <p>아직 등록된 감사 영상이 없습니다</p>
        <span className={styles.adminHint}>Admin에서 영상을 업로드할 수 있습니다</span>
      </div>
    </motion.section>
  )
}

// Gallery Section
function TributeGallerySection({
  images,
  legacyImage,
}: {
  images?: string[]
  legacyImage?: string
}) {
  const hasImages = images && images.length > 0
  const hasLegacy = legacyImage && !hasImages

  if (hasImages) {
    return (
      <motion.section
        className={styles.section}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
      >
        <div className={styles.sectionHeader}>
          <ImageIcon size={20} />
          <h2>감사 포토</h2>
        </div>
        <div className={styles.galleryGrid}>
          {images.map((imageUrl, index) => (
            <a key={index} href={imageUrl} download className={styles.galleryCard}>
              <Image
                src={imageUrl}
                alt={`Tribute Photo ${index + 1}`}
                fill
                className={styles.galleryImage}
                unoptimized
              />
              <div className={styles.galleryOverlay}>
                <Download size={20} />
              </div>
            </a>
          ))}
        </div>
      </motion.section>
    )
  }

  if (hasLegacy) {
    return (
      <motion.section
        className={styles.section}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
      >
        <div className={styles.sectionHeader}>
          <ImageIcon size={20} />
          <h2>감사 포토</h2>
        </div>
        <div className={styles.galleryGrid}>
          <a href={legacyImage} download className={styles.galleryCard}>
            <Image
              src={legacyImage}
              alt="Exclusive Signature"
              fill
              className={styles.galleryImage}
              unoptimized
            />
            <div className={styles.galleryOverlay}>
              <Download size={20} />
            </div>
          </a>
        </div>
      </motion.section>
    )
  }

  return (
    <motion.section
      className={styles.emptySection}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
    >
      <div className={styles.emptySectionContent}>
        <ImageIcon size={32} />
        <h3>감사 포토</h3>
        <p>아직 등록된 감사 사진이 없습니다</p>
        <span className={styles.adminHint}>Admin에서 이미지를 업로드할 수 있습니다</span>
      </div>
    </motion.section>
  )
}

// Signatures Section
function TributeSignaturesSection({
  donorName,
  signatures,
}: {
  donorName: string
  signatures?: HallOfFameHonor['exclusiveSignatures']
}) {
  if (signatures && signatures.length > 0) {
    return (
      <motion.section
        className={styles.secretSection}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <div className={styles.secretHeader}>
          <div className={styles.secretBadge}>
            <Sparkles size={16} />
            <span>VIP SECRET</span>
          </div>
          <h2>VIP Exclusive Signature Reactions</h2>
          <p>{donorName}님을 위한 전용 시그니처 리액션</p>
        </div>
        <div className={styles.signaturesGrid}>
          {signatures.map((sig) => (
            <div key={sig.id} className={styles.signatureCard}>
              <div className={styles.signaturePlaceholder}>
                <Video size={24} />
                <span className={styles.signatureName}>{sig.memberName}</span>
                <Play size={16} className={styles.playIcon} />
              </div>
            </div>
          ))}
        </div>
      </motion.section>
    )
  }

  return (
    <motion.section
      className={styles.emptySection}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      <div className={styles.emptySectionContent}>
        <Sparkles size={32} />
        <h3>VIP 전용 시그니처</h3>
        <p>아직 등록된 시그니처 리액션이 없습니다</p>
        <span className={styles.adminHint}>Admin에서 시그니처를 업로드할 수 있습니다</span>
      </div>
    </motion.section>
  )
}

// Guestbook Section (Placeholder)
function TributeGuestbookSection({ donorName }: { donorName: string }) {
  // Sample guestbook entries for placeholder display
  const sampleEntries = [
    { id: 1, author: '린아', message: '항상 응원해주셔서 감사해요! 💖', date: '2026.01.10' },
    { id: 2, author: '엑셀부', message: '최고의 후원자님!', date: '2026.01.08' },
    { id: 3, author: '크루부', message: '앞으로도 함께해요~', date: '2026.01.05' },
  ]

  return (
    <motion.section
      className={styles.guestbookSection}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
    >
      <div className={styles.sectionHeader}>
        <MessageSquare size={20} />
        <h2>{donorName}님의 방명록</h2>
      </div>

      {/* Guestbook Entries */}
      <div className={styles.guestbookList}>
        {sampleEntries.map((entry) => (
          <div key={entry.id} className={styles.guestbookEntry}>
            <div className={styles.guestbookAvatar}>
              <User size={16} />
            </div>
            <div className={styles.guestbookContent}>
              <div className={styles.guestbookMeta}>
                <span className={styles.guestbookAuthor}>{entry.author}</span>
                <span className={styles.guestbookDate}>{entry.date}</span>
              </div>
              <p className={styles.guestbookMessage}>{entry.message}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Guestbook Input (Placeholder) */}
      <div className={styles.guestbookInputWrapper}>
        <div className={styles.guestbookInput}>
          <input
            type="text"
            placeholder="축하 메시지를 남겨주세요..."
            disabled
          />
          <button className={styles.guestbookSendBtn} disabled>
            <Send size={18} />
          </button>
        </div>
        <span className={styles.guestbookHint}>
          로그인 후 메시지를 남길 수 있습니다
        </span>
      </div>
    </motion.section>
  )
}

// History Section
function TributeHistorySection({ honors }: { honors: HallOfFameHonor[] }) {
  return (
    <motion.section
      className={styles.section}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
    >
      <div className={styles.sectionHeader}>
        <Trophy size={20} />
        <h2>명예의 전당 기록</h2>
      </div>
      <div className={styles.historyList}>
        {honors.map((honor) => (
          <div key={honor.id} className={styles.historyItem}>
            <span className={styles.historyDate}>
              {honor.honorType === 'season_top3'
                ? `${honor.seasonName} TOP ${honor.rank}`
                : honor.episodeName}
            </span>
            <span className={styles.historyAmount}>{formatAmount(honor.amount)}</span>
          </div>
        ))}
      </div>
    </motion.section>
  )
}
