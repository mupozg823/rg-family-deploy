'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, X } from 'lucide-react'
import { mockSignatureData, signatureCategories, type SignatureData } from '@/lib/mock/signatures'
import { USE_MOCK_DATA } from '@/lib/config'
import { useSupabaseContext } from '@/lib/context'
import { withRetry } from '@/lib/utils/fetch-with-retry'
import SigCard from './SigCard'
import SigDetailModal from './SigDetailModal'
import styles from './SigGallery.module.css'

type CategoryFilter = typeof signatureCategories[number]['id']
type UnitFilter = 'all' | 'excel' | 'crew'

export default function SigGallery() {
  const supabase = useSupabaseContext()
  const [signatures, setSignatures] = useState<SignatureData[]>([])
  const [selectedSig, setSelectedSig] = useState<SignatureData | null>(null)
  const [unitFilter, setUnitFilter] = useState<UnitFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<CategoryFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)

  const fetchSignatures = useCallback(async () => {
    setIsLoading(true)

    if (USE_MOCK_DATA) {
      let filtered = [...mockSignatureData]

      // Unit filter
      if (unitFilter !== 'all') {
        filtered = filtered.filter(sig => sig.unit === unitFilter)
      }

      // Category filter
      if (categoryFilter !== 'all' && categoryFilter !== 'new') {
        filtered = filtered.filter(sig => sig.category === categoryFilter)
      }

      // New filter - show most recent
      if (categoryFilter === 'new') {
        filtered = (unitFilter === 'all' ? [...mockSignatureData] : mockSignatureData.filter(s => s.unit === unitFilter))
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

    // Supabase에서 시그니처 데이터 조회
    try {
      const { data, error } = await withRetry(async () => {
        let query = supabase.from('signatures').select('*').order('created_at', { ascending: false })

        if (unitFilter !== 'all') {
          query = query.eq('unit', unitFilter)
        }

        return await query
      })

      if (error) {
        console.error('시그니처 로드 실패:', error)
        setSignatures([])
      } else {
        // DB 데이터를 SignatureData 형식으로 변환
        const converted: SignatureData[] = (data || []).map((row, index) => ({
          id: row.id,
          number: index + 1,
          title: row.title,
          category: 'all' as const,
          thumbnailUrl: row.thumbnail_url || row.media_url,
          unit: row.unit,
          videos: [{
            id: row.id,
            memberName: row.member_name || '',
            videoUrl: row.media_url,
            thumbnailUrl: row.thumbnail_url || row.media_url,
            date: row.created_at,
            duration: '0:00',
            viewCount: row.view_count || 0,
          }],
          totalVideoCount: 1,
          isFeatured: row.is_featured || false,
          createdAt: row.created_at,
        }))

        // 검색 필터 적용
        let filtered = converted
        if (searchQuery) {
          const query = searchQuery.toLowerCase()
          filtered = filtered.filter(sig =>
            sig.title.toLowerCase().includes(query) ||
            sig.videos.some(v => v.memberName.toLowerCase().includes(query))
          )
        }

        setSignatures(filtered)
      }
    } catch (err) {
      console.error('시그니처 로드 중 오류:', err)
      setSignatures([])
    }

    setIsLoading(false)
  }, [supabase, unitFilter, categoryFilter, searchQuery])

  useEffect(() => {
    fetchSignatures()
  }, [fetchSignatures])

  return (
    <div className={styles.container}>
      {/* Unit Toggle */}
      <div className={styles.unitToggle}>
        <button
          className={`${styles.unitBtn} ${unitFilter === 'all' ? styles.active : ''}`}
          onClick={() => setUnitFilter('all')}
        >
          ALL
        </button>
        <button
          className={`${styles.unitBtn} ${unitFilter === 'excel' ? styles.active : ''}`}
          onClick={() => setUnitFilter('excel')}
        >
          EXCEL
        </button>
        <button
          className={`${styles.unitBtn} ${styles.crewBtn} ${unitFilter === 'crew' ? styles.active : ''}`}
          onClick={() => setUnitFilter('crew')}
        >
          CREW
        </button>
      </div>

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
