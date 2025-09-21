import { createClient } from "@/lib/supabase/server"
import HomePage from "@/components/home-page"

export default async function Page() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return <HomePage user={user} />
}
