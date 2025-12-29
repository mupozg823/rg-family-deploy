'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import { X, Eye, User, Tag } from 'lucide-react'
import Image from 'next/image'
import type { SignatureItem } from '@/types/common'
import styles from './SigVideoModal.module.css'

interface SigVideoModalProps {
  signature: SignatureItem
  onClose: () => void
}

export default function SigVideoModal({ signature, onClose }: SigVideoModalProps) {
  // ESC 키로 닫기
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    document.body.style.overflow = 'hidden'

    return () => {
      window.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = ''
    }
  }, [onClose])

  const renderMedia = () => {
    if (signature.mediaType === 'video') {
      return (
        <video
          src={signature.mediaUrl}
          controls
          autoPlay
          className={styles.video}
        />
      )
    } else if (signature.mediaType === 'gif') {
      return (
        <Image
          src={signature.mediaUrl}
          alt={signature.title}
          fill
          className={styles.gif}
          unoptimized
        />
      )
    } else {
      return (
        <Image
          src={signature.mediaUrl}
          alt={signature.title}
          fill
          className={styles.image}
        />
      )
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
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button onClick={onClose} className={styles.closeButton}>
          <X size={24} />
        </button>

        {/* Media */}
        <div className={styles.mediaContainer}>
          {renderMedia()}
        </div>

        {/* Info */}
        <div className={styles.info}>
          <div className={styles.header}>
            <span
              className={styles.unitBadge}
              data-unit={signature.unit}
            >
              {signature.unit === 'excel' ? '엑셀부' : '크루부'}
            </span>
            <span className={styles.mediaType}>
              {signature.mediaType === 'video' ? '영상' : signature.mediaType === 'gif' ? 'GIF' : '이미지'}
            </span>
          </div>

          <h2 className={styles.title}>{signature.title}</h2>

          <div className={styles.meta}>
            <span className={styles.metaItem}>
              <User size={16} />
              {signature.memberName}
            </span>
            <span className={styles.metaItem}>
              <Eye size={16} />
              {signature.viewCount.toLocaleString()}
            </span>
          </div>

          {signature.description && (
            <p className={styles.description}>{signature.description}</p>
          )}

          {signature.tags && signature.tags.length > 0 && (
            <div className={styles.tags}>
              <Tag size={16} />
              {signature.tags.map((tag) => (
                <span key={tag} className={styles.tag}>
                  #{tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}
