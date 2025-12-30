"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useSupabase } from "@/lib/hooks/useSupabase";
import { mockOrganization } from "@/lib/mock/data";
import { USE_MOCK_DATA } from "@/lib/config";
import { Radio, Youtube, Instagram, ExternalLink, X, ArrowLeft } from "lucide-react";
import styles from "./page.module.css";

interface LiveMember {
  id: number;
  name: string;
  role: string;
  unit: 'excel' | 'crew';
  image_url: string | null;
  is_live: boolean;
  social_links?: {
    chzzk?: string;
    youtube?: string;
    instagram?: string;
    pandatv?: string;
  };
}

type UnitFilter = 'all' | 'excel' | 'crew';

export default function LivePage() {
  const supabase = useSupabase();
  const [members, setMembers] = useState<LiveMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<LiveMember | null>(null);
  const [filter, setFilter] = useState<'all' | 'live'>('all');
  const [unitFilter, setUnitFilter] = useState<UnitFilter>('all');

  const fetchMembers = useCallback(async () => {
    setIsLoading(true);

    if (USE_MOCK_DATA) {
      const mockData = mockOrganization.map((m) => ({
        id: m.id,
        name: m.name,
        role: m.role,
        unit: m.unit,
        image_url: m.image_url,
        is_live: m.is_live,
        social_links: m.social_links,
      })) as LiveMember[];
      setMembers(mockData);
      setIsLoading(false);
      return;
    }

    const { data, error } = await supabase
      .from('organization')
      .select('*')
      .eq('is_active', true)
      .order('position_order', { ascending: true });

    if (error) {
      console.error('멤버 로드 실패:', error);
      setIsLoading(false);
      return;
    }

    setMembers(data as LiveMember[] || []);
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchMembers();

    if (USE_MOCK_DATA) return;

    // 실시간 구독
    const channel = supabase
      .channel('live_status_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'organization' },
        () => {
          fetchMembers();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, fetchMembers]);

  // Apply unit filter first
  const unitFilteredMembers = unitFilter === 'all'
    ? members
    : members.filter(m => m.unit === unitFilter);

  // Then apply live status filter
  const filteredMembers = filter === 'live'
    ? unitFilteredMembers.filter(m => m.is_live)
    : unitFilteredMembers;

  const liveCount = unitFilteredMembers.filter(m => m.is_live).length;
  const totalCount = unitFilteredMembers.length;

  return (
    <div className={styles.container}>
      {/* Back Link */}
      <Link href="/" className={styles.backLink}>
        <ArrowLeft size={20} />
        <span>메인으로</span>
      </Link>

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.titleWrapper}>
          <h1>현재 방송중</h1>
          <div className={styles.liveIndicator}>
            <span className={styles.liveDot} />
            <span className={styles.liveCount}>{liveCount}</span>
          </div>
        </div>
        <p>RG FAMILY 멤버 실시간 방송 현황</p>
      </header>

      {/* Unit Toggle */}
      <div className={styles.unitToggle}>
        <button
          className={`${styles.unitBtn} ${unitFilter === 'all' ? styles.active : ''}`}
          onClick={() => setUnitFilter('all')}
        >
          ALL
        </button>
        <button
          className={`${styles.unitBtn} ${unitFilter === 'excel' ? styles.active : ''}`}
          onClick={() => setUnitFilter('excel')}
        >
          EXCEL
        </button>
        <button
          className={`${styles.unitBtn} ${styles.crewBtn} ${unitFilter === 'crew' ? styles.active : ''}`}
          onClick={() => setUnitFilter('crew')}
        >
          CREW
        </button>
      </div>

      {/* Filter Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          전체 ({totalCount})
        </button>
        <button
          className={`${styles.tab} ${filter === 'live' ? styles.active : ''}`}
          onClick={() => setFilter('live')}
        >
          <span className={styles.tabLiveDot} />
          LIVE ({liveCount})
        </button>
      </div>

      {/* Content */}
      <div className={styles.content}>
        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <span>멤버 목록을 불러오는 중...</span>
          </div>
        ) : filteredMembers.length === 0 ? (
          <div className={styles.empty}>
            <Radio size={48} className={styles.emptyIcon} />
            <p>현재 라이브 중인 멤버가 없습니다</p>
          </div>
        ) : (
          <div className={styles.grid}>
            {filteredMembers.map((member, index) => (
              <motion.div
                key={member.id}
                className={styles.card}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                onClick={() => setSelectedMember(member)}
              >
                <div className={styles.avatarWrapper}>
                  {member.is_live && (
                    <span className={styles.liveBadge}>
                      <Radio size={10} />
                      LIVE
                    </span>
                  )}
                  <div className={`${styles.avatar} ${member.is_live ? styles.avatarLive : ''}`}>
                    {member.image_url ? (
                      <Image
                        src={member.image_url}
                        alt={member.name}
                        fill
                        className={styles.avatarImage}
                        unoptimized
                      />
                    ) : (
                      <div className={styles.avatarPlaceholder}>
                        {member.name.charAt(0)}
                      </div>
                    )}
                  </div>
                </div>

                <div className={styles.cardInfo}>
                  <span className={styles.unitBadge} data-unit={member.unit}>
                    {member.unit === 'excel' ? 'EXCEL' : 'CREW'}
                  </span>
                  <span className={styles.cardName}>{member.name}</span>
                  <span className={styles.cardRole}>{member.role}</span>
                </div>

                {member.is_live && member.social_links?.pandatv && (
                  <a
                    href={member.social_links.pandatv}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.watchBtn}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Radio size={14} />
                    시청하기
                  </a>
                )}
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Member Detail Modal */}
      <AnimatePresence>
        {selectedMember && (
          <MemberDetailModal
            member={selectedMember}
            onClose={() => setSelectedMember(null)}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function MemberDetailModal({ member, onClose }: { member: LiveMember; onClose: () => void }) {
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

        {/* Header */}
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
                <Image
                  src={member.image_url}
                  alt={member.name}
                  fill
                  className={styles.modalAvatarImage}
                  unoptimized
                />
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

        {/* Status */}
        <div className={styles.modalStatus}>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>상태</span>
            <span className={`${styles.statusValue} ${member.is_live ? styles.statusLive : ''}`}>
              {member.is_live ? "LIVE" : "오프라인"}
            </span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>소속</span>
            <span className={styles.statusValue}>
              {member.unit === 'excel' ? '한국 엑셀방송' : '중국 단보방송'}
            </span>
          </div>
        </div>

        {/* Social Links */}
        {member.social_links && Object.keys(member.social_links).length > 0 && (
          <div className={styles.modalSocial}>
            <h3 className={styles.modalSectionTitle}>소셜 링크</h3>
            <div className={styles.modalSocialGrid}>
              {member.social_links.pandatv && (
                <a
                  href={member.social_links.pandatv}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.modalSocialLink}
                >
                  <Radio size={20} />
                  <span>팬더티비</span>
                  <ExternalLink size={14} className={styles.linkIcon} />
                </a>
              )}
              {member.social_links.chzzk && (
                <a
                  href={member.social_links.chzzk}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.modalSocialLink}
                >
                  <ExternalLink size={20} />
                  <span>치지직</span>
                  <ExternalLink size={14} className={styles.linkIcon} />
                </a>
              )}
              {member.social_links.youtube && (
                <a
                  href={member.social_links.youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.modalSocialLink}
                >
                  <Youtube size={20} />
                  <span>유튜브</span>
                  <ExternalLink size={14} className={styles.linkIcon} />
                </a>
              )}
              {member.social_links.instagram && (
                <a
                  href={member.social_links.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={styles.modalSocialLink}
                >
                  <Instagram size={20} />
                  <span>인스타그램</span>
                  <ExternalLink size={14} className={styles.linkIcon} />
                </a>
              )}
            </div>
          </div>
        )}

        {/* Watch Button */}
        {member.is_live && member.social_links?.pandatv && (
          <a
            href={member.social_links.pandatv}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.watchButton}
          >
            <Radio size={18} />
            지금 방송 보러가기
          </a>
        )}
      </motion.div>
    </motion.div>
  );
}
