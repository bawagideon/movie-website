"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { User, LogOut } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

interface AuthButtonProps {
  user: any
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
        <Button variant="ghost" className="text-white hover:text-red-400" onClick={() => router.push("/auth/login")}>
          Sign In
        </Button>
        <Button className="bg-red-600 hover:bg-red-700 text-white" onClick={() => router.push("/auth/signup")}>
          Sign Up
        </Button>
      </div>
    )
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="text-white hover:text-red-400">
          <User className="h-4 w-4 mr-2" />
          {user.email}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-gray-900 border-gray-700">
        <DropdownMenuItem
          onClick={() => router.push("/wishlist")}
          className="text-white hover:bg-gray-800 cursor-pointer"
        >
          My Wishlist
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={loading}
          className="text-white hover:bg-gray-800 cursor-pointer"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
