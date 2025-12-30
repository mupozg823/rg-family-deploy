'use client'

import { Crown, Medal, Award, Star, Sparkles } from 'lucide-react'
import type { TributeTheme } from '@/types/common'
import styles from './TributeBadge.module.css'

interface TributeBadgeProps {
  theme: TributeTheme
  label: string
  size?: 'sm' | 'md' | 'lg'
  variant?: 'filled' | 'outline' | 'glow'
  icon?: 'crown' | 'medal' | 'award' | 'star' | 'sparkles' | 'none'
}

export default function TributeBadge({
  theme,
  label,
  size = 'md',
  variant = 'filled',
  icon = 'none',
}: TributeBadgeProps) {
  const getIcon = () => {
    const iconSize = size === 'sm' ? 12 : size === 'lg' ? 18 : 14
    switch (icon) {
      case 'crown':
        return <Crown size={iconSize} />
      case 'medal':
        return <Medal size={iconSize} />
      case 'award':
        return <Award size={iconSize} />
      case 'star':
        return <Star size={iconSize} />
      case 'sparkles':
        return <Sparkles size={iconSize} />
      default:
        return null
    }
  }

  return (
    <span
      className={`${styles.badge} ${styles[theme]} ${styles[size]} ${styles[variant]}`}
    >
      {icon !== 'none' && <span className={styles.icon}>{getIcon()}</span>}
      <span className={styles.label}>{label}</span>
    </span>
  )
}
