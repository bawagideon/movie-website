import type { Metadata } from "next"
import { Bebas_Neue, Inter } from "next/font/google"
import "./globals.css"
import ClientLayout from "./ClientLayout"
import { initializeEnvironment } from "@/lib/config/validate-env"
import { ErrorBoundary } from "@/components/error-boundary"

const bebas = Bebas_Neue({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-bebas",
})

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
})

export const metadata: Metadata = {
  title: "Cinema80 - Retro Movie Discovery",
  description: "Discover, explore, and save your favorite movies with Cinema80's AI-powered retro experience.",
  generator: "v0.dev",
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // Validate environment on the server-side during layout render.
  // This will throw/exit in production if required variables are missing,
  // and will only warn in development.
  initializeEnvironment()
  return (
    <html lang="en" className={`dark ${bebas.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=yes" />
      </head>
      <body className="touch-manipulation antialiased min-h-screen bg-background text-foreground font-sans">
        <ErrorBoundary>
          <ClientLayout>{children}</ClientLayout>
        </ErrorBoundary>
      </body>
    </html>
  )
}