/**
 * API 응답 타입
 *
 * 서버 응답 형식 및 페이지네이션 타입 정의
 */

/** 표준 API 응답 형식 */
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  success: boolean
}

/** 페이지네이션 응답 형식 */
export interface PaginatedResponse<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}
