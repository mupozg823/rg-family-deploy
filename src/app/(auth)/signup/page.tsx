'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
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
  Loader,
  Anchor,
  Box,
  ThemeIcon,
} from '@mantine/core'
import { IconMail, IconLock, IconUser, IconAlertCircle, IconCheck } from '@tabler/icons-react'

export default function SignupPage() {
  const router = useRouter()
  const { signUp, isAuthenticated, isLoading: authLoading } = useAuthContext()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [nickname, setNickname] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (!authLoading && isAuthenticated) {
      router.push('/')
    }
  }, [isAuthenticated, authLoading, router])

  const validateForm = (): string | null => {
    if (nickname.length < 2) {
      return '닉네임은 2자 이상이어야 합니다.'
    }
    if (password.length < 6) {
      return '비밀번호는 6자 이상이어야 합니다.'
    }
    if (password !== confirmPassword) {
      return '비밀번호가 일치하지 않습니다.'
    }
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    const validationError = validateForm()
    if (validationError) {
      setError(validationError)
      return
    }

    setIsLoading(true)

    try {
      const { error } = await signUp(email, password, nickname)
      if (error) {
        if (error.message.includes('already registered')) {
          setError('이미 등록된 이메일입니다.')
        } else {
          setError(error.message)
        }
      } else {
        setSuccess(true)
      }
    } catch {
      setError('회원가입 중 오류가 발생했습니다.')
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

  if (success) {
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
          }}
        >
          <Stack align="center" gap="lg">
            <ThemeIcon size={64} radius="xl" color="green" variant="light">
              <IconCheck size={32} />
            </ThemeIcon>
            <Title order={2} ta="center">
              가입 완료!
            </Title>
            <Text c="dimmed" size="sm" ta="center" style={{ lineHeight: 1.6 }}>
              이메일 인증 링크를 발송했습니다.
              <br />
              이메일을 확인해주세요.
            </Text>
            <Button
              component={Link}
              href="/login"
              fullWidth
              size="md"
              radius="md"
              color="pink"
            >
              로그인하기
            </Button>
          </Stack>
        </Paper>
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
            회원가입
          </Title>
          <Text c="dimmed" size="sm" ta="center">
            RG 패밀리의 새로운 멤버가 되어주세요
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
              label="닉네임"
              placeholder="닉네임을 입력하세요"
              leftSection={<IconUser size={18} />}
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              required
              minLength={2}
              maxLength={20}
              size="md"
              radius="md"
            />

            <TextInput
              label="이메일"
              placeholder="example@email.com"
              leftSection={<IconMail size={18} />}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              type="email"
              autoComplete="email"
              size="md"
              radius="md"
            />

            <PasswordInput
              label="비밀번호"
              placeholder="6자 이상 입력하세요"
              leftSection={<IconLock size={18} />}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              autoComplete="new-password"
              size="md"
              radius="md"
            />

            <PasswordInput
              label="비밀번호 확인"
              placeholder="비밀번호를 다시 입력하세요"
              leftSection={<IconLock size={18} />}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              autoComplete="new-password"
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
              가입하기
            </Button>
          </Stack>
        </form>

        <Text ta="center" mt="xl" size="sm" c="dimmed">
          이미 계정이 있으신가요?{' '}
          <Anchor component={Link} href="/login" fw={600}>
            로그인
          </Anchor>
        </Text>
      </Paper>
    </Box>
  )
}
