"use client";

import { useState } from "react";
import Link from "next/link";
import { useAuthContext } from "@/lib/context";
import { useForm } from "@mantine/form";
import {
  TextInput,
  Button,
  Paper,
  Title,
  Text,
  Stack,
  Anchor,
  Box,
  ThemeIcon,
  Alert,
} from "@mantine/core";
import { IconMail, IconCheck, IconAlertCircle, IconArrowLeft } from "@tabler/icons-react";

export default function ForgotPasswordPage() {
  const { resetPassword } = useAuthContext();
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      email: "",
    },
    validate: {
      email: (value) => {
        if (!value) return "이메일을 입력해주세요";
        if (!/^\S+@\S+$/.test(value)) return "올바른 이메일 형식이 아닙니다";
        return null;
      },
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setError(null);

    try {
      const { error: resetError } = await resetPassword(values.email);

      if (resetError) {
        setError(resetError.message);
      } else {
        setSuccess(true);
      }
    } catch {
      setError("비밀번호 재설정 이메일 발송 중 오류가 발생했습니다.");
    }
  };

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
              이메일 발송 완료
            </Title>
            <Text c="pink.2" size="sm" ta="center" style={{ lineHeight: 1.6 }}>
              비밀번호 재설정 링크를 발송했습니다.
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
              로그인으로 돌아가기
            </Button>
          </Stack>
        </Paper>
      </Box>
    );
  }

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
            비밀번호 찾기
          </Title>
          <Text c="pink.2" size="sm" ta="center">
            가입하신 이메일로 재설정 링크를 보내드립니다
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

            <TextInput
              label="이메일"
              placeholder="가입시 사용한 이메일을 입력하세요"
              leftSection={<IconMail size={18} stroke={1.5} color="var(--mantine-color-pink-4)" />}
              key={form.key("email")}
              {...form.getInputProps("email")}
              autoComplete="email"
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
              재설정 링크 보내기
            </Button>
          </Stack>
        </form>

        <Button
          component={Link}
          href="/login"
          variant="subtle"
          color="pink"
          fullWidth
          mt="xl"
          leftSection={<IconArrowLeft size={16} />}
        >
          로그인으로 돌아가기
        </Button>
      </Paper>
    </Box>
  );
}
