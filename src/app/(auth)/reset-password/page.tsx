"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthContext } from "@/lib/context";
import { useForm } from "@mantine/form";
import {
  PasswordInput,
  Button,
  Paper,
  Title,
  Text,
  Stack,
  Anchor,
  Box,
  ThemeIcon,
  Alert,
  Loader,
} from "@mantine/core";
import { IconLock, IconCheck, IconAlertCircle } from "@tabler/icons-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const { updatePassword, isAuthenticated, isLoading: authLoading } = useAuthContext();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isValidSession, setIsValidSession] = useState<boolean | null>(null);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validate: {
      password: (value) => {
        if (!value) return "새 비밀번호를 입력해주세요";
        if (value.length < 6) return "비밀번호는 6자 이상이어야 합니다";
        return null;
      },
      confirmPassword: (value, values) => {
        if (!value) return "비밀번호 확인을 입력해주세요";
        if (value !== values.password) return "비밀번호가 일치하지 않습니다";
        return null;
      },
    },
  });

  useEffect(() => {
    // Supabase는 이메일 링크 클릭 시 자동으로 세션을 설정합니다
    // 세션이 있으면 비밀번호 재설정 가능
    if (!authLoading) {
      setIsValidSession(isAuthenticated);
    }
  }, [authLoading, isAuthenticated]);

  const handleSubmit = async (values: typeof form.values) => {
    setError(null);

    try {
      const { error: updateError } = await updatePassword(values.password);

      if (updateError) {
        setError(updateError.message);
      } else {
        setSuccess(true);
      }
    } catch {
      setError("비밀번호 변경 중 오류가 발생했습니다.");
    }
  };

  // 로딩 중
  if (authLoading || isValidSession === null) {
    return (
      <Box
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "var(--background)",
        }}
      >
        <Loader color="pink" size="lg" />
      </Box>
    );
  }

  // 유효하지 않은 세션
  if (!isValidSession) {
    return (
      <Box
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "var(--background)",
        }}
      >
        <Paper
          radius="lg"
          p="xl"
          withBorder
          style={{
            width: "100%",
            maxWidth: 420,
            boxShadow: "0 0 40px rgba(253, 104, 186, 0.15)",
          }}
        >
          <Stack align="center" gap="lg">
            <ThemeIcon size={64} radius="xl" color="red" variant="light">
              <IconAlertCircle size={32} />
            </ThemeIcon>
            <Title order={2} ta="center" c="pink">
              유효하지 않은 링크
            </Title>
            <Text c="pink.2" size="sm" ta="center" style={{ lineHeight: 1.6 }}>
              비밀번호 재설정 링크가 만료되었거나
              <br />
              유효하지 않습니다.
            </Text>
            <Button
              component={Link}
              href="/forgot-password"
              fullWidth
              size="md"
              radius="md"
              color="pink"
            >
              다시 요청하기
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

  // 성공
  if (success) {
    return (
      <Box
        style={{
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "2rem",
          background: "var(--background)",
        }}
      >
        <Paper
          radius="lg"
          p="xl"
          withBorder
          style={{
            width: "100%",
            maxWidth: 420,
            boxShadow: "0 0 40px rgba(253, 104, 186, 0.15)",
          }}
        >
          <Stack align="center" gap="lg">
            <ThemeIcon size={64} radius="xl" color="pink" variant="light">
              <IconCheck size={32} />
            </ThemeIcon>
            <Title order={2} ta="center" c="pink">
              비밀번호 변경 완료
            </Title>
            <Text c="pink.2" size="sm" ta="center" style={{ lineHeight: 1.6 }}>
              새로운 비밀번호로 로그인해주세요.
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
    );
  }

  // 비밀번호 재설정 폼
  return (
    <Box
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        background: "var(--background)",
      }}
    >
      <Paper
        radius="lg"
        p="xl"
        withBorder
        style={{
          width: "100%",
          maxWidth: 420,
          backdropFilter: "blur(10px)",
          boxShadow: "0 0 40px rgba(253, 104, 186, 0.15)",
        }}
      >
        <Stack align="center" mb="xl">
          <Anchor
            component={Link}
            href="/"
            fw={900}
            fz="xl"
            underline="never"
            style={{ letterSpacing: 2 }}
          >
            RG FAMILY
          </Anchor>
          <Title order={2} ta="center" c="pink">
            새 비밀번호 설정
          </Title>
          <Text c="pink.2" size="sm" ta="center">
            새로운 비밀번호를 입력해주세요
          </Text>
        </Stack>

        <form onSubmit={form.onSubmit(handleSubmit)}>
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

            <PasswordInput
              label="새 비밀번호"
              placeholder="6자 이상 입력하세요"
              leftSection={<IconLock size={18} stroke={1.5} color="var(--mantine-color-pink-4)" />}
              key={form.key("password")}
              {...form.getInputProps("password")}
              autoComplete="new-password"
              size="md"
              radius="md"
            />

            <PasswordInput
              label="비밀번호 확인"
              placeholder="비밀번호를 다시 입력하세요"
              leftSection={<IconLock size={18} stroke={1.5} color="var(--mantine-color-pink-4)" />}
              key={form.key("confirmPassword")}
              {...form.getInputProps("confirmPassword")}
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
              loading={form.submitting}
              loaderProps={{ type: "dots" }}
              mt="sm"
            >
              비밀번호 변경
            </Button>
          </Stack>
        </form>
      </Paper>
    </Box>
  );
}
