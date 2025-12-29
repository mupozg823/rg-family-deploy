'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, X } from 'lucide-react'
import { useSupabase } from '@/lib/hooks/useSupabase'
import SigCard from './SigCard'
import SigVideoModal from './SigVideoModal'
import type { SignatureItem, UnitFilter, SortOrder } from '@/types/common'
import styles from './SigGallery.module.css'

export default function SigGallery() {
  const supabase = useSupabase()
  const [signatures, setSignatures] = useState<SignatureItem[]>([])
  const [selectedSig, setSelectedSig] = useState<SignatureItem | null>(null)
  const [unitFilter, setUnitFilter] = useState<UnitFilter>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('latest')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [allTags, setAllTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchSignatures = useCallback(async () => {
    setIsLoading(true)

    let query = supabase
      .from('signatures')
      .select('*')

    if (unitFilter !== 'all') {
      query = query.eq('unit', unitFilter)
    }

    if (searchQuery) {
      query = query.or(`title.ilike.%${searchQuery}%,member_name.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`)
    }

    if (sortOrder === 'latest') {
      query = query.order('created_at', { ascending: false })
    } else if (sortOrder === 'popular') {
      query = query.order('view_count', { ascending: false })
    } else {
      query = query.order('created_at', { ascending: true })
    }

    const { data, error } = await query

    if (error) {
      console.error('시그 로드 실패:', error)
      setIsLoading(false)
      return
    }

    let filtered = (data || []).map(sig => ({
      id: sig.id,
      title: sig.title,
      description: sig.description,
      unit: sig.unit,
      memberName: sig.member_name,
      mediaType: sig.media_type,
      mediaUrl: sig.media_url,
      thumbnailUrl: sig.thumbnail_url,
      tags: sig.tags || [],
      viewCount: sig.view_count,
      isFeatured: sig.is_featured,
    }))

    // 태그 필터
    if (selectedTags.length > 0) {
      filtered = filtered.filter(sig =>
        selectedTags.some(tag => sig.tags.includes(tag))
      )
    }

    setSignatures(filtered)

    // 모든 태그 수집
    const tags = new Set<string>()
    data?.forEach(sig => {
      sig.tags?.forEach((tag: string) => tags.add(tag))
    })
    setAllTags(Array.from(tags))

    setIsLoading(false)
  }, [supabase, unitFilter, searchQuery, sortOrder, selectedTags])

  useEffect(() => {
    fetchSignatures()
  }, [fetchSignatures])

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag)
        ? prev.filter(t => t !== tag)
        : [...prev, tag]
    )
  }

  return (
    <div className={styles.container}>
      {/* Filters */}
      <div className={styles.filters}>
        {/* Unit Tabs */}
        <div className={styles.unitTabs}>
          {(['all', 'excel', 'crew'] as const).map((unit) => (
            <button
              key={unit}
              onClick={() => setUnitFilter(unit)}
              className={`${styles.unitTab} ${unitFilter === unit ? styles.active : ''}`}
              data-unit={unit}
            >
              {unit === 'all' ? '전체' : unit === 'excel' ? '엑셀부' : '크루부'}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className={styles.searchWrapper}>
          <Search size={18} className={styles.searchIcon} />
          <input
            type="text"
            placeholder="시그니처 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={styles.searchInput}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className={styles.clearSearch}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Sort */}
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as SortOrder)}
          className={styles.sortSelect}
        >
          <option value="latest">최신순</option>
          <option value="popular">인기순</option>
          <option value="oldest">오래된순</option>
        </select>
      </div>

      {/* Tags */}
      {allTags.length > 0 && (
        <div className={styles.tagsFilter}>
          <Filter size={16} />
          <div className={styles.tagsList}>
            {allTags.map((tag) => (
              <button
                key={tag}
                onClick={() => toggleTag(tag)}
                className={`${styles.tagButton} ${selectedTags.includes(tag) ? styles.active : ''}`}
              >
                #{tag}
              </button>
            ))}
          </div>
          {selectedTags.length > 0 && (
            <button
              onClick={() => setSelectedTags([])}
              className={styles.clearTags}
            >
              초기화
            </button>
          )}
        </div>
      )}

      {/* Gallery Grid */}
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
        <motion.div
          className={styles.grid}
          layout
        >
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

      {/* Video Modal */}
      <AnimatePresence>
        {selectedSig && (
          <SigVideoModal
            signature={selectedSig}
            onClose={() => setSelectedSig(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
