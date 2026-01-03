'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useAuthContext } from '@/lib/context'
import {
  TextInput,
  PasswordInput,
  Button,
  Paper,
  Title,
  Text,
  Alert,
  Stack,
  Center,
  Loader,
  Anchor,
  Box,
} from '@mantine/core'
import { IconMail, IconLock, IconAlertCircle } from '@tabler/icons-react'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/'
  const { signIn, isAuthenticated, isLoading: authLoading } = useAuthContext()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
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
      <Box
        style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'var(--background)',
        }}
      >
        <Loader color="pink" size="lg" />
      </Box>
    )
  }

  return (
    <Box
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'var(--background)',
      }}
    >
      <Paper
        radius="lg"
        p="xl"
        withBorder
        style={{
          width: '100%',
          maxWidth: 420,
          backdropFilter: 'blur(10px)',
        }}
      >
        <Stack align="center" mb="xl">
          <Anchor
            component={Link}
            href="/"
            fw={900}
            fz="xl"
            c="white"
            underline="never"
            style={{ letterSpacing: 2 }}
          >
            RG FAMILY
          </Anchor>
          <Title order={2} ta="center">
            로그인
          </Title>
          <Text c="dimmed" size="sm" ta="center">
            RG 패밀리에 오신 것을 환영합니다
          </Text>
        </Stack>

        <form onSubmit={handleSubmit}>
          <Stack gap="md">
            {error && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                color="red"
                variant="light"
                radius="md"
              >
                {error}
              </Alert>
            )}

            <TextInput
              label="이메일 / 아이디"
              placeholder="이메일 또는 아이디"
              leftSection={<IconMail size={18} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="username"
              size="md"
              radius="md"
            />

            <PasswordInput
              label="비밀번호"
              placeholder="비밀번호를 입력하세요"
              leftSection={<IconLock size={18} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
              size="md"
              radius="md"
            />

            <Button
              type="submit"
              fullWidth
              size="md"
              radius="md"
              color="pink"
              loading={isLoading}
              loaderProps={{ type: 'dots' }}
              mt="sm"
            >
              로그인
            </Button>
          </Stack>
        </form>

        <Text ta="center" mt="xl" size="sm" c="dimmed">
          아직 계정이 없으신가요?{' '}
          <Anchor component={Link} href="/signup" fw={600}>
            회원가입
          </Anchor>
        </Text>
      </Paper>
    </Box>
  )
}
