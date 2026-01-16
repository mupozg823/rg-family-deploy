'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { X, Play, ChevronLeft, ChevronRight, Calendar } from 'lucide-react'
import Image from 'next/image'
import type { SignatureData, SignatureVideo } from '@/lib/mock/signatures'
import styles from './SigDetailModal.module.css'

interface SigDetailModalProps {
  signature: SignatureData
  onClose: () => void
}

export default function SigDetailModal({ signature, onClose }: SigDetailModalProps) {
  const [selectedMemberIdx, setSelectedMemberIdx] = useState(0)
  const [isPlaying, setIsPlaying] = useState(false)
  const tabsRef = useRef<HTMLDivElement>(null)
  const onCloseRef = useRef(onClose)

  // onClose 최신 값 유지 (메모리 누수 방지)
  useEffect(() => {
    onCloseRef.current = onClose
  }, [onClose])

  const currentVideo = signature.videos[selectedMemberIdx]

  // Handle escape key - ref 사용으로 리스너 재등록 방지
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCloseRef.current()
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [])

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
              {signature.title} ({signature.number})
            </h2>
          </div>
          <button className={styles.closeBtn} onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        {/* Member Tabs - cnine style */}
        <div className={styles.tabsContainer}>
          <button
            className={styles.tabsArrow}
            onClick={() => scrollTabs('left')}
          >
            <ChevronLeft size={16} />
          </button>

          <div className={styles.tabs} ref={tabsRef}>
            {signature.videos.map((video, idx) => (
              <button
                key={video.id}
                className={`${styles.tab} ${idx === selectedMemberIdx ? styles.active : ''}`}
                onClick={() => setSelectedMemberIdx(idx)}
              >
                <span className={styles.tabName}>{video.memberName}</span>
                <span className={styles.tabDate}>
                  <Calendar size={10} />
                  {video.date}
                </span>
              </button>
            ))}
          </div>

          <button
            className={styles.tabsArrow}
            onClick={() => scrollTabs('right')}
          >
            <ChevronRight size={16} />
          </button>
        </div>

        {/* Video Player */}
        <div className={styles.videoSection}>
          <div className={styles.videoWrapper}>
            {isPlaying ? (
              <iframe
                src={`${currentVideo.videoUrl}?autoplay=1`}
                className={styles.video}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <div className={styles.videoThumbnail} onClick={() => setIsPlaying(true)}>
                <Image
                  src={currentVideo.thumbnailUrl}
                  alt={`${signature.title} - ${currentVideo.memberName}`}
                  fill
                  className={styles.thumbnailImage}
                />
                <div className={styles.playOverlay}>
                  <div className={styles.bigPlayButton}>
                    <Play size={48} fill="white" />
                  </div>
                </div>
                <div className={styles.duration}>{currentVideo.duration}</div>
              </div>
            )}
          </div>
        </div>

        {/* Related Videos Section */}
        <div className={styles.relatedSection}>
          <div className={styles.relatedHeader}>
            <span className={styles.relatedTitle}>
              {signature.title} ({signature.number}) {currentVideo.memberName}의 다른 영상
            </span>
            <span className={styles.relatedCount}>{signature.totalVideoCount}개</span>
          </div>

          <div className={styles.relatedVideos}>
            <button className={styles.relatedArrow}>
              <ChevronLeft size={16} />
            </button>

            <div className={styles.relatedList}>
              {signature.videos.map((video, idx) => (
                <div
                  key={video.id}
                  className={`${styles.relatedItem} ${idx === selectedMemberIdx ? styles.activeRelated : ''}`}
                  onClick={() => {
                    setSelectedMemberIdx(idx)
                    setIsPlaying(false)
                  }}
                >
                  <div className={styles.relatedThumbnail}>
                    <Image
                      src={video.thumbnailUrl}
                      alt={video.memberName}
                      fill
                      className={styles.relatedImage}
                    />
                    <div className={styles.relatedDate}>{video.date}</div>
                    <div className={styles.relatedDuration}>{video.duration}</div>
                    <div className={styles.relatedPlayIcon}>
                      <Play size={16} fill="white" />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <button className={styles.relatedArrow}>
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
