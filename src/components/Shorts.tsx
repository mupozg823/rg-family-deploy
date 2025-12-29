"use client";

import { Play, MoreVertical } from "lucide-react";
import styles from "./Shorts.module.css";

export default function Shorts() {
  const shorts = [1, 2, 3, 4, 5, 6]; // Placeholder data

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h3>SHORTS SECTION</h3>
        <div className={styles.line} />
        <div className={styles.arrows}>
          <span>{"<"}</span>
          <span>{">"}</span>
        </div>
      </div>

      <div className={styles.grid}>
        {shorts.map((item) => (
          <div key={item} className={styles.card}>
            <div className={styles.thumbnail}>
              {/* Video Thumbnail Placeholder */}
              <div className={styles.playOverlay}>
                <Play fill="white" size={24} />
                <span className={styles.duration}>0:30</span>
              </div>
              <div className={styles.options}>
                <MoreVertical size={16} color="white" />
              </div>
            </div>
            <div className={styles.info}>
              <p className={styles.title}>
                숏츠 영상 제목입니다 두줄까지 가능합니다...
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
