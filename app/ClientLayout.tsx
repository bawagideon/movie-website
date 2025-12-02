"use client"

import React from "react"
import { initializeEnvironment } from "@/lib/config/validate-env"

import { SiteHeader } from "@/components/site-header"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Initialize environment validation on mount
  // Environment is validated on the server RootLayout; don't run it here to avoid
  // client-side console noise and potential runtime differences.

  return (
    <div className="min-h-screen bg-background text-foreground font-sans">
      <SiteHeader />
      {children}
    </div>
  )
}