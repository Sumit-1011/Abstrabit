import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import LoginPage from './login-page'

export const dynamic = 'force-dynamic'

export default async function Home() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return <LoginPage />
}

