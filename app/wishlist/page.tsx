import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import WishlistPage from "@/components/wishlist-page"

export default async function Wishlist() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  return <WishlistPage user={user} />
}
