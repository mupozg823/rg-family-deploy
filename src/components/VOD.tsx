"use client";

import { Play } from "lucide-react";
import styles from "./VOD.module.css";

export default function VOD() {
  // Array of just numbers for now to display placeholders
  const vods = [1, 2, 3];

  return (
    <section className={styles.section}>
      <div className={styles.header}>
        <h3>VOD SECTION</h3>
        <div className={styles.line} />
      </div>

      <div className={styles.container}>
        {/* Large Featured VOD */}
        <div className={styles.featured}>
          <div className={styles.featuredThumb}>
            <Play size={48} className={styles.playIcon} />
            <span className={styles.timeTag}>2:26</span>
          </div>
          <div className={styles.featuredInfo}>
            <h4>MUSTGR SYEROEM</h4>
            <p>RG FAMILY YANGIONA & SC OIC OOM</p>
            <span className={styles.date}>2024. 01. 10</span>
          </div>
        </div>

        {/* List of Smaller VODs */}
        <div className={styles.list}>
          {vods.map((item) => (
            <div key={item} className={styles.item}>
              <div className={styles.itemThumb}>
                <span className={styles.timeTagSmall}>2:30</span>
              </div>
              <div className={styles.itemInfo}>
                <span className={styles.category}>VOD</span>
                <h5>VOD 영상 제목이 들어갑니다</h5>
                <span className={styles.dateSmall}>2024. 01. 09</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
