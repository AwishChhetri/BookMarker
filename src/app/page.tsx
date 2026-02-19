import { createClient } from '@/lib/supabase-server'
import Auth from '@/components/Auth'
import Dashboard from '@/components/Dashboard'

export default async function Home() {
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return <Auth />
  }

  return <Dashboard user={user} />
}
