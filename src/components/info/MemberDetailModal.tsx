'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Radio, Youtube, Instagram, ExternalLink, X } from 'lucide-react'
import type { OrgMember } from './MemberCard'
import styles from './MemberDetailModal.module.css'

interface MemberDetailModalProps {
  member: OrgMember
  onClose: () => void
}

export function MemberDetailModal({ member, onClose }: MemberDetailModalProps) {
  return (
    <motion.div
      className={styles.modalOverlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.modal}
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button className={styles.modalClose} onClick={onClose}>
          <X size={24} />
        </button>

        <div className={styles.modalHeader}>
          <div className={styles.modalAvatarWrapper}>
            {member.is_live && (
              <span className={styles.modalLiveBadge}>
                <Radio size={12} />
                LIVE
              </span>
            )}
            <div className={`${styles.modalAvatar} ${member.is_live ? styles.modalAvatarLive : ''}`}>
              {member.image_url ? (
                <Image src={member.image_url} alt={member.name} fill className={styles.avatarImage} />
              ) : (
                <div className={styles.modalAvatarPlaceholder}>
                  {member.name.charAt(0)}
                </div>
              )}
            </div>
          </div>

          <div className={styles.modalInfo}>
            <span className={styles.modalUnit} data-unit={member.unit}>
              {member.unit === 'excel' ? 'EXCEL UNIT' : 'CREW UNIT'}
            </span>
            <h2 className={styles.modalName}>{member.name}</h2>
            <span className={styles.modalRole}>{member.role}</span>
          </div>
        </div>

        <div className={styles.modalStatus}>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>상태</span>
            <span className={`${styles.statusValue} ${member.is_live ? styles.statusLive : ''}`}>
              {member.is_live ? '🔴 방송 중' : '⚫ 오프라인'}
            </span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>소속</span>
            <span className={styles.statusValue}>
              {member.unit === 'excel' ? '한국 엑셀방송' : '크루 유닛'}
            </span>
          </div>
        </div>

        {member.social_links && Object.keys(member.social_links).length > 0 && (
          <div className={styles.modalSocial}>
            <h3 className={styles.modalSectionTitle}>소셜 링크</h3>
            <div className={styles.modalSocialGrid}>
              {member.social_links.pandatv && (
                <a href={member.social_links.pandatv} target="_blank" rel="noopener noreferrer" className={styles.modalSocialLink}>
                  <Radio size={20} />
                  <span>팬더티비</span>
                </a>
              )}
              {member.social_links.chzzk && (
                <a href={member.social_links.chzzk} target="_blank" rel="noopener noreferrer" className={styles.modalSocialLink}>
                  <ExternalLink size={20} />
                  <span>치지직</span>
                </a>
              )}
              {member.social_links.youtube && (
                <a href={member.social_links.youtube} target="_blank" rel="noopener noreferrer" className={styles.modalSocialLink}>
                  <Youtube size={20} />
                  <span>유튜브</span>
                </a>
              )}
              {member.social_links.instagram && (
                <a href={member.social_links.instagram} target="_blank" rel="noopener noreferrer" className={styles.modalSocialLink}>
                  <Instagram size={20} />
                  <span>인스타그램</span>
                </a>
              )}
            </div>
          </div>
        )}

        {member.is_live && member.social_links?.pandatv && (
          <a href={member.social_links.pandatv} target="_blank" rel="noopener noreferrer" className={styles.watchButton}>
            <Radio size={18} />
            지금 방송 보러가기
          </a>
        )}
      </motion.div>
    </motion.div>
  )
}
