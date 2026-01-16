'use client'

import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import styles from '../TributeSections.module.css'

interface TributeMessageSectionProps {
  donorName: string
  message: string
}

export default function TributeMessageSection({ donorName, message }: TributeMessageSectionProps) {
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
