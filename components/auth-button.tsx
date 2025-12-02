"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { User, LogOut, Heart, LayoutDashboard } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu"
import type { AuthUser } from "@/lib/types"

interface AuthButtonProps {
  user: AuthUser | null
}

export default function AuthButton({ user }: AuthButtonProps) {
  const [loading, setLoading] = useState(false)
  const [username, setUsername] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (user) {
      const fetchProfile = async () => {
        const { data } = await supabase
          .from("profiles")
          .select("username")
          .eq("id", user.id)
          .single()

        if (data?.username) {
          setUsername(data.username)
        }
      }
      fetchProfile()
    }
  }, [user, supabase])

  const handleSignOut = async () => {
    setLoading(true)
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
    setLoading(false)
  }

  if (!user) {
    return (
      <div className="flex items-center gap-2">
        <Button
          variant="ghost"
          className="text-white hover:text-red-400 font-medium"
          onClick={() => router.push("/auth/login")}
        >
          Sign In
        </Button>
        <Button
          className="bg-red-600 hover:bg-red-700 text-white font-medium"
          onClick={() => router.push("/auth/signup")}
        >
          Sign Up
        </Button>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="text-white hover:text-red-400 gap-2"
        >
          <div className="h-8 w-8 rounded-full bg-red-600/20 flex items-center justify-center border border-red-600/30">
            <User className="h-4 w-4 text-red-400" />
          </div>
          <span className="hidden sm:inline-block font-medium">{username || user.email?.split('@')[0]}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="bg-black/90 border-white/10 backdrop-blur-xl w-56"
        align="end"
      >
        <div className="p-2 border-b border-white/10 mb-1">
          <p className="text-sm font-medium text-white">{username || "User"}</p>
          <p className="text-xs text-gray-400 truncate">{user.email}</p>
        </div>

        <DropdownMenuItem
          onClick={() => router.push("/profile")}
          className="text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer gap-2"
        >
          <LayoutDashboard className="h-4 w-4" />
          Command Center
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={() => router.push("/library")}
          className="text-gray-300 hover:text-white hover:bg-white/10 cursor-pointer gap-2"
        >
          <Heart className="h-4 w-4" />
          My Library
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-white/10" />
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={loading}
          className="text-white hover:bg-gray-800 cursor-pointer"
          role="menuitem"
          aria-label="Sign out of your account"
          aria-busy={loading}
        >
          <LogOut className="h-4 w-4 mr-2" aria-hidden="true" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
