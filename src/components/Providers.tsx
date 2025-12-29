'use client'

/**
 * Root Providers
 *
 * Clean Architecture Provider 합성
 * 순서: Supabase → Auth → DataProvider → Theme
 *
 * 의존성 그래프:
 * SupabaseProvider
 *   └── AuthProvider (supabase 필요)
 *       └── DataProviderProvider (supabase 필요)
 *           └── ThemeProvider (독립적)
 */

import {
  SupabaseProvider,
  AuthProvider,
  DataProviderProvider,
  ThemeProvider,
} from '@/lib/context'

interface ProvidersProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <SupabaseProvider>
      <AuthProvider>
        <DataProviderProvider>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </DataProviderProvider>
      </AuthProvider>
    </SupabaseProvider>
  )
}
