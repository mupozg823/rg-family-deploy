'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ChevronUp,
  ChevronDown,
  Search,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  Trash2,
  Edit,
  Eye,
} from 'lucide-react'
import styles from './DataTable.module.css'

export interface Column<T> {
  key: keyof T | string
  header: string
  width?: string
  render?: (item: T) => React.ReactNode
  sortable?: boolean
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onView?: (item: T) => void
  searchable?: boolean
  searchPlaceholder?: string
  itemsPerPage?: number
  isLoading?: boolean
}

export default function DataTable<T extends { id: string | number }>({
  data,
  columns,
  onEdit,
  onDelete,
  onView,
  searchable = true,
  searchPlaceholder = '검색...',
  itemsPerPage = 10,
  isLoading = false,
}: DataTableProps<T>) {
  const [searchQuery, setSearchQuery] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')
  const [currentPage, setCurrentPage] = useState(1)
  const [openMenuId, setOpenMenuId] = useState<string | number | null>(null)

  // Filter data
  const filteredData = data.filter((item) => {
    if (!searchQuery) return true
    return columns.some((col) => {
      const value = getNestedValue(item, col.key as string)
      return String(value).toLowerCase().includes(searchQuery.toLowerCase())
    })
  })

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortKey) return 0
    const aValue = getNestedValue(a, sortKey)
    const bValue = getNestedValue(b, sortKey)

    if ((aValue as string | number) < (bValue as string | number)) return sortDirection === 'asc' ? -1 : 1
    if ((aValue as string | number) > (bValue as string | number)) return sortDirection === 'asc' ? 1 : -1
    return 0
  })

  // Paginate data
  const totalPages = Math.ceil(sortedData.length / itemsPerPage)
  const paginatedData = sortedData.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortKey(key)
      setSortDirection('asc')
    }
  }

  const hasActions = onEdit || onDelete || onView

  return (
    <div className={styles.container}>
      {/* Search */}
      {searchable && (
        <div className={styles.toolbar}>
          <div className={styles.searchWrapper}>
            <Search size={18} className={styles.searchIcon} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value)
                setCurrentPage(1)
              }}
              placeholder={searchPlaceholder}
              className={styles.searchInput}
            />
          </div>
          <span className={styles.resultCount}>
            총 {filteredData.length}개
          </span>
        </div>
      )}

      {/* Table */}
      <div className={styles.tableWrapper}>
        <table className={styles.table}>
          <thead>
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key as string}
                  style={{ width: col.width }}
                  className={col.sortable !== false ? styles.sortable : ''}
                  onClick={() => col.sortable !== false && handleSort(col.key as string)}
                >
                  <div className={styles.headerCell}>
                    <span>{col.header}</span>
                    {col.sortable !== false && sortKey === col.key && (
                      sortDirection === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />
                    )}
                  </div>
                </th>
              ))}
              {hasActions && <th className={styles.actionHeader}>작업</th>}
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={columns.length + (hasActions ? 1 : 0)} className={styles.loading}>
                  <div className={styles.spinner} />
                  <span>데이터를 불러오는 중...</span>
                </td>
              </tr>
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length + (hasActions ? 1 : 0)} className={styles.empty}>
                  데이터가 없습니다
                </td>
              </tr>
            ) : (
              paginatedData.map((item, index) => (
                <motion.tr
                  key={item.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  {columns.map((col) => (
                    <td key={col.key as string}>
                      {col.render
                        ? col.render(item)
                        : String(getNestedValue(item, col.key as string) ?? '-')}
                    </td>
                  ))}
                  {hasActions && (
                    <td className={styles.actionCell}>
                      <div className={styles.actionWrapper}>
                        <button
                          className={styles.actionButton}
                          onClick={() => setOpenMenuId(openMenuId === item.id ? null : item.id)}
                        >
                          <MoreHorizontal size={18} />
                        </button>
                        <AnimatePresence>
                          {openMenuId === item.id && (
                            <motion.div
                              className={styles.actionMenu}
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                            >
                              {onView && (
                                <button onClick={() => { onView(item); setOpenMenuId(null) }}>
                                  <Eye size={16} />
                                  <span>보기</span>
                                </button>
                              )}
                              {onEdit && (
                                <button onClick={() => { onEdit(item); setOpenMenuId(null) }}>
                                  <Edit size={16} />
                                  <span>수정</span>
                                </button>
                              )}
                              {onDelete && (
                                <button
                                  className={styles.deleteAction}
                                  onClick={() => { onDelete(item); setOpenMenuId(null) }}
                                >
                                  <Trash2 size={16} />
                                  <span>삭제</span>
                                </button>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </td>
                  )}
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className={styles.pagination}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={styles.pageButton}
          >
            <ChevronLeft size={18} />
          </button>
          <span className={styles.pageInfo}>
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className={styles.pageButton}
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  )
}

function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((acc, part) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, obj as unknown)
}
