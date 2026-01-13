'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { MessageSquare, Send, User, Loader2 } from 'lucide-react'
import { useGuestbook } from '@/lib/hooks'
import styles from '../TributeSections.module.css'

interface TributeGuestbookSectionProps {
  donorName: string
  tributeUserId: string
}

export default function TributeGuestbookSection({
  donorName,
  tributeUserId,
}: TributeGuestbookSectionProps) {
  const [inputValue, setInputValue] = useState('')
  const {
    entries,
    isLoading,
    error,
    submitEntry,
    isSubmitting,
    canWrite,
  } = useGuestbook({ tributeUserId })

  // 날짜 포맷팅
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return `${date.getFullYear()}.${String(date.getMonth() + 1).padStart(2, '0')}.${String(date.getDate()).padStart(2, '0')}`
  }

  // 메시지 제출
  const handleSubmit = async () => {
    if (!inputValue.trim() || isSubmitting) return

    const success = await submitEntry(inputValue)
    if (success) {
      setInputValue('')
    }
  }

  // Enter 키 제출
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      void handleSubmit()
    }
  }

  return (
    <motion.section
      className={styles.guestbookSection}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
    >
      <div className={styles.sectionHeader}>
        <MessageSquare size={20} />
        <h2>{donorName}님의 방명록</h2>
        <span className={styles.entryCount}>{entries.length}개의 메시지</span>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className={styles.guestbookLoading}>
          <Loader2 size={24} className={styles.spinner} />
          <span>방명록을 불러오는 중...</span>
        </div>
      )}

      {/* Error State */}
      {error && (
        <div className={styles.guestbookError}>
          <span>{error}</span>
        </div>
      )}

      {/* Guestbook Entries */}
      {!isLoading && (
        <div className={styles.guestbookList}>
          {entries.length === 0 ? (
            <div className={styles.guestbookEmpty}>
              <MessageSquare size={32} />
              <p>아직 방명록이 없습니다.</p>
              <span>첫 번째 축하 메시지를 남겨주세요!</span>
            </div>
          ) : (
            entries.map((entry) => (
              <div key={entry.id} className={styles.guestbookEntry}>
                <div
                  className={`${styles.guestbookAvatar} ${entry.is_member ? styles.memberAvatar : ''}`}
                  data-unit={entry.author_unit}
                >
                  <User size={16} />
                </div>
                <div className={styles.guestbookContent}>
                  <div className={styles.guestbookMeta}>
                    <span className={styles.guestbookAuthor}>
                      {entry.author_name}
                      {entry.is_member && (
                        <span className={styles.memberBadge} data-unit={entry.author_unit}>
                          {entry.author_unit === 'excel' ? 'EXCEL' : entry.author_unit === 'crew' ? 'CREW' : 'MEMBER'}
                        </span>
                      )}
                    </span>
                    <span className={styles.guestbookDate}>{formatDate(entry.created_at)}</span>
                  </div>
                  <p className={styles.guestbookMessage}>{entry.message}</p>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Guestbook Input */}
      <div className={styles.guestbookInputWrapper}>
        <div className={styles.guestbookInput}>
          <input
            type="text"
            placeholder={canWrite ? '축하 메시지를 남겨주세요...' : '로그인 후 작성할 수 있습니다'}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={!canWrite || isSubmitting}
            maxLength={500}
          />
          <button
            className={styles.guestbookSendBtn}
            onClick={handleSubmit}
            disabled={!canWrite || isSubmitting || !inputValue.trim()}
          >
            {isSubmitting ? (
              <Loader2 size={18} className={styles.spinner} />
            ) : (
              <Send size={18} />
            )}
          </button>
        </div>
        {!canWrite && (
          <span className={styles.guestbookHint}>
            로그인 후 메시지를 남길 수 있습니다
          </span>
        )}
        {canWrite && inputValue.length > 0 && (
          <span className={styles.guestbookCharCount}>
            {inputValue.length}/500
          </span>
        )}
      </div>
    </motion.section>
  )
}
