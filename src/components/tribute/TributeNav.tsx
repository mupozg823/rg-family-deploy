'use client'

import Link from 'next/link'
import { ArrowLeft, Trophy } from 'lucide-react'
import styles from './TributeNav.module.css'

export default function TributeNav() {
  return (
    <nav className={styles.nav}>
      <Link href="/ranking" className={styles.backBtn}>
        <ArrowLeft size={18} />
        <span>랭킹</span>
      </Link>
      <div className={styles.title}>
        <Trophy size={18} />
        <span>TRIBUTE PAGE</span>
      </div>
      <div className={styles.actions}>
        <Link href="/ranking" className={styles.navBtn}>
          <Trophy size={16} />
          <span>랭킹</span>
        </Link>
        <Link href="/" className={styles.navBtn}>
          <span>홈</span>
        </Link>
      </div>
    </nav>
  )
}
