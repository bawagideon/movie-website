"use client"

import Link from "next/link"
import { usePathname, useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Search, Film, Menu, X, Sparkles } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import AuthButton from "@/components/auth-button"
import { createClient } from "@/lib/supabase/client"
import type { AuthUser } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"

export function SiteHeader() {
    const [user, setUser] = useState<AuthUser | null>(null)
    const [isScrolled, setIsScrolled] = useState(false)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const router = useRouter()
    const pathname = usePathname()
    const supabase = createClient()

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser()
            setUser(user as AuthUser)
        }
        getUser()

        const handleScroll = () => {
            setIsScrolled(window.scrollY > 0)
        }
        window.addEventListener("scroll", handleScroll)
        return () => window.removeEventListener("scroll", handleScroll)
    }, [])

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault()
        if (searchQuery.trim()) {
            router.push(`/?q=${encodeURIComponent(searchQuery)}`)
        }
    }

    // Hide header on onboarding or login/signup pages if desired, but user said "always present except unnecessary ones"
    if (pathname === "/onboarding") return null

    return (
        <>
            <motion.header
                initial={{ y: -100 }}
                animate={{ y: 0 }}
                transition={{ duration: 0.5 }}
                className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled ? "bg-black/80 backdrop-blur-xl border-b border-white/5 shadow-lg" : "bg-transparent"
                    }`}
            >
                <div className="container mx-auto px-4 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-8">
                        <Link href="/" className="flex items-center gap-3 group">
                            <div className="relative w-10 h-10 flex items-center justify-center">
                                <Film className="w-8 h-8 text-primary group-hover:text-primary/80 transition-colors" />
                            </div>
                            <span className="text-3xl font-display tracking-wide bg-clip-text text-transparent bg-gradient-to-r from-orange-400 via-pink-500 to-purple-500">
                                Cinema80
                            </span>
                        </Link>

                        <nav className="hidden md:flex items-center gap-6">
                            <Link href="/" className={`text-sm font-medium transition-colors ${pathname === "/" ? "text-primary" : "text-white/60 hover:text-white"}`}>Home</Link>
                            {user && (
                                <>
                                    <Link href="/library" className={`text-sm font-medium transition-colors ${pathname === "/library" ? "text-primary" : "text-white/60 hover:text-white"}`}>My Library</Link>
                                    <Link href="/profile" className={`text-sm font-medium transition-colors ${pathname === "/profile" ? "text-primary" : "text-white/60 hover:text-white"}`}>Profile</Link>
                                </>
                            )}
                        </nav>
                    </div>

                    <div className="flex items-center gap-4">
                        <form onSubmit={handleSearch} className="hidden lg:flex items-center relative group">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" />
                            <Input
                                type="text"
                                placeholder="Search titles..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 w-64 bg-white/5 border-white/10 focus:bg-white/10 focus:border-primary/50 transition-all duration-300 rounded-full h-10 text-sm"
                                aria-label="Search movies"
                            />
                        </form>

                        <AuthButton user={user} />

                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden"
                            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
                        >
                            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </Button>
                    </div>
                </div>
            </motion.header>

            {/* Mobile Menu */}
            <AnimatePresence>
                {mobileMenuOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="fixed inset-0 z-40 bg-black/95 pt-24 px-4 md:hidden"
                    >
                        <nav className="flex flex-col gap-4 text-center">
                            <Link href="/" className="text-xl font-medium text-white py-2" onClick={() => setMobileMenuOpen(false)}>Home</Link>
                            {user && (
                                <>
                                    <Link href="/library" className="text-xl font-medium text-white py-2" onClick={() => setMobileMenuOpen(false)}>My Library</Link>
                                    <Link href="/profile" className="text-xl font-medium text-white py-2" onClick={() => setMobileMenuOpen(false)}>Profile</Link>
                                </>
                            )}
                        </nav>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
