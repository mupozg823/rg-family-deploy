'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import { LogIn, ShieldX, Lock, ArrowLeft } from 'lucide-react'
import { getAccessDeniedMessage, type AccessDeniedReason } from '@/lib/auth/access-control'
import styles from './TributeAccessDenied.module.css'

interface TributeAccessDeniedProps {
  reason: AccessDeniedReason
}

export default function TributeAccessDenied({ reason }: TributeAccessDeniedProps) {
  const { title, description } = getAccessDeniedMessage(reason)
  const IconComponent = reason === 'not_authenticated'
    ? LogIn
    : reason === 'not_owner'
      ? ShieldX
      : Lock

  return (
    <div className={styles.accessDenied}>
      <motion.div
        className={styles.content}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className={styles.icon}>
          <IconComponent size={48} />
        </div>
        <h2 className={styles.title}>{title}</h2>
        <p className={styles.description}>{description}</p>
        <div className={styles.actions}>
          {reason === 'not_authenticated' ? (
            <Link href="/login" className={styles.primaryBtn}>
              <LogIn size={18} />
              <span>로그인하기</span>
            </Link>
          ) : (
            <Link href="/ranking" className={styles.backBtn}>
              <ArrowLeft size={18} />
              <span>랭킹으로 돌아가기</span>
            </Link>
          )}
        </div>
      </motion.div>
    </div>
  )
}
