'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Eye, Star, Film, Image as ImageIcon, Sparkles } from 'lucide-react'
import Image from 'next/image'
import type { SignatureItem } from '@/types/common'
import styles from './SigCard.module.css'

interface SigCardProps {
  signature: SignatureItem
  onClick: () => void
}

export default function SigCard({ signature, onClick }: SigCardProps) {
  const [isHovered, setIsHovered] = useState(false)

  const getMediaIcon = () => {
    switch (signature.mediaType) {
      case 'video':
        return <Film size={14} />
      case 'gif':
        return <Sparkles size={14} />
      default:
        return <ImageIcon size={14} />
    }
  }

  const isPlayable = signature.mediaType === 'video' || signature.mediaType === 'gif'

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

        {/* Always visible mini play button for playable content */}
        {isPlayable && !isHovered && (
          <div className={styles.miniPlayButton}>
            <Play size={16} fill="white" />
          </div>
        )}

        {/* Hover Overlay */}
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
        >
          <motion.div
            className={`${styles.playButton} ${isPlayable ? styles.playButtonPulse : ''}`}
            animate={isHovered && isPlayable ? {
              scale: [1, 1.1, 1],
              boxShadow: [
                '0 0 30px rgba(253, 104, 186, 0.5)',
                '0 0 50px rgba(253, 104, 186, 0.8)',
                '0 0 30px rgba(253, 104, 186, 0.5)'
              ]
            } : {}}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            <Play size={32} fill="white" />
          </motion.div>
          <span className={styles.playText}>
            {signature.mediaType === 'video' ? '영상 보기' : signature.mediaType === 'gif' ? 'GIF 보기' : '이미지 보기'}
          </span>
        </motion.div>

        {/* Featured Badge */}
        {signature.isFeatured && (
          <div className={styles.featuredBadge}>
            <Star size={12} fill="currentColor" />
            <span>추천</span>
          </div>
        )}

        {/* Media Type Badge */}
        <div className={`${styles.mediaTypeBadge} ${styles[`mediaType${signature.mediaType.charAt(0).toUpperCase() + signature.mediaType.slice(1)}`]}`}>
          {getMediaIcon()}
          <span>{signature.mediaType === 'video' ? '영상' : signature.mediaType === 'gif' ? 'GIF' : '이미지'}</span>
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
