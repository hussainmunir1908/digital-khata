import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardNav from '@/components/dashboard/DashboardNav'
import MobileNav from '@/components/dashboard/MobileNav'
import NotificationsClient from '@/components/notifications/NotificationsClient'

export default async function NotificationsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const displayName = profile?.full_name || user.email || 'User'

  // Fetch notifications
  const { data: notifications } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  return (
    <div className="min-h-screen bg-gray-50 relative text-gray-800 pb-24">
      <DashboardNav displayName={displayName} />
      <main className="pt-32 px-6 max-w-3xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-slate-900" style={{ fontFamily: 'var(--font-headline, sans-serif)' }}>Alerts</h1>
            <p className="text-slate-500 mt-1">Stay updated with your circle.</p>
          </div>
        </div>
        <NotificationsClient initialNotifications={notifications || []} userId={user.id} />
      </main>
      <MobileNav />
    </div>
  )
}
