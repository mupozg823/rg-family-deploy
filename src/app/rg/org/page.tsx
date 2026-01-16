"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Users, Radio, Calendar, FileText, Zap } from "lucide-react";
import Footer from "@/components/Footer";
import { useOrganization } from "@/lib/hooks";
import {
  MemberCard,
  MemberDetailModal,
} from "@/components/info";
import type { OrgMember } from "@/types/organization";
import styles from "./page.module.css";

type UnitType = "excel" | "crew";

export default function OrganizationPage() {
  const { members, isLoading, getByUnit, getGroupedByRole } = useOrganization();
  const [selectedMember, setSelectedMember] = useState<OrgMember | null>(null);
  const [activeUnit, setActiveUnit] = useState<UnitType>("excel");

  // 유닛별 멤버 분류
  const unitMembers = getByUnit(activeUnit) as OrgMember[];

  // 역할별 그룹화
  const grouped = getGroupedByRole(unitMembers);

  // 최상위 리더: 대표 → 부장 → 팀장 순으로 폴백
  const topLeaders =
    grouped.leaders.length > 0
      ? grouped.leaders
      : grouped.directors.length > 0
      ? grouped.directors
      : grouped.managers;
  // 중간 관리자: 팀장 (topLeaders가 팀장이면 빈 배열)
  const middleManagers =
    grouped.leaders.length > 0 || grouped.directors.length > 0
      ? grouped.managers
      : [];
  // 일반 멤버
  const regularMembers = grouped.members;

  return (
      <div className={`${styles.container} ${activeUnit === 'crew' ? styles.crewTheme : styles.excelTheme}`}>
        {/* Navigation Bar - Reference Style with Centered Title */}
        <nav className={styles.pageNav}>
        <Link href="/" className={styles.backBtn}>
          <ArrowLeft size={18} />
          <span>홈</span>
        </Link>
        <div className={styles.navTitle}>
          <Zap size={16} />
          <span>RG INFO</span>
        </div>
        <div className={styles.navTabs}>
          <Link
            href="/rg/org"
            className={`${styles.navTab} ${styles.active}`}
          >
            <Users size={16} />
            <span>조직도</span>
          </Link>
          <Link href="/rg/live" className={styles.navTab}>
            <Radio size={16} />
            <span>LIVE</span>
          </Link>
          <Link href="/rg/sig" className={styles.navTab}>
            <FileText size={16} />
            <span>시그</span>
          </Link>
          <Link href="/rg/history" className={styles.navTab}>
            <Calendar size={16} />
            <span>연혁</span>
          </Link>
        </div>
      </nav>

      {/* Logo & Header - Simplified (RG FAMILY 강조) */}
      <header className={styles.header}>
        <div className={styles.logoSection}>
          <div className={styles.logoCircle}>
            <Image
              src="/assets/logo/rg_logo_3d_pink.png"
              alt="RG"
              width={60}
              height={60}
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
          <h1 className={styles.logoTitle}>RG FAMILY</h1>
        </div>
      </header>

      {/* Unit Toggle with Member Count */}
      <div className={styles.toggleWrapper}>
        <button
          className={`${styles.toggleBtn} ${
            activeUnit === "excel" ? styles.active : ""
          }`}
          onClick={() => setActiveUnit("excel")}
        >
          EXCEL UNIT
        </button>
        <button
          className={`${styles.toggleBtn} ${
            activeUnit === "crew" ? styles.active : ""
          }`}
          onClick={() => setActiveUnit("crew")}
        >
          CREW UNIT
        </button>
        <div className={styles.memberCount}>
          <Users size={16} />
          <span>총 {unitMembers.length}명</span>
        </div>
      </div>

      {isLoading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>조직도를 불러오는 중...</span>
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={activeUnit}
            className={styles.orgChart}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
          >
            {/* Top: Leaders Row (대표 2인 상단 중앙) */}
            {topLeaders.length > 0 && (
              <div className={styles.leadersRow}>
                {topLeaders.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    size="large"
                    onClick={() => setSelectedMember(member)}
                  />
                ))}
              </div>
            )}

            {/* Tree Connector: 연결선 구조 */}
            {(regularMembers.length > 0 || middleManagers.length > 0) && (
              <div className={styles.mainConnector}>
                {/* Main vertical line from leaders */}
                <div className={styles.mainVerticalLine} />

                {/* Horizontal distribution line */}
                <div className={styles.distributionLine} />

                {/* Drop lines to members */}
                <div className={styles.dropLinesContainer}>
                  {Array.from({ length: Math.min(regularMembers.length, 6) }).map((_, i) => (
                    <div key={i} className={styles.dropLine} />
                  ))}
                </div>
              </div>
            )}

            {/* Middle Managers (팀장) - if exists */}
            {middleManagers.length > 0 && (
              <div className={styles.membersGrid} style={{ marginBottom: 'var(--space-6)' }}>
                {middleManagers.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    size="medium"
                    onClick={() => setSelectedMember(member)}
                  />
                ))}
              </div>
            )}

            {/* Members Grid (멤버/크루) - Dense Layout */}
            {regularMembers.length > 0 && (
              <div className={styles.membersGrid}>
                {regularMembers.map((member) => (
                  <MemberCard
                    key={member.id}
                    member={member}
                    size="small"
                    onClick={() => setSelectedMember(member)}
                  />
                ))}
              </div>
            )}

            {/* Empty State */}
            {topLeaders.length === 0 &&
              middleManagers.length === 0 &&
              regularMembers.length === 0 && (
                <div className={styles.emptyState}>
                  <p>해당 유닛에 멤버가 없습니다.</p>
                </div>
              )}
          </motion.div>
        </AnimatePresence>
      )}

        {/* Member Detail Modal */}
        <AnimatePresence>
          {selectedMember && (
            <MemberDetailModal
              member={selectedMember}
              onClose={() => setSelectedMember(null)}
            />
          )}
        </AnimatePresence>
        <Footer />
      </div>
  );
}
