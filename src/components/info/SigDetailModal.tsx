'use client'

import { useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Play, ChevronLeft, ChevronRight, Calendar, User } from 'lucide-react'
import Image from 'next/image'
import type { SignatureData, SignatureVideo } from './SigGallery'
import { formatShortDate } from '@/lib/utils/format'
import styles from './SigDetailModal.module.css'

interface SigDetailModalProps {
  signature: SignatureData
  onClose: () => void
}

// YouTube URL을 embed URL로 변환
function getEmbedUrl(url: string): string {
  if (!url) return ''

  // YouTube URL 패턴들 (watch, embed, shorts, live, youtu.be)
  const youtubeRegex = /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/|live\/)|youtu\.be\/)([a-zA-Z0-9_-]+)/
  const match = url.match(youtubeRegex)

  if (match) {
    return `https://www.youtube.com/embed/${match[1]}`
  }

  // YouTube URL에서 v= 파라미터 추출 (다른 파라미터가 있는 경우)
  const vParam = url.match(/[?&]v=([a-zA-Z0-9_-]+)/)
  if (vParam) {
    return `https://www.youtube.com/embed/${vParam[1]}`
  }

  // Vimeo URL 패턴
  const vimeoRegex = /vimeo\.com\/(?:video\/)?(\d+)/
  const vimeoMatch = url.match(vimeoRegex)

  if (vimeoMatch) {
    return `https://player.vimeo.com/video/${vimeoMatch[1]}`
  }

  // SOOP VOD URL - /player/VIDEO_ID/embed 형식으로 변환
  // vod.sooplive.co.kr/player/180619671 → vod.sooplive.co.kr/player/180619671/embed
  // vod.sooplive.co.kr/180619671 → vod.sooplive.co.kr/player/180619671/embed
  const soopVodRegex = /vod\.sooplive\.co\.kr\/(?:player\/)?(\d+)/
  const soopMatch = url.match(soopVodRegex)

  if (soopMatch && !url.includes('/embed')) {
    return `https://vod.sooplive.co.kr/player/${soopMatch[1]}/embed`
  }

  // 이미 embed URL이거나 다른 직접 URL인 경우 그대로 반환
  return url
}

// 플랫폼별 파라미터 추가
function getEmbedUrlWithParams(url: string): string {
  const embedUrl = getEmbedUrl(url)

  // YouTube: autoplay 및 UI 옵션
  if (embedUrl.includes('youtube.com/embed/')) {
    return `${embedUrl}?autoplay=1&modestbranding=1&rel=0`
  }

  // Vimeo: autoplay
  if (embedUrl.includes('player.vimeo.com/')) {
    return `${embedUrl}?autoplay=1`
  }

  // SOOP VOD: autoPlay=false로 시작 (사용자가 클릭해서 들어왔으니 바로 재생)
  if (embedUrl.includes('vod.sooplive.co.kr/')) {
    return `${embedUrl}?autoPlay=true`
  }

  return embedUrl
}

export default function SigDetailModal({ signature, onClose }: SigDetailModalProps) {
  const [selectedMemberIdx, setSelectedMemberIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(true)
  const tabsRef = useRef<HTMLDivElement>(null)

  const currentVideo = signature.videos[selectedMemberIdx]

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [onClose])

  // Keep playing when member changes
  useEffect(() => {
    setIsPlaying(true)
  }, [selectedMemberIdx])

  // Scroll tabs
  const scrollTabs = (direction: 'left' | 'right') => {
    if (tabsRef.current) {
      const scrollAmount = 200
      tabsRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      })
    }
  }

  // 영상이 없는 경우 처리
  if (!currentVideo || signature.videos.length === 0) {
    return (
      <motion.div
        className={styles.overlay}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className={styles.modal}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className={styles.header}>
            <div className={styles.titleSection}>
              <div className={styles.playIcon}>
                <Play size={16} fill="white" />
              </div>
              <h2 className={styles.title}>
                {signature.title} ({signature.sigNumber})
              </h2>
            </div>
            <button className={styles.closeBtn} onClick={onClose}>
              <X size={20} />
            </button>
          </div>
          <div className={styles.emptyState}>
            <p>등록된 영상이 없습니다.</p>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.modal}
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className={styles.header}>
          <div className={styles.titleSection}>
            <div className={styles.playIcon}>
              <Play size={16} fill="white" />
            </div>
            <h2 className={styles.title}>
              {signature.title} ({signature.sigNumber})
            </h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Member Tabs - cnine style */}
        <div className={styles.tabsContainer}>
          {signature.videos.length > 4 && (
            <button
              className={styles.tabsArrow}
              onClick={() => scrollTabs('left')}
            >
              <ChevronLeft size={16} />
            </button>
          )}

          <div className={styles.tabs} ref={tabsRef}>
            {signature.videos.map((video, idx) => (
              <button
                key={video.id}
                className={`${styles.tab} ${idx === selectedMemberIdx ? styles.active : ''}`}
                onClick={() => setSelectedMemberIdx(idx)}
              >
                <div className={styles.tabAvatar}>
                  {video.memberImage ? (
                    <Image
                      src={video.memberImage}
                      alt={video.memberName}
                      width={32}
                      height={32}
                      className={styles.tabAvatarImage}
                      unoptimized
                    />
                  ) : (
                    <User size={16} />
                  )}
                </div>
                <div className={styles.tabInfo}>
                  <span className={styles.tabName}>{video.memberName}</span>
                  <span className={styles.tabDate}>
                    <Calendar size={10} />
                    {formatShortDate(video.createdAt)}
                  </span>
                </div>
              </button>
            ))}
          </div>

          {signature.videos.length > 4 && (
            <button
              className={styles.tabsArrow}
              onClick={() => scrollTabs('right')}
            >
              <ChevronRight size={16} />
            </button>
          )}
        </div>

        {/* Video Player */}
        <div className={styles.videoSection}>
          <div className={styles.videoWrapper}>
            {isPlaying ? (
              <iframe
                src={getEmbedUrlWithParams(currentVideo.videoUrl)}
                className={styles.video}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className={styles.videoThumbnail} onClick={() => setIsPlaying(true)}>
                {signature.thumbnailUrl ? (
                  <Image
                    src={signature.thumbnailUrl}
                    alt={`${signature.title} - ${currentVideo.memberName}`}
                    fill
                    className={styles.thumbnailImage}
                    unoptimized
                  />
                ) : (
                  <div className={styles.thumbnailPlaceholder}>
                    <span>{signature.sigNumber}</span>
                  </div>
                )}
                <div className={styles.playOverlay}>
                  <div className={styles.bigPlayButton}>
                    <Play size={48} fill="white" />
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
