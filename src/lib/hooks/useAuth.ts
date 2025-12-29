'use client'

import { useEffect, useState, useCallback } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { useSupabase } from './useSupabase'
import type { Profile, Role } from '@/types/database'

interface AuthState {
  user: User | null
  profile: Profile | null
  session: Session | null
  isLoading: boolean
  isAuthenticated: boolean
}

export function useAuth() {
  const supabase = useSupabase()
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
  })

  const fetchProfile = useCallback(async (userId: string) => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()
    return data
  }, [supabase])

  useEffect(() => {
    // 초기 세션 확인
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

    // 인증 상태 변경 리스너
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

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    hasRole,
    isAdmin,
    isModerator,
    isVip,
  }
}
