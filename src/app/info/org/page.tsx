"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSupabase } from "@/lib/hooks/useSupabase";
import { mockOrganization } from "@/lib/mock/data";
import { Radio, Youtube, Instagram, ExternalLink, X, ExternalLink as LinkIcon } from "lucide-react";
import styles from "./page.module.css";

const USE_MOCK = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' || true;

interface OrgMember {
  id: number;
  name: string;
  role: string;
  position_order: number;
  parent_id: number | null;
  image_url: string | null;
  unit: 'excel' | 'crew';
  social_links?: {
    chzzk?: string;
    youtube?: string;
    instagram?: string;
    pandatv?: string;
  };
  is_live?: boolean;
}

interface GroupedMembers {
  [role: string]: OrgMember[];
}

export default function OrganizationPage() {
  const supabase = useSupabase();
  const [activeTab, setActiveTab] = useState<"excel" | "crew">("excel");
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<OrgMember | null>(null);

  const fetchOrganization = useCallback(async () => {
    setIsLoading(true);

    if (USE_MOCK) {
      // Mock 데이터 사용
      const mockData = mockOrganization.map((m) => ({
        id: m.id,
        name: m.name,
        role: m.role,
        position_order: m.position_order,
        parent_id: m.parent_id,
        image_url: m.image_url,
        unit: m.unit,
        social_links: m.social_links,
        is_live: m.is_live,
      })) as OrgMember[];
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
      console.error('조직도 로드 실패:', error);
      setIsLoading(false);
      return;
    }

    setMembers(data as OrgMember[] || []);
    setIsLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchOrganization();
  }, [fetchOrganization]);

  const filteredMembers = members.filter((m) => m.unit === activeTab);
  const totalCount = filteredMembers.length;

  // 역할별로 그룹화
  const groupedByRole: GroupedMembers = filteredMembers.reduce((acc, member) => {
    const role = member.role;
    if (!acc[role]) {
      acc[role] = [];
    }
    acc[role].push(member);
    return acc;
  }, {} as GroupedMembers);

  // 역할 순서 정의
  const roleOrder = ['대표', 'PRESIDENT', '부장', 'DIRECTOR', '팀장', 'MANAGER', '멤버', 'MEMBER', '크루', 'CREW'];

  const sortedRoles = Object.keys(groupedByRole).sort((a, b) => {
    const aIndex = roleOrder.findIndex(r => a.toUpperCase().includes(r.toUpperCase()));
    const bIndex = roleOrder.findIndex(r => b.toUpperCase().includes(r.toUpperCase()));
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  // 폴백 데이터
  const fallbackExcel: OrgMember[] = [
    { id: 1, name: "HEAD LINA", role: "대표", position_order: 0, parent_id: null, image_url: null, unit: 'excel', is_live: true },
    { id: 2, name: "Manager A", role: "부장", position_order: 1, parent_id: 1, image_url: null, unit: 'excel' },
    { id: 3, name: "Manager B", role: "부장", position_order: 2, parent_id: 1, image_url: null, unit: 'excel' },
    { id: 4, name: "Member 01", role: "멤버", position_order: 3, parent_id: 2, image_url: null, unit: 'excel' },
    { id: 5, name: "Member 02", role: "멤버", position_order: 4, parent_id: 2, image_url: null, unit: 'excel' },
    { id: 6, name: "Member 03", role: "멤버", position_order: 5, parent_id: 3, image_url: null, unit: 'excel' },
    { id: 7, name: "Member 04", role: "멤버", position_order: 6, parent_id: 3, image_url: null, unit: 'excel' },
  ];

  const fallbackCrew: OrgMember[] = [
    { id: 8, name: "HEAD GAAE", role: "대표", position_order: 0, parent_id: null, image_url: null, unit: 'crew', is_live: false },
    { id: 9, name: "Team Leader 1", role: "팀장", position_order: 1, parent_id: 8, image_url: null, unit: 'crew' },
    { id: 10, name: "Crew 01", role: "크루", position_order: 2, parent_id: 9, image_url: null, unit: 'crew' },
    { id: 11, name: "Crew 02", role: "크루", position_order: 3, parent_id: 9, image_url: null, unit: 'crew' },
    { id: 12, name: "Crew 03", role: "크루", position_order: 4, parent_id: 9, image_url: null, unit: 'crew' },
  ];

  const displayMembers = filteredMembers.length > 0
    ? filteredMembers
    : (activeTab === 'excel' ? fallbackExcel : fallbackCrew);

  const displayGrouped: GroupedMembers = displayMembers.reduce((acc, member) => {
    const role = member.role;
    if (!acc[role]) {
      acc[role] = [];
    }
    acc[role].push(member);
    return acc;
  }, {} as GroupedMembers);

  const displayRoles = Object.keys(displayGrouped).sort((a, b) => {
    const aIndex = roleOrder.findIndex(r => a.toUpperCase().includes(r.toUpperCase()));
    const bIndex = roleOrder.findIndex(r => b.toUpperCase().includes(r.toUpperCase()));
    if (aIndex === -1 && bIndex === -1) return 0;
    if (aIndex === -1) return 1;
    if (bIndex === -1) return -1;
    return aIndex - bIndex;
  });

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>ORGANIZATION</h1>
        <p>RG FAMILY 조직도</p>
      </header>

      {/* Tabs */}
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === "excel" ? styles.active : ""}`}
          onClick={() => setActiveTab("excel")}
        >
          EXCEL UNIT
        </button>
        <button
          className={`${styles.tab} ${activeTab === "crew" ? styles.active : ""}`}
          onClick={() => setActiveTab("crew")}
        >
          CREW UNIT
        </button>
      </div>

      {/* Total Count */}
      <div className={styles.totalCount}>
        총 인원 <span className={styles.countNumber}>{displayMembers.length}</span> 명
      </div>

      {/* Content */}
      <div className={styles.content}>
        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <span>조직도를 불러오는 중...</span>
          </div>
        ) : (
          <div className={styles.orgContent}>
            {displayRoles.map((role) => (
              <section key={role} className={styles.roleSection}>
                <h2 className={styles.roleTitle}>
                  {role}
                  <span className={styles.roleCount}>총 인원 {displayGrouped[role].length}명</span>
                </h2>
                <div className={styles.membersGrid}>
                  {displayGrouped[role].map((member) => (
                    <MemberCard
                      key={member.id}
                      member={member}
                      onClick={() => setSelectedMember(member)}
                    />
                  ))}
                </div>
              </section>
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

function MemberCard({ member, onClick }: { member: OrgMember; onClick: () => void }) {
  return (
    <div className={styles.memberCard} onClick={onClick} role="button" tabIndex={0}>
      <div className={styles.avatarWrapper}>
        {member.is_live && (
          <span className={styles.liveBadge}>
            <Radio size={10} />
            LIVE
          </span>
        )}
        <div className={`${styles.avatar} ${member.is_live ? styles.avatarLive : ""}`}>
          {member.image_url ? (
            <img src={member.image_url} alt={member.name} />
          ) : (
            <div className={styles.avatarPlaceholder}>
              {member.name.charAt(0)}
            </div>
          )}
        </div>
      </div>

      <div className={styles.memberInfo}>
        <span className={styles.memberRole}>{member.role}</span>
        <span className={styles.memberName}>{member.name}</span>
      </div>

      {member.social_links && (
        <div className={styles.socialLinks} onClick={(e) => e.stopPropagation()}>
          {member.social_links.pandatv && (
            <a href={member.social_links.pandatv} target="_blank" rel="noopener noreferrer" className={styles.socialLink} title="팬더티비">
              <Radio size={16} />
            </a>
          )}
          {member.social_links.chzzk && (
            <a href={member.social_links.chzzk} target="_blank" rel="noopener noreferrer" className={styles.socialLink} title="치지직">
              <ExternalLink size={16} />
            </a>
          )}
          {member.social_links.youtube && (
            <a href={member.social_links.youtube} target="_blank" rel="noopener noreferrer" className={styles.socialLink} title="유튜브">
              <Youtube size={16} />
            </a>
          )}
          {member.social_links.instagram && (
            <a href={member.social_links.instagram} target="_blank" rel="noopener noreferrer" className={styles.socialLink} title="인스타그램">
              <Instagram size={16} />
            </a>
          )}
        </div>
      )}
    </div>
  );
}

function MemberDetailModal({ member, onClose }: { member: OrgMember; onClose: () => void }) {
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
            <div className={`${styles.modalAvatar} ${member.is_live ? styles.modalAvatarLive : ""}`}>
              {member.image_url ? (
                <img src={member.image_url} alt={member.name} />
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
            <span className={`${styles.statusValue} ${member.is_live ? styles.statusLive : ""}`}>
              {member.is_live ? "🔴 방송 중" : "⚫ 오프라인"}
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
                  <LinkIcon size={14} className={styles.linkIcon} />
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
                  <LinkIcon size={14} className={styles.linkIcon} />
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
                  <LinkIcon size={14} className={styles.linkIcon} />
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
                  <LinkIcon size={14} className={styles.linkIcon} />
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
