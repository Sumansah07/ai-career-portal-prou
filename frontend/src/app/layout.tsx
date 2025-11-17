import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers/Providers";
import { DevStatus } from "@/components/DevStatus";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Career Portal - Smart Resume Analysis & Job Matching",
  description: "AI-powered career portal that analyzes resumes, provides personalized job recommendations, and offers placement insights to help you succeed in your career journey.",
  keywords: "AI, career, resume analysis, job matching, placement insights, career guidance",
  authors: [{ name: "AI Career Portal Team" }],
  viewport: "width=device-width, initial-scale=1",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className={`${inter.className} h-full antialiased bg-gray-50`}>
        <Providers>
          {children}
        </Providers>
        <DevStatus />
      </body>
    </html>
  );
}
