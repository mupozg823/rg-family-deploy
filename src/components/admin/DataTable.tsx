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
  Select,
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
  IconGripVertical,
} from '@tabler/icons-react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'

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
  /** 드래그앤드롭 활성화 */
  draggable?: boolean
  /** 드래그 완료 후 콜백 (새 순서의 아이템 배열) */
  onReorder?: (reorderedItems: T[]) => void
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

// Sortable Row 컴포넌트
interface SortableRowProps<T> {
  item: T
  columns: Column<T>[]
  hasActions: boolean
  onView?: (item: T) => void
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
}

function SortableRow<T extends { id: string | number }>({
  item,
  columns,
  hasActions,
  onView,
  onEdit,
  onDelete,
}: SortableRowProps<T>) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    background: isDragging ? 'var(--mantine-color-dark-6)' : undefined,
  }

  return (
    <Table.Tr
      ref={setNodeRef}
      style={{ ...style, cursor: onView ? 'pointer' : undefined }}
      onClick={() => onView?.(item)}
    >
      {/* Drag Handle */}
      <Table.Td style={{ width: 40 }}>
        <Center>
          <ActionIcon
            variant="subtle"
            color="gray"
            size="sm"
            style={{ cursor: 'grab' }}
            {...attributes}
            {...listeners}
          >
            <IconGripVertical size={16} />
          </ActionIcon>
        </Center>
      </Table.Td>
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
  )
}

const PAGE_SIZE_OPTIONS = [
  { value: 'all', label: '전체 보기' },
  { value: '5', label: '5개씩 보기' },
  { value: '10', label: '10개씩 보기' },
  { value: '20', label: '20개씩 보기' },
  { value: '50', label: '50개씩 보기' },
]

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
  draggable = false,
  onReorder,
}: DataTableProps<T>) {
  const [search, setSearch] = useState('')
  const [sortBy, setSortBy] = useState<string | null>(null)
  const [reverseSortDirection, setReverseSortDirection] = useState(false)
  const [activePage, setActivePage] = useState(1)

  // itemsPerPage가 옵션에 없으면 가장 가까운 값 선택
  const getInitialPageSize = () => {
    const value = String(itemsPerPage)
    const exists = PAGE_SIZE_OPTIONS.some(opt => opt.value === value)
    return exists ? value : '10'
  }
  const [pageSize, setPageSize] = useState<string>(getInitialPageSize())

  const hasActions = onEdit || onDelete || onView

  // DnD Sensors
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

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

    // 정렬 (드래그 모드에서는 정렬 비활성화)
    if (sortBy && !draggable) {
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
  }, [data, search, sortBy, reverseSortDirection, columns, draggable])

  // 페이지네이션
  const effectivePageSize = pageSize === 'all' ? processedData.length : parseInt(pageSize, 10)
  const totalPages = pageSize === 'all' ? 1 : Math.ceil(processedData.length / effectivePageSize)
  const paginatedData = pageSize === 'all'
    ? processedData
    : processedData.slice(
        (activePage - 1) * effectivePageSize,
        activePage * effectivePageSize
      )

  // 페이지 크기 변경 핸들러
  const handlePageSizeChange = (value: string | null) => {
    if (value) {
      setPageSize(value)
      setActivePage(1)
    }
  }

  // 검색 시 페이지 리셋
  const handleSearchChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(event.currentTarget.value)
    setActivePage(1)
  }

  // 드래그 완료 핸들러
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (!over || active.id === over.id) return

    const oldIndex = paginatedData.findIndex((item) => item.id === active.id)
    const newIndex = paginatedData.findIndex((item) => item.id === over.id)

    if (oldIndex === -1 || newIndex === -1) return

    const reordered = arrayMove(paginatedData, oldIndex, newIndex)
    onReorder?.(reordered)
  }

  // 일반 테이블 행 렌더링
  const rows = paginatedData.map((item) => (
    <Table.Tr
      key={item.id}
      style={{ cursor: onView ? 'pointer' : undefined }}
      onClick={() => onView?.(item)}
    >
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

  // 테이블 바디 렌더링
  const renderTableBody = () => {
    if (isLoading) {
      return (
        <Table.Tr>
          <Table.Td colSpan={columns.length + (hasActions ? 1 : 0) + (draggable ? 1 : 0)}>
            <Center py="xl">
              <Loader color="pink" size="md" />
              <Text ml="md" c="dimmed">
                데이터를 불러오는 중...
              </Text>
            </Center>
          </Table.Td>
        </Table.Tr>
      )
    }

    if (paginatedData.length === 0) {
      return (
        <Table.Tr>
          <Table.Td colSpan={columns.length + (hasActions ? 1 : 0) + (draggable ? 1 : 0)}>
            <Center py="xl">
              <Text c="dimmed">데이터가 없습니다</Text>
            </Center>
          </Table.Td>
        </Table.Tr>
      )
    }

    if (draggable) {
      return (
        <SortableContext
          items={paginatedData.map((item) => item.id)}
          strategy={verticalListSortingStrategy}
        >
          {paginatedData.map((item) => (
            <SortableRow
              key={item.id}
              item={item}
              columns={columns}
              hasActions={!!hasActions}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </SortableContext>
      )
    }

    return rows
  }

  const tableContent = (
    <Table striped highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
      <Table.Thead>
        <Table.Tr>
          {draggable && (
            <Table.Th style={{ width: 40 }}>
              <Text fw={600} size="xs" tt="uppercase" c="dimmed">

              </Text>
            </Table.Th>
          )}
          {columns.map((col) => (
            <Th
              key={col.key as string}
              sorted={sortBy === col.key}
              reversed={reverseSortDirection}
              onSort={() => setSorting(col.key as string)}
              sortable={col.sortable !== false && !draggable}
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
      <Table.Tbody>{renderTableBody()}</Table.Tbody>
    </Table>
  )

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
        {draggable ? (
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            {tableContent}
          </DndContext>
        ) : (
          tableContent
        )}
      </ScrollArea>

      {/* 페이지네이션 */}
      <Group justify="space-between" p="md" style={{ borderTop: '1px solid var(--card-border)' }}>
        <Select
          value={pageSize}
          onChange={handlePageSizeChange}
          data={PAGE_SIZE_OPTIONS}
          size="xs"
          style={{ width: 130 }}
        />
        {totalPages > 1 && (
          <Pagination
            value={activePage}
            onChange={setActivePage}
            total={totalPages}
            color="pink"
            size="sm"
            withEdges
          />
        )}
      </Group>
    </Paper>
  )
}
