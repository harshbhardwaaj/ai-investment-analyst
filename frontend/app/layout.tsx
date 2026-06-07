import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
    title: "AI Investment Analyst",
    description: "Generate PE-grade investment memos in seconds - DCF, LBO, trading comps, precedent transactions. Powered by real financial data.",
    openGraph: {
        title: "AI Investment Analyst",
        description: "Generate PE-grade investment memos in seconds — DCF, LBO, trading comps, precedent transactions.",
        url: "https://ai-investment-analyst-harsh.vercel.app",
        siteName: "by Harsh Bhardwaj",
        images: [
            {
                url: "https://ai-investment-analyst-harsh.vercel.app/ai_investment_analyst_thumbnail.png",
                width: 1200,
                height: 627,
                alt: "AI Investment Analyst",
            },
        ],
        type: "website",
    },
    twitter: {
        card: "summary_large_image",
        title: "AI Investment Analyst",
        description: "Generate PE-grade investment memos in seconds.",
        images: ["https://ai-investment-analyst-harsh.vercel.app/ai_investment_analyst_thumbnail.png"],
    },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
