"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSupabase } from "@/lib/hooks/useSupabase";
import { mockOrganization } from "@/lib/mock/data";
import { USE_MOCK_DATA } from "@/lib/config";
import { MemberCard, MemberDetailModal, type OrgMember } from "@/components/info";
import styles from "./page.module.css";

type UnitType = 'excel' | 'crew';

export default function OrganizationPage() {
  const supabase = useSupabase();
  const [members, setMembers] = useState<OrgMember[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedMember, setSelectedMember] = useState<OrgMember | null>(null);
  const [activeUnit, setActiveUnit] = useState<UnitType>('excel');

  const fetchOrganization = useCallback(async () => {
    setIsLoading(true);

    if (USE_MOCK_DATA) {
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

  // 유닛별 멤버 분류
  const unitMembers = members.filter(m => m.unit === activeUnit);

  // 역할별 그룹화
  const getGroupedMembers = (unitMembers: OrgMember[]) => {
    const leaders = unitMembers.filter(m => m.role === '대표');
    const directors = unitMembers.filter(m => m.role === '부장');
    const managers = unitMembers.filter(m => m.role === '팀장');
    const membersList = unitMembers.filter(m => m.role === '멤버' || m.role === '크루');
    return { leaders, directors, managers, members: membersList };
  };

  const grouped = getGroupedMembers(unitMembers);

  // 최상위 리더: 대표 또는 부장
  const topLeaders = grouped.leaders.length > 0 ? grouped.leaders : grouped.directors;
  // 중간 관리자: 팀장
  const middleManagers = grouped.managers;
  // 일반 멤버
  const regularMembers = grouped.members;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>RG Info</h1>
        <p>조직도</p>
      </header>

      {/* Unit Toggle */}
      <div className={styles.toggleWrapper}>
        <button
          className={`${styles.toggleBtn} ${activeUnit === 'excel' ? styles.active : ''}`}
          onClick={() => setActiveUnit('excel')}
        >
          EXCEL UNIT
        </button>
        <button
          className={`${styles.toggleBtn} ${activeUnit === 'crew' ? styles.active : ''}`}
          onClick={() => setActiveUnit('crew')}
        >
          CREW UNIT
        </button>
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
            {/* Level 0: Top Leaders (대표/부장) */}
            {topLeaders.length > 0 && (
              <>
                <div className={styles.level} data-level="0">
                  <div className={styles.levelMembers}>
                    {topLeaders.map((member) => (
                      <MemberCard
                        key={member.id}
                        member={member}
                        size="large"
                        onClick={() => setSelectedMember(member)}
                      />
                    ))}
                  </div>
                </div>

                {/* Connector to Level 1 */}
                {(middleManagers.length > 0 || regularMembers.length > 0) && (
                  <div className={styles.connector}>
                    <div className={styles.verticalLine} />
                    {middleManagers.length > 1 && (
                      <>
                        <div className={styles.horizontalLine} />
                        <div className={styles.branchLines}>
                          {middleManagers.map((_, i) => (
                            <div key={i} className={styles.branchLine} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Level 1: Middle Managers (팀장) */}
            {middleManagers.length > 0 && (
              <>
                <div className={styles.level} data-level="1">
                  <div className={styles.levelMembers}>
                    {middleManagers.map((member) => (
                      <MemberCard
                        key={member.id}
                        member={member}
                        size="medium"
                        onClick={() => setSelectedMember(member)}
                      />
                    ))}
                  </div>
                </div>

                {/* Connector to Level 2 */}
                {regularMembers.length > 0 && (
                  <div className={styles.connector}>
                    <div className={styles.verticalLine} />
                    {regularMembers.length > 1 && (
                      <>
                        <div className={styles.horizontalLine} style={{ width: `${Math.min(regularMembers.length * 100, 600)}px` }} />
                        <div className={styles.branchLines} style={{ width: `${Math.min(regularMembers.length * 100, 600)}px` }}>
                          {regularMembers.map((_, i) => (
                            <div key={i} className={styles.branchLine} />
                          ))}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </>
            )}

            {/* Level 2: Regular Members (멤버/크루) */}
            {regularMembers.length > 0 && (
              <div className={styles.level} data-level="2">
                <div className={styles.levelMembers}>
                  {regularMembers.map((member) => (
                    <MemberCard
                      key={member.id}
                      member={member}
                      size="small"
                      onClick={() => setSelectedMember(member)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {topLeaders.length === 0 && middleManagers.length === 0 && regularMembers.length === 0 && (
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
    </div>
  );
}

