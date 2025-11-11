"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { User, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import type { AuthUser } from "@/lib/types"

interface AuthButtonProps {
  user: AuthUser | null
}

export default function AuthButton({ user }: AuthButtonProps) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

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
          className="text-white hover:text-red-400" 
          onClick={() => router.push("/auth/login")}
          aria-label="Navigate to sign in page"
        >
          Sign In
        </Button>
        <Button 
          className="bg-red-600 hover:bg-red-700 text-white" 
          onClick={() => router.push("/auth/signup")}
          aria-label="Navigate to sign up page"
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
          className="text-white hover:text-red-400"
          aria-label={`Open user menu for ${user.email}`}
          aria-haspopup="menu"
          aria-expanded="false"
        >
          <User className="h-4 w-4 mr-2" aria-hidden="true" />
          {user.email}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="bg-gray-900 border-gray-700"
        role="menu"
        aria-label="User menu"
      >
        <DropdownMenuItem
          onClick={() => router.push("/wishlist")}
          className="text-white hover:bg-gray-800 cursor-pointer"
          role="menuitem"
          aria-label="Go to my wishlist"
        >
          My Wishlist
        </DropdownMenuItem>
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
