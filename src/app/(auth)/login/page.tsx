'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuth } from '@/lib/hooks/useAuth'
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react'
import styles from './page.module.css'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const { signIn, isAuthenticated, isLoading: authLoading } = useAuth()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push(redirect)
    }
  }, [isAuthenticated, authLoading, router, redirect])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const { error } = await signIn(email, password)
      if (error) {
        setError(error.message === 'Invalid login credentials'
          ? '이메일 또는 비밀번호가 올바르지 않습니다.'
          : error.message)
      } else {
        router.push(redirect)
      }
    } catch {
      setError('로그인 중 오류가 발생했습니다.')
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return (
      <main className={styles.main}>
        <div className={styles.loading}>
          <Loader2 className={styles.spinner} />
        </div>
      </main>
    )
  }

  return (
    <main className={styles.main}>
      <div className={styles.container}>
        <div className={styles.header}>
          <Link href="/" className={styles.logo}>
            RG FAMILY
          </Link>
          <h1 className={styles.title}>로그인</h1>
          <p className={styles.subtitle}>RG 패밀리에 오신 것을 환영합니다</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && (
            <div className={styles.error}>
              {error}
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.label}>이메일 / 아이디</label>
            <div className={styles.inputWrapper}>
              <Mail className={styles.inputIcon} />
              <input
                id="email"
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="이메일 또는 아이디"
                className={styles.input}
                required
                autoComplete="username"
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.label}>비밀번호</label>
            <div className={styles.inputWrapper}>
              <Lock className={styles.inputIcon} />
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                className={styles.input}
                required
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className={styles.togglePassword}
                tabIndex={-1}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className={styles.buttonSpinner} />
                로그인 중...
              </>
            ) : (
              '로그인'
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <p>
            아직 계정이 없으신가요?{' '}
            <Link href="/signup" className={styles.link}>
              회원가입
            </Link>
          </p>
        </div>
      </div>
    </main>
  )
}
