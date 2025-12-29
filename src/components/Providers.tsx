'use client'

import { ThemeProvider } from '@/lib/context/ThemeContext'

export default function Providers({ children }: { children: React.ReactNode }) {
  return <ThemeProvider>{children}</ThemeProvider>
}
