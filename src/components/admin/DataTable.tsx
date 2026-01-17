'use client'

import { useState, useMemo } from 'react'
import {
  Table,
  TextInput,
  ScrollArea,
  Pagination,
  Menu,
  ActionIcon,
  Text,
  Group,
  Center,
  Loader,
  Paper,
  UnstyledButton,
  rem,
} from '@mantine/core'
import {
  IconSearch,
  IconChevronUp,
  IconChevronDown,
  IconSelector,
  IconDotsVertical,
  IconEye,
  IconEdit,
  IconTrash,
} from '@tabler/icons-react'
import { cn } from '@/lib/utils'

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

// 중첩 객체 값 가져오기
function getNestedValue(obj: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce((acc, part) => {
    if (acc && typeof acc === 'object') {
      return (acc as Record<string, unknown>)[part]
    }
    return undefined
  }, obj as unknown)
}

// 테이블 헤더 컴포넌트
interface ThProps {
  children: React.ReactNode
  reversed: boolean
  sorted: boolean
  onSort: () => void
  sortable: boolean
  width?: string
}

function Th({ children, reversed, sorted, onSort, sortable, width }: ThProps) {
  const Icon = sorted ? (reversed ? IconChevronUp : IconChevronDown) : IconSelector

  return (
    <Table.Th style={{ width }}>
      {sortable ? (
        <UnstyledButton onClick={onSort} className="w-full">
          <Group justify="space-between" gap="xs">
            <Text fw={600} size="xs" tt="uppercase" c="dimmed">
              {children}
            </Text>
            <Center>
              <Icon style={{ width: rem(16), height: rem(16) }} />
            </Center>
          </Group>
        </UnstyledButton>
      ) : (
        <Text fw={600} size="xs" tt="uppercase" c="dimmed">
          {children}
        </Text>
      )}
    </Table.Th>
  )
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
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<string | null>(null)
  const [reverseSortDirection, setReverseSortDirection] = useState(false)
  const [activePage, setActivePage] = useState(1)

  const hasActions = onEdit || onDelete || onView

  // 정렬 핸들러
  const setSorting = (field: string) => {
    const reversed = field === sortBy ? !reverseSortDirection : false
    setReverseSortDirection(reversed)
    setSortBy(field)
  }

  // 필터링 및 정렬된 데이터
  const processedData = useMemo(() => {
    let filtered = [...data]

    // 검색 필터
    if (search) {
      filtered = filtered.filter((item) =>
        columns.some((col) => {
          const value = getNestedValue(item as Record<string, unknown>, col.key as string)
          return String(value).toLowerCase().includes(search.toLowerCase())
        })
      )
    }

    // 정렬
    if (sortBy) {
      filtered.sort((a, b) => {
        const aValue = getNestedValue(a as Record<string, unknown>, sortBy)
        const bValue = getNestedValue(b as Record<string, unknown>, sortBy)

        if ((aValue as string | number) < (bValue as string | number)) {
          return reverseSortDirection ? 1 : -1
        }
        if ((aValue as string | number) > (bValue as string | number)) {
          return reverseSortDirection ? -1 : 1
        }
        return 0
      })
    }

    return filtered
  }, [data, search, sortBy, reverseSortDirection, columns])

  // 페이지네이션
  const totalPages = Math.ceil(processedData.length / itemsPerPage)
  const paginatedData = processedData.slice(
    (activePage - 1) * itemsPerPage,
    activePage * itemsPerPage
  )

  // 검색 시 페이지 리셋
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.currentTarget.value)
    setActivePage(1)
  }

  // 테이블 행 렌더링
  const rows = paginatedData.map((item) => (
    <Table.Tr key={item.id}>
      {columns.map((col) => (
        <Table.Td key={col.key as string}>
          {col.render
            ? col.render(item)
            : String(getNestedValue(item as Record<string, unknown>, col.key as string) ?? '-')}
        </Table.Td>
      ))}
      {hasActions && (
        <Table.Td>
          <Group justify="center">
            <Menu shadow="md" width={140} position="bottom-end">
              <Menu.Target>
                <ActionIcon variant="subtle" color="gray" size="sm">
                  <IconDotsVertical size={16} />
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                {onView && (
                  <Menu.Item
                    leftSection={<IconEye size={14} />}
                    onClick={() => onView(item)}
                  >
                    보기
                  </Menu.Item>
                )}
                {onEdit && (
                  <Menu.Item
                    leftSection={<IconEdit size={14} />}
                    onClick={() => onEdit(item)}
                  >
                    수정
                  </Menu.Item>
                )}
                {onDelete && (
                  <Menu.Item
                    leftSection={<IconTrash size={14} />}
                    color="red"
                    onClick={() => onDelete(item)}
                  >
                    삭제
                  </Menu.Item>
                )}
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Table.Td>
      )}
    </Table.Tr>
  ))

  return (
    <Paper withBorder radius="md" p={0}>
      {/* 검색 툴바 */}
      {searchable && (
        <Group justify="space-between" p="md" style={{ borderBottom: '1px solid var(--card-border)' }}>
          <TextInput
            placeholder={searchPlaceholder}
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={handleSearchChange}
            style={{ maxWidth: 300 }}
          />
          <Text size="sm" c="dimmed">
            총 {processedData.length}개
          </Text>
        </Group>
      )}

      {/* 테이블 */}
      <ScrollArea>
        <Table striped highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
          <Table.Thead>
            <Table.Tr>
              {columns.map((col) => (
                <Th
                  key={col.key as string}
                  sorted={sortBy === col.key}
                  reversed={reverseSortDirection}
                  onSort={() => setSorting(col.key as string)}
                  sortable={col.sortable !== false}
                  width={col.width}
                >
                  {col.header}
                </Th>
              ))}
              {hasActions && (
                <Table.Th style={{ width: 80, textAlign: 'center' }}>
                  <Text fw={600} size="xs" tt="uppercase" c="dimmed">
                    작업
                  </Text>
                </Table.Th>
              )}
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {isLoading ? (
              <Table.Tr>
                <Table.Td colSpan={columns.length + (hasActions ? 1 : 0)}>
                  <Center py="xl">
                    <Loader color="pink" size="md" />
                    <Text ml="md" c="dimmed">
                      데이터를 불러오는 중...
                    </Text>
                  </Center>
                </Table.Td>
              </Table.Tr>
            ) : rows.length === 0 ? (
              <Table.Tr>
                <Table.Td colSpan={columns.length + (hasActions ? 1 : 0)}>
                  <Center py="xl">
                    <Text c="dimmed">데이터가 없습니다</Text>
                  </Center>
                </Table.Td>
              </Table.Tr>
            ) : (
              rows
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      {/* 페이지네이션 */}
      {totalPages > 1 && (
        <Group justify="center" p="md" style={{ borderTop: '1px solid var(--card-border)' }}>
          <Pagination
            value={activePage}
            onChange={setActivePage}
            total={totalPages}
            color="pink"
            size="sm"
            withEdges
          />
        </Group>
      )}
    </Paper>
  )
}
