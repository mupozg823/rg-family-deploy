'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Eye, Star } from 'lucide-react'
import Image from 'next/image'
import type { SignatureItem } from '@/types/common'
import styles from './SigCard.module.css'

interface SigCardProps {
  signature: SignatureItem
  onClick: () => void
}

export default function SigCard({ signature, onClick }: SigCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  return (
    <motion.div
      className={styles.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ y: -8 }}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      {/* Thumbnail */}
      <div className={styles.thumbnail}>
        {signature.thumbnailUrl ? (
          <Image
            src={signature.thumbnailUrl}
            alt={signature.title}
            fill
            className={styles.image}
          />
        ) : (
          <div className={styles.placeholder}>
            <Play size={48} />
          </div>
        )}

        {/* Overlay */}
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
        >
          <div className={styles.playButton}>
            <Play size={32} fill="white" />
          </div>
        </motion.div>

        {/* Featured Badge */}
        {signature.isFeatured && (
          <div className={styles.featuredBadge}>
            <Star size={12} fill="currentColor" />
            <span>추천</span>
          </div>
        )}

        {/* Media Type Badge */}
        <div className={styles.mediaTypeBadge}>
          {signature.mediaType === 'video' ? '영상' : signature.mediaType === 'gif' ? 'GIF' : '이미지'}
        </div>
      </div>

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.meta}>
          <span
            className={styles.unitBadge}
            data-unit={signature.unit}
          >
            {signature.unit === 'excel' ? '엑셀부' : '크루부'}
          </span>
          <span className={styles.memberName}>{signature.memberName}</span>
        </div>

        <h3 className={styles.title}>{signature.title}</h3>

        {signature.description && (
          <p className={styles.description}>{signature.description}</p>
        )}

        {/* Tags */}
        {signature.tags && signature.tags.length > 0 && (
          <div className={styles.tags}>
            {signature.tags.slice(0, 3).map((tag) => (
              <span key={tag} className={styles.tag}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats */}
        <div className={styles.stats}>
          <span className={styles.stat}>
            <Eye size={14} />
            {signature.viewCount.toLocaleString()}
          </span>
        </div>
      </div>
    </motion.div>
  )
}
