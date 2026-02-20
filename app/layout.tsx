import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";

export const metadata: Metadata = {
  title: "머꼬머꼬 - 오늘 뭐 먹지?",
  description:
    "내 주변 맛집을 감정과 맛 카테고리로 추천받는 서비스, 머꼬머꼬",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="antialiased">
        {children}
        <Script
          src={`//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.NEXT_PUBLIC_KAKAO_JS_KEY}&autoload=false&libraries=services`}
          strategy="beforeInteractive"
        />
      </body>
    </html>
  );
}
