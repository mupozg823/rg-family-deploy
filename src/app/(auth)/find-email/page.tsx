"use client";

import { useState } from "react";
import Link from "next/link";
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
import { IconUser, IconMail, IconAlertCircle, IconArrowLeft } from "@tabler/icons-react";
import { findEmailByNickname } from "@/lib/actions/auth";

export default function FindEmailPage() {
  const [foundEmail, setFoundEmail] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const form = useForm({
    mode: "uncontrolled",
    initialValues: {
      nickname: "",
    },
    validate: {
      nickname: (value) => {
        if (!value) return "닉네임을 입력해주세요";
        if (value.length < 2) return "닉네임은 2자 이상이어야 합니다";
        return null;
      },
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    setError(null);
    setFoundEmail(null);

    try {
      const result = await findEmailByNickname(values.nickname);

      if (result.error) {
        setError(result.error);
      } else if (result.data) {
        setFoundEmail(result.data.email);
      }
    } catch {
      setError("이메일 찾기 중 오류가 발생했습니다.");
    }
  };

  if (foundEmail) {
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
              <IconMail size={32} />
            </ThemeIcon>
            <Title order={2} ta="center" c="pink">
              이메일 찾기 완료
            </Title>
            <Text c="pink.2" size="sm" ta="center" style={{ lineHeight: 1.6 }}>
              가입하신 이메일은 다음과 같습니다:
            </Text>
            <Paper
              p="md"
              radius="md"
              withBorder
              style={{
                width: "100%",
                textAlign: "center",
                background: "var(--surface)",
              }}
            >
              <Text size="lg" fw={600} c="pink">
                {foundEmail}
              </Text>
            </Paper>
            <Text c="dimmed" size="xs" ta="center">
              보안을 위해 일부가 마스킹 처리되었습니다
            </Text>
            <Stack w="100%" gap="sm">
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
              <Button
                component={Link}
                href="/forgot-password"
                fullWidth
                size="md"
                radius="md"
                variant="light"
                color="pink"
              >
                비밀번호 찾기
              </Button>
            </Stack>
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
            아이디(이메일) 찾기
          </Title>
          <Text c="pink.2" size="sm" ta="center">
            가입 시 사용한 닉네임을 입력해주세요
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
              label="닉네임"
              placeholder="가입 시 사용한 닉네임"
              leftSection={<IconUser size={18} stroke={1.5} color="var(--mantine-color-pink-4)" />}
              key={form.key("nickname")}
              {...form.getInputProps("nickname")}
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
              이메일 찾기
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
