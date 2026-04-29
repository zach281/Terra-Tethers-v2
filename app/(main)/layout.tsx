
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { createServiceClient } from '@/lib/supabase/server'
import { Navbar } from '@/components/layout/navbar'

export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const service = await createServiceClient()
  const { data: profile } = await service
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (profile) {
    const today = new Date().toISOString().split('T')[0]
    if (profile.last_login_date !== today) {
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
      const newStreak = profile.last_login_date === yesterday ? (profile.login_streak ?? 0) + 1 : 1
      await service
        .from('profiles')
        .update({ last_login_date: today, login_streak: newStreak })
        .eq('id', user.id)
    }
  }

  return (
    <div className="min-h-screen bg-black">
      <Navbar profile={profile} />
      <main className="pt-14 pb-16 md:pb-0">
        {children}
      </main>
    </div>
  )
}
