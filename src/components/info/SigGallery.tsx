'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { mockSignatureData, signatureCategories, type SignatureData } from '@/lib/mock/signatures'
import { USE_MOCK_DATA } from '@/lib/config'
import SigCard from './SigCard'
import SigDetailModal from './SigDetailModal'
import styles from './SigGallery.module.css'

type CategoryFilter = typeof signatureCategories[number]['id']

export default function SigGallery() {
  const [signatures, setSignatures] = useState<SignatureData[]>([])
  const [selectedSig, setSelectedSig] = useState<SignatureData | null>(null)
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const fetchSignatures = useCallback(async () => {
    setIsLoading(true)

    if (USE_MOCK_DATA) {
      let filtered = [...mockSignatureData]

      // Category filter
      if (categoryFilter !== 'all' && categoryFilter !== 'new') {
        filtered = filtered.filter(sig => sig.category === categoryFilter)
      }

      // New filter - show most recent
      if (categoryFilter === 'new') {
        filtered = [...mockSignatureData]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 10)
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filtered = filtered.filter(sig =>
          sig.title.toLowerCase().includes(query) ||
          sig.number.toString().includes(query) ||
          sig.videos.some(v => v.memberName.toLowerCase().includes(query))
        )
      }

      // Sort by number
      filtered.sort((a, b) => a.number - b.number)

      setSignatures(filtered)
      setIsLoading(false)
      return
    }

    // Supabase query would go here
    setIsLoading(false)
  }, [categoryFilter, searchQuery])

  useEffect(() => {
    fetchSignatures()
  }, [fetchSignatures])

  return (
    <div className={styles.container}>
      {/* Filters - cnine style */}
      <div className={styles.filterBar}>
        {/* Category Tabs */}
        <div className={styles.categoryTabs}>
          {signatureCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategoryFilter(cat.id)}
              className={`${styles.categoryTab} ${categoryFilter === cat.id ? styles.active : ''}`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className={styles.searchWrapper}>
          <Search size={16} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={styles.clearSearch}
            >
              <X size={14} />
            </button>
          )}
        </div>
      </div>

      {/* Gallery Grid - cnine 6-column style */}
      {isLoading ? (
        <div className={styles.loading}>
          <div className={styles.spinner} />
          <span>시그니처를 불러오는 중...</span>
        </div>
      ) : signatures.length === 0 ? (
        <div className={styles.empty}>
          <p>등록된 시그니처가 없습니다</p>
        </div>
      ) : (
        <motion.div className={styles.grid} layout>
          <AnimatePresence>
            {signatures.map((sig) => (
              <SigCard
                key={sig.id}
                signature={sig}
                onClick={() => setSelectedSig(sig)}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedSig && (
          <SigDetailModal
            signature={selectedSig}
            onClose={() => setSelectedSig(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
