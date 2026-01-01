'use client'

import { useEffect, useState, useCallback } from 'react'
import { motion } from 'framer-motion'
import { Users, Heart, Calendar, FileText, TrendingUp, Clock } from 'lucide-react'
import { StatsCard, DataTable, Column } from '@/components/admin'
import { useSupabaseContext } from '@/lib/context'
import type { JoinedProfile } from '@/types/common'
import styles from './page.module.css'

interface DashboardStats {
  totalMembers: number
  totalDonations: number
  totalDonationAmount: number
  activeSeasons: number
  recentDonations: RecentDonation[]
  recentMembers: RecentMember[]
}

interface RecentDonation {
  id: number
  donorName: string
  amount: number
  createdAt: string
}

interface RecentMember {
  id: string
  nickname: string
  email: string
  createdAt: string
}

export default function AdminDashboardPage() {
  const supabase = useSupabaseContext()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const fetchStats = useCallback(async () => {
    setIsLoading(true)

    try {
      // 회원 수
      const { count: memberCount } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true })

      // 후원 통계
      const { data: donationStats } = await supabase
        .from('donations')
        .select('amount')

      const totalDonations = donationStats?.length || 0
      const totalDonationAmount = donationStats?.reduce((sum, d) => sum + d.amount, 0) || 0

      // 활성 시즌
      const { count: activeSeasonCount } = await supabase
        .from('seasons')
        .select('*', { count: 'exact', head: true })
        .eq('is_active', true)

      // 최근 후원
      const { data: recentDonations } = await supabase
        .from('donations')
        .select('id, amount, created_at, profiles!donor_id(nickname)')
        .order('created_at', { ascending: false })
        .limit(5)

      // 최근 가입
      const { data: recentMembers } = await supabase
        .from('profiles')
        .select('id, nickname, email, created_at')
        .order('created_at', { ascending: false })
        .limit(5)

      setStats({
        totalMembers: memberCount || 0,
        totalDonations,
        totalDonationAmount,
        activeSeasons: activeSeasonCount || 0,
        recentDonations: (recentDonations || []).map((d) => {
          const profile = d.profiles as JoinedProfile | null
          return {
            id: d.id,
            donorName: profile?.nickname || '익명',
            amount: d.amount,
            createdAt: d.created_at,
          }
        }),
        recentMembers: (recentMembers || []).map((m) => ({
          id: m.id,
          nickname: m.nickname,
          email: m.email || '',
          createdAt: m.created_at,
        })),
      })
    } catch (error) {
      console.error('대시보드 데이터 로드 실패:', error)
    }

    setIsLoading(false)
  }, [supabase])

  useEffect(() => {
    fetchStats()
  }, [fetchStats])

  const formatAmount = (amount: number) => {
    if (amount >= 100000000) {
      return `${(amount / 100000000).toFixed(1)}억원`
    }
    if (amount >= 10000) {
      return `${(amount / 10000).toFixed(0)}만원`
    }
    return `${amount.toLocaleString()}원`
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  const donationColumns: Column<RecentDonation>[] = [
    { key: 'donorName', header: '후원자' },
    {
      key: 'amount',
      header: '금액',
      render: (item) => (
        <span className={styles.amountCell}>{formatAmount(item.amount)}</span>
      ),
    },
    {
      key: 'createdAt',
      header: '일시',
      render: (item) => formatDate(item.createdAt),
    },
  ]

  const memberColumns: Column<RecentMember>[] = [
    { key: 'nickname', header: '닉네임' },
    { key: 'email', header: '이메일' },
    {
      key: 'createdAt',
      header: '가입일',
      render: (item) => formatDate(item.createdAt),
    },
  ]

  if (isLoading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner} />
        <span>대시보드 로딩 중...</span>
      </div>
    )
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1 className={styles.title}>대시보드</h1>
        <p className={styles.subtitle}>RG 패밀리 관리자 페이지</p>
      </header>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <StatsCard
          title="전체 회원"
          value={stats?.totalMembers.toLocaleString() || '0'}
          icon={Users}
          color="primary"
          delay={0}
        />
        <StatsCard
          title="전체 후원"
          value={stats?.totalDonations.toLocaleString() || '0'}
          icon={Heart}
          color="success"
          delay={0.1}
        />
        <StatsCard
          title="총 후원금"
          value={formatAmount(stats?.totalDonationAmount || 0)}
          icon={TrendingUp}
          color="warning"
          delay={0.2}
        />
        <StatsCard
          title="활성 시즌"
          value={stats?.activeSeasons || '0'}
          icon={Calendar}
          color="info"
          delay={0.3}
        />
      </div>

      {/* Recent Activity */}
      <div className={styles.activityGrid}>
        <motion.section
          className={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <div className={styles.sectionHeader}>
            <Heart size={20} />
            <h2>최근 후원</h2>
          </div>
          <DataTable
            data={stats?.recentDonations || []}
            columns={donationColumns}
            searchable={false}
            itemsPerPage={5}
          />
        </motion.section>

        <motion.section
          className={styles.section}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <div className={styles.sectionHeader}>
            <Users size={20} />
            <h2>최근 가입</h2>
          </div>
          <DataTable
            data={stats?.recentMembers || []}
            columns={memberColumns}
            searchable={false}
            itemsPerPage={5}
          />
        </motion.section>
      </div>

      {/* Quick Actions */}
      <motion.section
        className={styles.quickActions}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
      >
        <h2>빠른 작업</h2>
        <div className={styles.actionGrid}>
          <a href="/admin/donations" className={styles.actionCard}>
            <Heart size={24} />
            <span>후원 등록</span>
          </a>
          <a href="/admin/schedules" className={styles.actionCard}>
            <Calendar size={24} />
            <span>일정 추가</span>
          </a>
          <a href="/admin/notices" className={styles.actionCard}>
            <FileText size={24} />
            <span>공지 작성</span>
          </a>
          <a href="/admin/seasons" className={styles.actionCard}>
            <Clock size={24} />
            <span>시즌 관리</span>
          </a>
        </div>
      </motion.section>
    </div>
  )
}
