'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { Pin, Search, Eye, ChevronDown, Bell } from 'lucide-react'
import Navbar from '@/components/Navbar'
import Footer from '@/components/Footer'
import { Pagination } from '@/components/common'
import { useNotices } from '@/lib/context'
import { formatShortDate } from '@/lib/utils/format'
import styles from './page.module.css'

interface NoticeItem {
  id: number
  title: string
  isPinned: boolean
  isImportant: boolean
  createdAt: string
  author: string
  viewCount: number
  category: string
}

const ITEMS_PER_PAGE = 20

const CATEGORY_LABELS: Record<string, string> = {
  official: '공식',
  excel: '엑셀부',
  crew: '크루부',
}

const CATEGORY_KEYS: Record<string, string> = {
  '전체': 'all',
  '공식': 'official',
  '엑셀부': 'excel',
  '크루부': 'crew',
}

function isNew(dateStr: string): boolean {
  const postDate = new Date(dateStr)
  const now = new Date()
  const diffDays = (now.getTime() - postDate.getTime()) / (1000 * 60 * 60 * 24)
  return diffDays <= 3
}

function mapNotice(n: { id: number; title: string; is_pinned: boolean; created_at: string; view_count?: number; category: string }): NoticeItem {
  return {
    id: n.id,
    title: n.title,
    isPinned: n.is_pinned,
    isImportant: n.is_pinned,
    createdAt: n.created_at,
    author: '운영자',
    viewCount: n.view_count || 0,
    category: CATEGORY_LABELS[n.category] || n.category,
  }
}

