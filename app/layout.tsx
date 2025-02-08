import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { Analytics } from '@vercel/analytics/next';

// Load the ABCDiatype font (Regular and Bold only)
const abcdDiatype = localFont({
  src: [
    { path: "./fonts/ABCDiatype-Regular.otf", weight: "400" },
    { path: "./fonts/ABCDiatype-Bold.otf", weight: "700" },
  ],
  variable: "--font-abcd-diatype",
});

// Load the Reckless font (Regular and Medium only)
const reckless = localFont({
  src: [
    { path: "./fonts/RecklessTRIAL-Regular.woff2", weight: "400" },
    { path: "./fonts/RecklessTRIAL-Medium.woff2", weight: "500" },
  ],
  variable: "--font-reckless",
});

export const metadata: Metadata = {
  title: "42deep｜活水深度，你的深度研究助手",
  description: "42deep，你的深度研究助手，基于 AI 的智能搜索和分析工具",
  openGraph: {
    title: "42deep｜活水深度，你的深度研究助手",
    description: "42deep，你的深度研究助手，基于 AI 的智能搜索和分析工具",
    type: "website",
    locale: "zh_CN",
    images: [
      {
        url: "https://picsaving-1258754708.cos.ap-guangzhou.myqcloud.com/img/42deep.png",
        width: 1200,
        height: 630,
        alt: "42deep｜活水深度，你的深度研究助手"
      }
    ]
  },
  twitter: {
    card: "summary_large_image",
    title: "42deep｜活水深度，你的深度研究助手",
    description: "42deep，你的深度研究助手，基于 AI 的智能搜索和分析工具",
    images: ["https://picsaving-1258754708.cos.ap-guangzhou.myqcloud.com/img/42deep.png"]
  },
  metadataBase: new URL("https://42deep.huoshuiai.com"),
  robots: {
    index: true,
    follow: true
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
      </head>
      <body
        className={`${abcdDiatype.variable} ${reckless.variable} antialiased`}
      >
        {children}
        <Analytics />
      </body>
    </html>
  );
}
