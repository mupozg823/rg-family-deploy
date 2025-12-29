'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  Users,
  Heart,
  Calendar,
  Building,
  CalendarDays,
  Image,
  Megaphone,
  MessageSquare,
  Film,
  Crown,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Settings,
} from 'lucide-react'
import styles from './Sidebar.module.css'

const menuItems = [
  { href: '/admin', icon: LayoutDashboard, label: '대시보드' },
  { href: '/admin/members', icon: Users, label: '회원 관리' },
  { href: '/admin/donations', icon: Heart, label: '후원 관리' },
  { href: '/admin/seasons', icon: Calendar, label: '시즌 관리' },
  { href: '/admin/organization', icon: Building, label: '조직도 관리' },
  { href: '/admin/schedules', icon: CalendarDays, label: '일정 관리' },
  { href: '/admin/signatures', icon: Image, label: '시그니처 관리' },
  { href: '/admin/notices', icon: Megaphone, label: '공지사항 관리' },
  { href: '/admin/posts', icon: MessageSquare, label: '게시글 관리' },
  { href: '/admin/media', icon: Film, label: '미디어 관리' },
  { href: '/admin/vip-rewards', icon: Crown, label: 'VIP 보상 관리' },
]

export default function Sidebar() {
  const pathname = usePathname()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const isActive = (href: string) => {
    if (href === '/admin') {
      return pathname === '/admin'
    }
    return pathname.startsWith(href)
  }

  return (
    <motion.aside
      className={styles.sidebar}
      animate={{ width: isCollapsed ? 80 : 260 }}
      transition={{ duration: 0.2 }}
    >
      {/* Logo */}
      <div className={styles.logo}>
        <AnimatePresence mode="wait">
          {!isCollapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className={styles.logoText}
            >
              RG Admin
            </motion.span>
          )}
        </AnimatePresence>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className={styles.toggleButton}
        >
          {isCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
        </button>
      </div>

      {/* Navigation */}
      <nav className={styles.nav}>
        {menuItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className={`${styles.navItem} ${isActive(item.href) ? styles.active : ''}`}
          >
            <item.icon size={20} className={styles.icon} />
            <AnimatePresence mode="wait">
              {!isCollapsed && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className={styles.label}
                >
                  {item.label}
                </motion.span>
              )}
            </AnimatePresence>
            {isActive(item.href) && (
              <motion.div
                layoutId="activeIndicator"
                className={styles.activeIndicator}
              />
            )}
          </Link>
        ))}
      </nav>

      {/* Footer */}
      <div className={styles.footer}>
        <Link href="/admin/settings" className={styles.footerItem}>
          <Settings size={20} />
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                설정
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
        <Link href="/" className={styles.footerItem}>
          <LogOut size={20} />
          <AnimatePresence mode="wait">
            {!isCollapsed && (
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                홈으로
              </motion.span>
            )}
          </AnimatePresence>
        </Link>
      </div>
    </motion.aside>
  )
}
