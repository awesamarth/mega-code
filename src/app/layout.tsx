import { Inter } from "next/font/google";
import "./globals.css";
import type { Metadata } from "next";
import { headers } from 'next/headers'
import "./globals.css";
import Navbar from "@/components/Navbar";
import ContextProvider from "@/context";
import { ThemeProvider } from "@/components/theme-provider"

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Mega Code",
  description: "AI powered IDE for deploying contracts to MegaETH Testnet",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const headersList = await headers()
  const cookies = headersList.get('cookie')

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >          <ContextProvider cookies={cookies}>
            <Navbar />
            {children}
          </ContextProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}