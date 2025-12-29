"use client";

import { Pin } from "lucide-react";
import styles from "./Notice.module.css";

export default function Notice() {
  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h3>전체 공지 (NOTICE)</h3>
        <div className={styles.line} />
      </div>

      <div className={styles.list}>
        <div className={styles.item}>
          <div className={styles.pinBadge}>
            <Pin size={18} className={styles.pin} />
          </div>
          <div className={styles.itemHeader}>
            <span className={styles.tag}>중요 확정 전체 공지</span>
          </div>
          <div className={styles.content}>
            <p>• 별규린 정회장이 별정산 참석합니다</p>
            <p>• 점점의 정회원 광장들 헤제 부탁 바랍니다</p>
          </div>
          <span className={styles.more}>자세히 보기</span>
        </div>

        <div className={styles.item}>
          <div className={styles.pinBadge}>
            <Pin size={18} className={styles.pin} />
          </div>
          <div className={styles.itemHeader}>
            <span className={styles.tag} style={{ color: "#ff5555" }}>
              전체 공지
            </span>
          </div>
          <div className={styles.content}>
            <p>• 정윤엔 활동불참 알림신 신청바랍니다</p>
            <p>• 철퇴로 붕착된 킹텀 콩칠 윤토하 책임 따릅니다</p>
          </div>
          <span className={styles.more}>자세히 보기</span>
        </div>
      </div>
    </section>
  );
}
