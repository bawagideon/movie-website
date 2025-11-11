import type { Metadata } from "next"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import ClientLayout from "./ClientLayout"
import { ErrorBoundary } from "@/components/error-boundary"

export const metadata: Metadata = {
  title: "MovieVault - Your Movie Wishlist",
  description: "Discover, explore, and save your favorite movies with MOVIEVAULT's AI-powered app.",
  generator: "v0.dev",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <head>
        <style>{`
          html {
            font-family: ${GeistSans.style.fontFamily};
            --font-sans: ${GeistSans.variable};
            --font-mono: ${GeistMono.variable};
            font-size: clamp(15px, 4vw, 18px);
            scroll-behavior: smooth;
          }
        `}</style>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=yes" />
      </head>
      <body className="touch-manipulation antialiased min-h-screen bg-background text-foreground">
        <ErrorBoundary>
          <ClientLayout>{children}</ClientLayout>
        </ErrorBoundary>
      </body>
    </html>
  )
}