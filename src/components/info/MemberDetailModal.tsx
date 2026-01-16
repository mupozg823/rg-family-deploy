'use client'

import { motion } from 'framer-motion'
import Image from 'next/image'
import { Radio, Youtube, Instagram, ExternalLink, X, Heart, Cake, Ruler, Droplets } from 'lucide-react'
import type { OrgMember } from '@/types/organization'
import styles from './MemberDetailModal.module.css'

interface MemberDetailModalProps {
  member: OrgMember
  onClose: () => void
}

export function MemberDetailModal({ member, onClose }: MemberDetailModalProps) {
  const profile = member.member_profile

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
                <Image src={member.image_url} alt={member.name} fill sizes="200px" className={styles.avatarImage} />
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
            {profile?.nickname && (
              <span className={styles.modalNickname}>&quot;{profile.nickname}&quot;</span>
            )}
            <span className={styles.modalRole}>{member.role}</span>
          </div>
        </div>

        {/* 개인정보 섹션 */}
        <div className={styles.profileSection}>
          <div className={styles.profileGrid}>
            {profile?.mbti && (
              <div className={styles.profileItem}>
                <span className={styles.profileLabel}>🧠 MBTI</span>
                <span className={styles.profileValue}>{profile.mbti}</span>
              </div>
            )}
            {profile?.age && (
              <div className={styles.profileItem}>
                <span className={styles.profileLabel}>🎂 나이</span>
                <span className={styles.profileValue}>{profile.age}세</span>
              </div>
            )}
            {profile?.height && (
              <div className={styles.profileItem}>
                <span className={styles.profileLabel}>📏 키</span>
                <span className={styles.profileValue}>{profile.height}cm</span>
              </div>
            )}
            {profile?.weight && (
              <div className={styles.profileItem}>
                <span className={styles.profileLabel}>⚖️ 몸무게</span>
                <span className={styles.profileValue}>{profile.weight}kg</span>
              </div>
            )}
            {profile?.birthday && (
              <div className={styles.profileItem}>
                <span className={styles.profileLabel}>🎈 생일</span>
                <span className={styles.profileValue}>{profile.birthday}</span>
              </div>
            )}
            {profile?.bloodType && (
              <div className={styles.profileItem}>
                <span className={styles.profileLabel}>💉 혈액형</span>
                <span className={styles.profileValue}>{profile.bloodType}형</span>
              </div>
            )}
            {profile?.hobby && (
              <div className={styles.profileItem}>
                <span className={styles.profileLabel}>🎮 취미</span>
                <span className={styles.profileValue}>{profile.hobby}</span>
              </div>
            )}
            {profile?.specialty && (
              <div className={styles.profileItem}>
                <span className={styles.profileLabel}>⭐ 특기</span>
                <span className={styles.profileValue}>{profile.specialty}</span>
              </div>
            )}
            {profile?.favoriteFood && (
              <div className={styles.profileItem}>
                <span className={styles.profileLabel}>🍕 좋아하는 음식</span>
                <span className={styles.profileValue}>{profile.favoriteFood}</span>
              </div>
            )}
          </div>

          {profile?.introduction && (
            <div className={styles.introduction}>
              <p>{profile.introduction}</p>
            </div>
          )}

          {/* 프로필 정보가 없을 때 */}
          {(!profile || Object.keys(profile).every(key => !profile[key as keyof typeof profile])) && (
            <div className={styles.noProfile}>
              <p>프로필 정보가 준비 중입니다</p>
            </div>
          )}
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
