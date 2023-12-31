import "./globals.css";
import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/themes";
import { Noto_Sans } from "next/font/google";

import ReduxProvider from "@/reduxProvider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import ModalProvider from "@/components/providers/modal-provider";
import { SocketProvider } from "@/components/providers/socket-provider";
import { QueryProvider } from "@/components/providers/query-provider";

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  fallback: ["helvetica", "arial", "sans-serif"],
});

export const metadata: Metadata = {
  title: "Discord",
  description: "Generated by create next app",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider
      appearance={{
        baseTheme: dark,
      }}
    >
      <html lang="en" suppressHydrationWarning className={notoSans.className}>
        <body className="bg-white dark:bg-[#313338]">
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem={true}
            storageKey="discord-theme"
          >
            <SocketProvider>
              <ReduxProvider>
                <ModalProvider />
                <QueryProvider>{children}</QueryProvider>
              </ReduxProvider>
            </SocketProvider>
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}
