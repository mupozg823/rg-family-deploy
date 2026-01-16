'use client'

import { motion } from 'framer-motion'
import { Sparkles, Video, Play } from 'lucide-react'
import type { HallOfFameHonor } from '@/lib/mock'
import styles from '../TributeSections.module.css'

interface TributeSignaturesSectionProps {
  donorName: string
  signatures?: HallOfFameHonor['exclusiveSignatures']
}

export default function TributeSignaturesSection({
  donorName,
  signatures,
}: TributeSignaturesSectionProps) {
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
