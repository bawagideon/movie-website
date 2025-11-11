"use client"

import React from "react"
import { initializeEnvironment } from "@/lib/config/validate-env"

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [menuOpen, setMenuOpen] = React.useState(false);

  // Initialize environment validation on mount
  React.useEffect(() => {
    try {
      initializeEnvironment()
    } catch (error) {
      console.error("Environment initialization failed:", error)
    }
  }, [])

  return (
    <>
      {/* Mobile Hamburger Nav */}
      <nav 
        className="lg:hidden fixed top-0 left-0 w-full z-[100] bg-card/80 backdrop-blur-md border-b border-border flex items-center justify-between px-4 py-3"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center gap-2">
          <span className="font-bold text-lg" role="img" aria-label="MovieVault Home">MovieVault</span>
        </div>
        <button
          aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}
          aria-expanded={menuOpen}
          aria-controls="mobile-menu"
          className="flex flex-col gap-1 focus:outline-none"
          onClick={() => setMenuOpen((v) => !v)}
        >
          <span className={`block w-7 h-1 bg-primary rounded transition-all ${menuOpen ? 'rotate-45 translate-y-2' : ''}`} />
          <span className={`block w-7 h-1 bg-primary rounded transition-all ${menuOpen ? 'opacity-0' : ''}`} />
          <span className={`block w-7 h-1 bg-primary rounded transition-all ${menuOpen ? '-rotate-45 -translate-y-2' : ''}`} />
        </button>
        {/* Overlay and Drawer */}
        {menuOpen && (
          <>
            <div
              className="fixed inset-0 bg-black/70 z-50 animate-fade-in"
              onClick={() => setMenuOpen(false)}
              aria-hidden="true"
            />
            <div 
              className="fixed top-0 right-0 w-2/3 max-w-xs h-full bg-card shadow-lg p-6 flex flex-col gap-6 z-[101] animate-fade-in"
              id="mobile-menu"
              role="navigation"
              aria-label="Main navigation"
            >
              <a href="/" className="text-lg font-semibold py-2" onClick={() => setMenuOpen(false)}>Home</a>
              <a href="/wishlist" className="text-lg font-semibold py-2" onClick={() => setMenuOpen(false)}>Wishlist</a>
              <a href="/auth/login" className="text-lg font-semibold py-2" onClick={() => setMenuOpen(false)}>Sign In</a>
              <a href="/auth/signup" className="text-lg font-semibold py-2" onClick={() => setMenuOpen(false)}>Sign Up</a>
            </div>
          </>
        )}
      </nav>

      {/* Desktop Nav */}
      <nav 
        className="hidden lg:flex fixed top-0 left-0 w-full z-[100] bg-card/80 backdrop-blur-md border-b border-border items-center justify-between px-8 py-4"
        aria-label="Main navigation"
      >
        <div className="flex items-center gap-3">
          <a href="/" className="font-bold text-2xl" role="img" aria-label="MovieVault Home">MovieVault</a>
        </div>
        <div className="flex items-center gap-6">
          <a href="/" className="text-base font-semibold hover:text-primary transition-colors">Home</a>
          <a href="/wishlist" className="text-base font-semibold hover:text-primary transition-colors">Wishlist</a>
          <a href="/auth/login" className="text-base font-semibold hover:text-primary transition-colors">Sign In</a>
          <a href="/auth/signup" className="ml-2 px-4 py-2 rounded bg-primary text-white font-semibold hover:bg-primary/90 transition-colors">Sign Up</a>
        </div>
      </nav>

      <div className="pt-16 lg:pt-20">{children}</div>
    </>
  )
}