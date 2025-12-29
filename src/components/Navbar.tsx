"use client";

import Link from "next/link";
import styles from "./Navbar.module.css";

export default function Navbar() {
  return (
    <nav className={styles.navbar}>
      <div className={styles.container}>
        <div className={styles.logo}>
          <Link href="/">
            <img
              src="/assets/logo/rg_logo_3d_pink.png"
              alt="RG Logo"
              style={{ height: "50px", objectFit: "contain" }}
            />
          </Link>
        </div>

        <div className={styles.links}>
          <Link href="/info/org" className={styles.link}>
            RG 정보
          </Link>
          <Link href="/ranking" className={styles.link}>
            후원 랭킹
          </Link>
          <Link href="/notice" className={styles.link}>
            공지사항
          </Link>
          <Link href="/community" className={styles.link}>
            커뮤니티
          </Link>
          <Link href="/schedule" className={styles.link}>
            일정
          </Link>
        </div>

        <div className={styles.actions}>
          <div className={styles.profile}>
            <div className={styles.avatar} />
          </div>
          <button className={styles.loginBtn}>로그인</button>
        </div>
      </div>
    </nav>
  );
}
