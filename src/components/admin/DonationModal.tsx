'use client'

import { motion, AnimatePresence } from 'framer-motion'
import { X, Save } from 'lucide-react'
import type { DonationItem, SeasonItem, ProfileItem } from '@/lib/hooks/useDonationsData'
import styles from './DonationModal.module.css'

interface DonationModalProps {
  isOpen: boolean
  isNew: boolean
  donation: Partial<DonationItem> | null
  seasons: SeasonItem[]
  profiles: ProfileItem[]
  onChange: (donation: Partial<DonationItem>) => void
  onSave: () => void
  onClose: () => void
}

export default function DonationModal({
  isOpen,
  isNew,
  donation,
  seasons,
  profiles,
  onChange,
  onSave,
  onClose,
}: DonationModalProps) {
  if (!donation) return null

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className={styles.overlay}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className={styles.modal}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.header}>
              <h2>{isNew ? '후원 등록' : '후원 수정'}</h2>
              <button onClick={onClose} className={styles.closeButton}>
                <X size={20} />
              </button>
            </div>

            <div className={styles.body}>
              {isNew && (
                <div className={styles.formGroup}>
                  <label>후원자</label>
                  <select
                    value={donation.donorId || ''}
                    onChange={(e) =>
                      onChange({ ...donation, donorId: e.target.value || null })
                    }
                    className={styles.select}
                  >
                    <option value="">선택하세요</option>
                    {profiles.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.nickname}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className={styles.formGroup}>
                <label>금액 (하트)</label>
                <input
                  type="number"
                  value={donation.amount}
                  onChange={(e) =>
                    onChange({
                      ...donation,
                      amount: parseInt(e.target.value) || 0,
                    })
                  }
                  className={styles.input}
                  placeholder="10000"
                />
              </div>

              <div className={styles.formGroup}>
                <label>시즌</label>
                <select
                  value={donation.seasonId}
                  onChange={(e) =>
                    onChange({
                      ...donation,
                      seasonId: parseInt(e.target.value),
                    })
                  }
                  className={styles.select}
                >
                  {seasons.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>메시지 (선택)</label>
                <textarea
                  value={donation.message}
                  onChange={(e) =>
                    onChange({ ...donation, message: e.target.value })
                  }
                  className={styles.textarea}
                  placeholder="후원 메시지를 입력하세요..."
                  rows={3}
                />
              </div>
            </div>

            <div className={styles.footer}>
              <button onClick={onClose} className={styles.cancelButton}>
                취소
              </button>
              <button onClick={onSave} className={styles.saveButton}>
                <Save size={16} />
                {isNew ? '등록' : '저장'}
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
