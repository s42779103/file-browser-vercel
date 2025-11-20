import type { Metadata } from "next";
import ThemeRegistry from "@/components/ThemeRegistry/index";
import "./globals.css";

export const metadata: Metadata = {
  title: "R2 Storage Browser",
  description: "Cloudflare R2 File Manager",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}