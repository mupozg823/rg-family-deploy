'use client'

/**
 * Root Providers
 *
 * Clean Architecture Provider 합성
 * 순서: Mantine → Supabase → Auth → DataProvider → Theme
 *
 * 의존성 그래프:
 * MantineProvider (독립적, CSS 스타일 제공)
 *   └── SupabaseProvider
 *       └── AuthProvider (supabase 필요)
 *           └── DataProviderProvider (supabase 필요)
 *               └── ThemeProvider (독립적)
 */

import { MantineProvider, createTheme } from '@mantine/core'
import { ModalsProvider } from '@mantine/modals'
import { Notifications } from '@mantine/notifications'
import '@mantine/core/styles.css'
import '@mantine/notifications/styles.css'
import '@mantine/dates/styles.css'

import {
  SupabaseProvider,
  AuthProvider,
  DataProviderProvider,
  ThemeProvider,
} from '@/lib/context'

// RG Family Mantine Theme
const mantineTheme = createTheme({
  primaryColor: 'pink',
  colors: {
    pink: [
      '#fff0f6',
      '#ffdeeb',
      '#fcc2d7',
      '#faa2c1',
      '#fd68ba', // primary
      '#fb37a3', // deep
      '#e64980',
      '#d6336c',
      '#c2255c',
      '#a61e4d',
    ],
    dark: [
      '#C1C2C5',
      '#A6A7AB',
      '#909296',
      '#5c5f66',
      '#373A40',
      '#2C2E33',
      '#25262b',
      '#1A1B1E',
      '#141517',
      '#101113',
    ],
  },
  fontFamily: '"Noto Sans KR", -apple-system, BlinkMacSystemFont, sans-serif',
  headings: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  defaultRadius: 'md',
  cursorType: 'pointer',
})

interface ProvidersProps {
  children: React.ReactNode
}

export default function Providers({ children }: ProvidersProps) {
  return (
    <MantineProvider theme={mantineTheme} defaultColorScheme="dark">
      <ModalsProvider>
        <Notifications position="top-right" />
        <SupabaseProvider>
          <AuthProvider>
            <DataProviderProvider>
              <ThemeProvider>
                {children}
              </ThemeProvider>
            </DataProviderProvider>
          </AuthProvider>
        </SupabaseProvider>
      </ModalsProvider>
    </MantineProvider>
  )
}
