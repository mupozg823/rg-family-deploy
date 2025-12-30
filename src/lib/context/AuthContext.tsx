'use client'

/**
 * Auth Context
 *
 * 전역 인증 상태 관리
 * - 사용자 세션/프로필 공유
 * - 권한 체크 헬퍼
 * - 로그인/로그아웃 액션
 */

import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from 'react'
import { User, Session, AuthError, AuthResponse } from '@supabase/supabase-js'
import { useSupabaseContext } from './SupabaseContext'
import { USE_MOCK_DATA } from '@/lib/config'
import { mockAdminProfile } from '@/lib/mock'
import type { Profile, Role } from '@/types/database'

// Mock Admin 계정 정보
const MOCK_ADMIN_CREDENTIALS = {
  username: 'admin',
  password: 'admin',
}

interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
}

interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ data: AuthResponse['data']; error: AuthError | null }>
  signUp: (email: string, password: string, nickname: string) => Promise<{ data: AuthResponse['data']; error: AuthError | null }>
  signOut: () => Promise<{ error: AuthError | null }>
  hasRole: (roles: Role | Role[]) => boolean
  isAdmin: () => boolean
  isModerator: () => boolean
  isVip: () => boolean
}

type AuthContextType = AuthState & AuthActions

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const supabase = useSupabaseContext()
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  })

  const fetchProfile = useCallback(async (userId: string): Promise<Profile | null> => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return data
  }, [supabase])

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession()

      if (session?.user) {
        const profile = await fetchProfile(session.user.id)
        setState({
          user: session.user,
          profile,
          session,
          isLoading: false,
          isAuthenticated: true,
        })
      } else {
        setState(prev => ({ ...prev, isLoading: false }))
      }
    }

    initAuth()

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const profile = await fetchProfile(session.user.id)
          setState({
            user: session.user,
            profile,
            session,
            isLoading: false,
            isAuthenticated: true,
          })
        } else {
          setState({
            user: null,
            profile: null,
            session: null,
            isLoading: false,
            isAuthenticated: false,
          })
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [supabase, fetchProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    // Mock 모드에서 admin/admin 계정 처리
    if (USE_MOCK_DATA) {
      const isAdminLogin =
        (email === MOCK_ADMIN_CREDENTIALS.username || email === 'admin@rgfamily.com') &&
        password === MOCK_ADMIN_CREDENTIALS.password

      if (isAdminLogin) {
        // Mock admin 사용자 생성
        const mockUser: User = {
          id: mockAdminProfile.id,
          email: mockAdminProfile.email || 'admin@rgfamily.com',
          app_metadata: {},
          user_metadata: { nickname: mockAdminProfile.nickname },
          aud: 'authenticated',
          created_at: mockAdminProfile.created_at,
        } as User

        const mockSession: Session = {
          access_token: 'mock-admin-token',
          refresh_token: 'mock-refresh-token',
          expires_in: 3600,
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: 'bearer',
          user: mockUser,
        } as Session

        setState({
          user: mockUser,
          profile: mockAdminProfile,
          session: mockSession,
          isLoading: false,
          isAuthenticated: true,
        })

        return {
          data: { user: mockUser, session: mockSession },
          error: null,
        }
      }

      // Mock 모드에서 다른 계정은 에러 반환
      return {
        data: { user: null, session: null },
        error: { message: 'Invalid login credentials' } as AuthError,
      }
    }

    // 실제 Supabase 인증
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }, [supabase])

  const signUp = useCallback(async (email: string, password: string, nickname: string) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { nickname },
      },
    })
    return { data, error }
  }, [supabase])

  const signOut = useCallback(async () => {
    // Mock 모드에서 로그아웃 처리
    if (USE_MOCK_DATA) {
      setState({
        user: null,
        profile: null,
        session: null,
        isLoading: false,
        isAuthenticated: false,
      })
      return { error: null }
    }

    const { error } = await supabase.auth.signOut()
    return { error }
  }, [supabase])

  const hasRole = useCallback((roles: Role | Role[]): boolean => {
    if (!state.profile) return false
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(state.profile.role)
  }, [state.profile])

  const isAdmin = useCallback(() => {
    return hasRole(['admin', 'superadmin'])
  }, [hasRole])

  const isModerator = useCallback(() => {
    return hasRole(['moderator', 'admin', 'superadmin'])
  }, [hasRole])

  const isVip = useCallback(() => {
    return hasRole(['vip', 'moderator', 'admin', 'superadmin'])
  }, [hasRole])

  const value: AuthContextType = {
    ...state,
    signIn,
    signUp,
    signOut,
    hasRole,
    isAdmin,
    isModerator,
    isVip,
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuthContext() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider')
  }
  return context
}
