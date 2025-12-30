'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play } from 'lucide-react'
import Image from 'next/image'
import type { SignatureData } from '@/lib/mock/signatures'
import styles from './SigCard.module.css'

interface SigCardProps {
  signature: SignatureData
  onClick: () => void
}

export default function SigCard({ signature, onClick }: SigCardProps) {
  const [isHovered, setIsHovered] = useState(false)
  const [imageError, setImageError] = useState(false)

  return (
    <motion.div
      className={styles.card}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ scale: 1.02 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
    >
      {/* Thumbnail - Square aspect ratio */}
      <div className={styles.thumbnail}>
        {!imageError ? (
          <Image
            src={signature.thumbnailUrl}
            alt={signature.title}
            fill
            className={styles.image}
            onError={() => setImageError(true)}
          />
        ) : (
          <div className={styles.placeholder}>
            <span className={styles.placeholderNumber}>{signature.number}</span>
          </div>
        )}

        {/* Number Badge - cnine style */}
        <div className={styles.numberBadge}>
          <span className={styles.number}>{signature.number}</span>
        </div>

        {/* Play Button - always visible, positioned bottom-right */}
        <motion.div
          className={styles.playButton}
          animate={isHovered ? { scale: 1.1 } : { scale: 1 }}
        >
          <Play size={14} fill="white" />
        </motion.div>

        {/* Hover Overlay */}
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: isHovered ? 1 : 0 }}
          transition={{ duration: 0.2 }}
        />
      </div>

      {/* Info - Minimal */}
      <div className={styles.info}>
        <span className={styles.sigNumber}>{signature.number}</span>
        <span className={styles.title}>{signature.title}</span>
      </div>
    </motion.div>
  )
}
