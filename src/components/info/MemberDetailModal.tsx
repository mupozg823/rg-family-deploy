'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Image from 'next/image'
import { Radio, Youtube, Instagram, ExternalLink, X, ChevronDown, User, Camera } from 'lucide-react'
import type { OrgMember } from './MemberCard'
import styles from './MemberDetailModal.module.css'

// PandaTV ID로 URL 생성
const getPandaTvUrl = (id: string) => `https://www.pandalive.co.kr/play/${id}`

interface MemberDetailModalProps {
  member: OrgMember
  onClose: () => void
}

// 신호탄 단가 포맷팅
const formatSignalPrice = (price: number) => {
  return `${price.toLocaleString()} 하트`
}

// 프로필 정보가 있는지 체크
const hasProfileInfo = (member: OrgMember) => {
  const info = member.profile_info
  if (!info) return false
  return !!(info.mbti || info.blood_type || info.height || info.weight || info.birthday || info.signal_price)
}

export function MemberDetailModal({ member, onClose }: MemberDetailModalProps) {
  const [isPledgeExpanded, setIsPledgeExpanded] = useState(false)

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
          <div className={`${styles.modalAvatarWrapper} ${member.is_live ? styles.isLive : ''}`}>
            {member.is_live && (
              <span className={styles.modalLiveBadge}>
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

        {/* 프로필 정보 섹션 */}
        {hasProfileInfo(member) && (
          <div className={styles.modalProfile}>
            <h3 className={styles.modalSectionTitle}>
              <User size={16} />
              프로필 정보
            </h3>
            <div className={styles.profileGrid}>
              {member.profile_info?.mbti && (
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>MBTI</span>
                  <span className={styles.profileValue}>{member.profile_info.mbti}</span>
                </div>
              )}
              {member.profile_info?.blood_type && (
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>혈액형</span>
                  <span className={styles.profileValue}>{member.profile_info.blood_type}</span>
                </div>
              )}
              {member.profile_info?.height && (
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>키</span>
                  <span className={styles.profileValue}>{member.profile_info.height}</span>
                </div>
              )}
              {member.profile_info?.weight && (
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>몸무게</span>
                  <span className={styles.profileValue}>{member.profile_info.weight}</span>
                </div>
              )}
              {member.profile_info?.birthday && (
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>생일</span>
                  <span className={styles.profileValue}>{member.profile_info.birthday}</span>
                </div>
              )}
              {member.profile_info?.signal_price && (
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>신호탄 단가</span>
                  <span className={styles.profileValue}>{formatSignalPrice(member.profile_info.signal_price)}</span>
                </div>
              )}
              {member.profile_info?.photo_delivery !== undefined && (
                <div className={styles.profileItem}>
                  <span className={styles.profileLabel}>
                    <Camera size={12} />
                    사진 전달
                  </span>
                  <span className={`${styles.profileValue} ${member.profile_info.photo_delivery ? styles.photoYes : styles.photoNo}`}>
                    {member.profile_info.photo_delivery ? 'O' : 'X'}
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 직급 공약 섹션 */}
        {member.profile_info?.position_pledge && (
          <div className={styles.pledgeSection}>
            <button
              className={styles.pledgeHeader}
              onClick={() => setIsPledgeExpanded(!isPledgeExpanded)}
            >
              <h3 className={styles.modalSectionTitle}>
                🎯 직급 공약
              </h3>
              <ChevronDown
                size={20}
                className={`${styles.pledgeChevron} ${isPledgeExpanded ? styles.expanded : ''}`}
              />
            </button>
            <AnimatePresence>
              {isPledgeExpanded && (
                <motion.div
                  className={styles.pledgeContent}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <p className={styles.pledgeText}>
                    {member.profile_info.position_pledge}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}

        {member.social_links && Object.keys(member.social_links).length > 0 && (
          <div className={styles.modalSocial}>
            <h3 className={styles.modalSectionTitle}>소셜 링크</h3>
            <div className={styles.modalSocialGrid}>
              {member.social_links.pandatv && (
                <a href={getPandaTvUrl(member.social_links.pandatv)} target="_blank" rel="noopener noreferrer" className={styles.modalSocialLink}>
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
          <a href={getPandaTvUrl(member.social_links.pandatv)} target="_blank" rel="noopener noreferrer" className={styles.watchButton}>
            <Radio size={18} />
            지금 방송 보러가기
          </a>
        )}
      </motion.div>
    </motion.div>
  )
}