export default function NoticePage() {
  const noticesRepo = useNotices()
  const [notices, setNotices] = useState<NoticeItem[]>([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(1)
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [searchType, setSearchType] = useState<'all' | 'title'>('all')
  const [filterCategory, setFilterCategory] = useState<string>('all')

  const categories = ['전체', '공식', '엑셀부', '크루부']

  const fetchNotices = useCallback(async (page: number, query?: string) => {
    setIsLoading(true)

    const categoryKey = filterCategory === 'all' ? undefined : filterCategory

    if (query) {
      const result = await noticesRepo.search(query, {
        page,
        limit: ITEMS_PER_PAGE,
        searchType,
        category: categoryKey,
      })
      setNotices(result.data.map(mapNotice))
      setTotalCount(result.totalCount)
      setTotalPages(result.totalPages)
    } else {
      const result = await noticesRepo.findPaginated({
        page,
        limit: ITEMS_PER_PAGE,
        category: categoryKey,
      })
      setNotices(result.data.map(mapNotice))
      setTotalCount(result.totalCount)
      setTotalPages(result.totalPages)
    }

    setIsLoading(false)
  }, [noticesRepo, filterCategory, searchType])

  useEffect(() => {
    void fetchNotices(currentPage, searchQuery)
  }, [fetchNotices, currentPage, searchQuery])

  const handleSearch = () => {
    setSearchQuery(searchInput)
    setCurrentPage(1)
  }

  const handleCategoryChange = (cat: string) => {
    const key = CATEGORY_KEYS[cat] || 'all'
    setFilterCategory(key)
    setCurrentPage(1)
  }

  const handlePageChange = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // 고정글과 일반글 분리
  const pinnedNotices = notices.filter(n => n.isPinned)
  const normalNotices = notices.filter(n => !n.isPinned)

  return (
      <div className={styles.main}>
        <Navbar />
        {/* Hero Section */}
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <div className={styles.heroIcon}>
              <Bell size={32} />
            </div>
            <h1 className={styles.title}>공지사항</h1>
            <p className={styles.subtitle}>RG FAMILY 공식 공지 및 소식</p>
          </div>
        </section>

      <div className={styles.container}>
        {/* Board Header */}
        <div className={styles.boardHeader}>
          {/* Left: Stats & Category Filter */}
          <div className={styles.boardLeft}>
            <span className={styles.totalCount}>
              전체 <strong>{totalCount}</strong>건
            </span>
            <div className={styles.categoryTabs}>
              {categories.map(cat => (
                <button
                  key={cat}
                  className={`${styles.categoryTab} ${((filterCategory === 'all' && cat === '전체') || filterCategory === CATEGORY_KEYS[cat]) ? styles.active : ''}`}
                  onClick={() => handleCategoryChange(cat)}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Right: Search */}
          <div className={styles.searchArea}>
            <div className={styles.searchTypeSelect}>
              <select
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as 'all' | 'title')}
                className={styles.select}
              >
                <option value="all">전체</option>
                <option value="title">제목</option>
              </select>
              <ChevronDown size={14} className={styles.selectIcon} />
            </div>
            <div className={styles.searchBox}>
              <input
                type="text"
                className={styles.searchInput}
                placeholder="검색어 입력"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              />
              <button className={styles.searchBtn} onClick={handleSearch}>
                <Search size={16} />
              </button>
            </div>
          </div>
        </div>

        {isLoading ? (
          <div className={styles.loading}>
            <div className={styles.spinner} />
            <span>공지사항을 불러오는 중...</span>
          </div>
        ) : notices.length === 0 ? (
          <div className={styles.empty}>
            <p>등록된 공지사항이 없습니다</p>
          </div>
        ) : (
          <>
            {/* Board Table */}
            <div className={styles.board}>
              {/* Table Header */}
              <div className={styles.tableHeader}>
                <span className={styles.colNumber}>번호</span>
                <span className={styles.colCategory}>분류</span>
                <span className={styles.colTitle}>제목</span>
                <span className={styles.colAuthor}>작성자</span>
                <span className={styles.colDate}>작성일</span>
                <span className={styles.colViews}>조회</span>
              </div>

              {/* Pinned Notices */}
              {pinnedNotices.length > 0 && (
                <div className={styles.pinnedSection}>
                  {pinnedNotices.map((notice) => (
                    <Link
                      key={notice.id}
                      href={`/notice/${notice.id}`}
                      className={`${styles.row} ${styles.pinned}`}
                    >
                      {/* Badge */}
                      <div className={styles.cellNumber}>
                        <span className={styles.pinnedBadge}>
                          <Pin size={12} />
                          공지
                        </span>
                      </div>

                      {/* Category */}
                      <div className={styles.cellCategory}>
                        <span className={`${styles.categoryBadge} ${notice.isImportant ? styles.important : ''}`}>
                          {notice.category}
                        </span>
                      </div>

                      {/* Title */}
                      <div className={styles.cellTitle}>
                        <h3 className={styles.postTitle}>{notice.title}</h3>
                        {isNew(notice.createdAt) && (
                          <span className={styles.newBadge}>N</span>
                        )}
                        {notice.isImportant && (
                          <span className={styles.importantBadge}>중요</span>
                        )}
                      </div>

                      {/* Author */}
                      <span className={styles.cellAuthor}>{notice.author}</span>

                      {/* Date */}
                      <span className={styles.cellDate}>
                        {formatShortDate(notice.createdAt)}
                      </span>

                      {/* Views */}
                      <span className={styles.cellViews}>
                        {notice.viewCount.toLocaleString()}
                      </span>
                    </Link>
                  ))}
                </div>
              )}

              {/* Normal Notices */}
              <div className={styles.tableBody}>
                {normalNotices.map((notice, index) => (
                  <Link
                    key={notice.id}
                    href={`/notice/${notice.id}`}
                    className={styles.row}
                  >
                    {/* Number */}
                    <div className={styles.cellNumber}>
                      {normalNotices.length - index}
                    </div>

                    {/* Category */}
                    <div className={styles.cellCategory}>
                      <span className={styles.categoryBadge}>{notice.category}</span>
                    </div>

                    {/* Title */}
                    <div className={styles.cellTitle}>
                      <h3 className={styles.postTitle}>{notice.title}</h3>
                      {isNew(notice.createdAt) && (
                        <span className={styles.newBadge}>N</span>
                      )}
                    </div>

                    {/* Author */}
                    <span className={styles.cellAuthor}>{notice.author}</span>

                    {/* Date */}
                    <span className={styles.cellDate}>
                      {formatShortDate(notice.createdAt)}
                    </span>

                    {/* Views */}
                    <span className={styles.cellViews}>
                      {notice.viewCount.toLocaleString()}
                    </span>
                  </Link>
                ))}
              </div>
            </div>

            {/* Mobile List */}
            <div className={styles.mobileList}>
              {/* Pinned */}
              {pinnedNotices.map((notice) => (
                <Link
                  key={notice.id}
                  href={`/notice/${notice.id}`}
                  className={`${styles.mobileCard} ${styles.mobilePinned}`}
                >
                  <div className={styles.mobileHeader}>
                    <span className={styles.mobilePinnedBadge}>
                      <Pin size={10} /> 공지
                    </span>
                    <span className={styles.mobileCategoryBadge}>{notice.category}</span>
                    {isNew(notice.createdAt) && <span className={styles.newBadge}>N</span>}
                    {notice.isImportant && <span className={styles.importantBadge}>중요</span>}
                  </div>
                  <h3 className={styles.mobileTitle}>{notice.title}</h3>
                  <div className={styles.mobileMeta}>
                    <span>{notice.author}</span>
                    <span className={styles.mobileDivider}>·</span>
                    <span>{formatShortDate(notice.createdAt)}</span>
                    <span className={styles.mobileDivider}>·</span>
                    <span className={styles.mobileViews}>
                      <Eye size={12} /> {notice.viewCount}
                    </span>
                  </div>
                </Link>
              ))}
              {/* Normal */}
              {normalNotices.map((notice) => (
                <Link
                  key={notice.id}
                  href={`/notice/${notice.id}`}
                  className={styles.mobileCard}
                >
                  <div className={styles.mobileHeader}>
                    <span className={styles.mobileCategoryBadge}>{notice.category}</span>
                    {isNew(notice.createdAt) && <span className={styles.newBadge}>N</span>}
                  </div>
                  <h3 className={styles.mobileTitle}>{notice.title}</h3>
                  <div className={styles.mobileMeta}>
                    <span>{notice.author}</span>
                    <span className={styles.mobileDivider}>·</span>
                    <span>{formatShortDate(notice.createdAt)}</span>
                    <span className={styles.mobileDivider}>·</span>
                    <span className={styles.mobileViews}>
                      <Eye size={12} /> {notice.viewCount}
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            <Pagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
            />
          </>
        )}
        </div>
        <Footer />
      </div>
  )
}
