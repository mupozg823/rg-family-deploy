"use client";

import { useState } from "react";
import SectionHeader from "@/components/SectionHeader";
import TabFilter from "@/components/community/TabFilter";
import { Pin } from "lucide-react";
import styles from "./page.module.css";

export default function NoticePage() {
  const [filter, setFilter] = useState("all");

  const tabs = [
    { label: "전체 (ALL)", value: "all" },
    { label: "공식 (OFFICIAL)", value: "official" },
    { label: "엑셀부 (EXCEL)", value: "excel" },
    { label: "크루부 (CREW)", value: "crew" },
  ];

  const notices = [
    {
      id: 1,
      type: "official",
      pinned: true,
      title: "RG FAMILY 시즌2 공식 출범 안내",
      date: "2024.12.01",
    },
    {
      id: 2,
      type: "excel",
      pinned: false,
      title: "엑셀부 12월 정기 합방 일정",
      date: "2024.12.05",
    },
    {
      id: 3,
      type: "crew",
      pinned: false,
      title: "크루부 신규 멤버 오디션 결과",
      date: "2024.12.10",
    },
    {
      id: 4,
      type: "official",
      pinned: false,
      title: "서버 점검 및 업데이트 안내",
      date: "2024.12.12",
    },
  ];

  const filteredNotices =
    filter === "all" ? notices : notices.filter((n) => n.type === filter);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>NOTICE</h1>
        <p>RG FAMILY 공식 공지사항</p>
      </header>

      <TabFilter tabs={tabs} activeTab={filter} onTabChange={setFilter} />

      <div className={styles.list}>
        {filteredNotices.map((notice) => (
          <div key={notice.id} className={styles.item}>
            <div className={styles.itemContent}>
              <div className={styles.meta}>
                <span className={`${styles.badge} ${styles[notice.type]}`}>
                  {notice.type.toUpperCase()}
                </span>
                {notice.pinned && <Pin size={14} className={styles.pin} />}
              </div>
              <h3 className={styles.title}>{notice.title}</h3>
              <span className={styles.date}>{notice.date}</span>
            </div>
            <div className={styles.arrow}>→</div>
          </div>
        ))}
      </div>
    </div>
  );
}
