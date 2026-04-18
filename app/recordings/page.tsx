/**
 * app/recordings/page.tsx — Voice Recordings Page
 * Server Component: auth check + profile fetch, then renders recordings UI.
 */
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardNav from '@/components/dashboard/DashboardNav'
import MobileNav from '@/components/dashboard/MobileNav'
import FabMenu from '@/components/dashboard/FabMenu'
import RecordingsClient from '@/components/recordings/RecordingsClient'

export default async function RecordingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const displayName = profile?.full_name || user.email || 'User'

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-x-hidden text-gray-800">


      {/* Shared navbar — active item is "Recordings" via usePathname */}
      <DashboardNav displayName={displayName} />

      {/* Main content */}
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto space-y-12 flex-grow">
        <RecordingsClient />
      </main>

      <FabMenu />

      <MobileNav />
    </div>
  )
}
