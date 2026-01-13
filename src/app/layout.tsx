import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Providers from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://rgfamily.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "RG Family - PandaTV 팬 커뮤니티",
    template: "%s | RG Family",
  },
  description:
    "PandaTV 스트리머 팬 커뮤니티 공식 웹사이트. 후원 랭킹, 조직도, 시그니처, VIP 라운지, 일정, 커뮤니티 게시판을 제공합니다.",
  keywords: [
    "RG Family",
    "PandaTV",
    "팬 커뮤니티",
    "후원 랭킹",
    "VIP",
    "시그니처",
    "조직도",
  ],
  authors: [{ name: "RG Family" }],
  creator: "RG Family",
  publisher: "RG Family",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    url: SITE_URL,
    siteName: "RG Family",
    title: "RG Family - PandaTV 팬 커뮤니티",
    description:
      "PandaTV 스트리머 팬 커뮤니티 공식 웹사이트. 후원 랭킹, 조직도, 시그니처, VIP 라운지를 제공합니다.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "RG Family",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "RG Family - PandaTV 팬 커뮤니티",
    description: "PandaTV 스트리머 팬 커뮤니티 공식 웹사이트",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#050505" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable}`}
        suppressHydrationWarning={true}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
