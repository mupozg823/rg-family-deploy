'use client'

import { useState, useEffect, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Filter, X, User } from 'lucide-react'
import { useSupabase } from '@/lib/hooks/useSupabase'
import { mockSignatures } from '@/lib/mock/data'
import { USE_MOCK_DATA } from '@/lib/config'
import SigCard from './SigCard'
import SigVideoModal from './SigVideoModal'
import type { SignatureItem, UnitFilter, SortOrder } from '@/types/common'
import styles from './SigGallery.module.css'

export default function SigGallery() {
  const supabase = useSupabase()
  const [signatures, setSignatures] = useState<SignatureItem[]>([])
  const [allSignatures, setAllSignatures] = useState<SignatureItem[]>([])
  const [selectedSig, setSelectedSig] = useState<SignatureItem | null>(null)
  const [unitFilter, setUnitFilter] = useState<UnitFilter>('all')
  const [memberFilter, setMemberFilter] = useState<string>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('latest')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const [allTags, setAllTags] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 멤버 목록 추출 (현재 유닛에 맞게 필터링)
  const memberList = useMemo(() => {
    const members = new Set<string>()
    allSignatures
      .filter(sig => unitFilter === 'all' || sig.unit === unitFilter)
      .forEach(sig => members.add(sig.memberName))
    return Array.from(members).sort()
  }, [allSignatures, unitFilter])

  const fetchSignatures = useCallback(async () => {
    setIsLoading(true)

    if (USE_MOCK_DATA) {
      const allData = mockSignatures.map(sig => ({
        id: sig.id,
        title: sig.title,
        description: sig.description,
        unit: sig.unit,
        memberName: sig.member_name,
        mediaType: sig.media_type as 'video' | 'gif' | 'image',
        mediaUrl: sig.media_url,
        thumbnailUrl: sig.thumbnail_url,
        tags: sig.tags || [],
        viewCount: sig.view_count,
        isFeatured: sig.is_featured,
      }))

      // 전체 데이터 저장 (멤버 목록용)
      setAllSignatures(allData)

      let filtered = [...allData]

      // Unit 필터
      if (unitFilter !== 'all') {
        filtered = filtered.filter(sig => sig.unit === unitFilter)
      }

      // 멤버 필터
      if (memberFilter !== 'all') {
        filtered = filtered.filter(sig => sig.memberName === memberFilter)
      }

      // 검색 필터
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        filtered = filtered.filter(sig =>
          sig.title.toLowerCase().includes(query) ||
          sig.memberName.toLowerCase().includes(query) ||
          (sig.description?.toLowerCase().includes(query) ?? false)
        )
      }

      // 정렬
      if (sortOrder === 'latest') {
        filtered.sort((a, b) => b.id - a.id)
      } else if (sortOrder === 'popular') {
        filtered.sort((a, b) => b.viewCount - a.viewCount)
      } else {
        filtered.sort((a, b) => a.id - b.id)
      }

      // 태그 필터
      if (selectedTags.length > 0) {
        filtered = filtered.filter(sig =>
          selectedTags.some(tag => sig.tags.includes(tag))
        )
      }

      setSignatures(filtered)

      // 모든 태그 수집
      const tags = new Set<string>()
      mockSignatures.forEach(sig => {
        sig.tags?.forEach((tag: string) => tags.add(tag))
      })
      setAllTags(Array.from(tags))

      setIsLoading(false)
      return
    }

    let query = supabase
      .from('signatures')
      .select('*')

    if (unitFilter !== 'all') {
      query = query.eq('unit', unitFilter)
    }

    if (memberFilter !== 'all') {
      query = query.eq('member_name', memberFilter)
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

    const allData = (data || []).map(sig => ({
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

    // 전체 데이터 저장 (멤버 목록용)
    setAllSignatures(allData)

    let filtered = [...allData]

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
  }, [supabase, unitFilter, memberFilter, searchQuery, sortOrder, selectedTags])

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
              onClick={() => {
                setUnitFilter(unit)
                setMemberFilter('all') // 유닛 변경시 멤버 필터 초기화
              }}
              className={`${styles.unitTab} ${unitFilter === unit ? styles.active : ''}`}
              data-unit={unit}
            >
              {unit === 'all' ? '전체' : unit === 'excel' ? '엑셀부' : '크루부'}
            </button>
          ))}
        </div>

        {/* Member Filter Dropdown */}
        <div className={styles.memberFilter}>
          <User size={16} className={styles.memberIcon} />
          <select
            value={memberFilter}
            onChange={(e) => setMemberFilter(e.target.value)}
            className={styles.memberSelect}
          >
            <option value="all">전체 멤버</option>
            {memberList.map((member) => (
              <option key={member} value={member}>
                {member}
              </option>
            ))}
          </select>
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
