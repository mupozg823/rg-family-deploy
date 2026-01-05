"use client";

import { useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MantineProvider, createTheme } from "@mantine/core";
import { ModalsProvider } from "@mantine/modals";
import { Notifications } from "@mantine/notifications";
import "@mantine/core/styles.css";
import "@mantine/notifications/styles.css";
import "@mantine/dates/styles.css";

import {
  SupabaseProvider,
  AuthProvider,
  DataProviderProvider,
  ThemeProvider,
} from "@/lib/context";

// RG Family Mantine Theme
const mantineTheme = createTheme({
  primaryColor: "pink",
  colors: {
    pink: [
      "#fff0f6",
      "#ffdeeb",
      "#fcc2d7",
      "#faa2c1",
      "#fd68ba", // primary
      "#fb37a3", // deep
      "#e64980",
      "#d6336c",
      "#c2255c",
      "#a61e4d",
    ],
    dark: [
      "#e0e0e0", // [0] - 더 밝은 텍스트 (라벨용)
      "#C1C2C5",
      "#A6A7AB",
      "#909296",
      "#5c5f66",
      "#373A40",
      "#2C2E33",
      "#25262b",
      "#1A1B1E",
      "#141517",
    ],
  },
  fontFamily: '"Noto Sans KR", -apple-system, BlinkMacSystemFont, sans-serif',
  headings: {
    fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, sans-serif',
  },
  defaultRadius: "md",
  cursorType: "pointer",
});

interface ProvidersProps {
  children: React.ReactNode;
}

export default function Providers({ children }: ProvidersProps) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,
            refetchOnWindowFocus: false,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <MantineProvider theme={mantineTheme} defaultColorScheme="dark">
        <ModalsProvider>
          <Notifications position="top-right" />
          <SupabaseProvider>
            <AuthProvider>
              <DataProviderProvider>
                <ThemeProvider>{children}</ThemeProvider>
              </DataProviderProvider>
            </AuthProvider>
          </SupabaseProvider>
        </ModalsProvider>
      </MantineProvider>
    </QueryClientProvider>
  );
}
