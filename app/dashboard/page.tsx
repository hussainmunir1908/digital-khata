/**
 * app/dashboard/page.tsx — Protected dashboard
 * Server Component: reads user from Supabase server client.
 * Matches the HTML reference design:
 *  - Fixed glassmorphic top navbar (Khata + nav + search + actions + avatar)
 *  - Animated radial gradient background + grain overlay
 *  - Floating Action Button (FAB)
 *  - Mobile bottom nav
 */
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import DashboardClient from '@/components/dashboard/DashboardClient'
import DashboardNav from '@/components/dashboard/DashboardNav'
import FabMenu from '@/components/dashboard/FabMenu'
import MobileNav from '@/components/dashboard/MobileNav'
import { Profile, LedgerEntry } from '@/types/database'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: rawEntries } = await supabase
    .from('ledger')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  let initialEntries = rawEntries || []

  // Fetch exact names for associated users (join fallback)
  const associatedUserIds = Array.from(new Set(initialEntries.map((e) => e.associated_user_id).filter(Boolean))) as string[]
  if (associatedUserIds.length > 0) {
    const { data: relatedProfiles } = await supabase
      .from('profiles')
      .select('id, full_name')
      .in('id', associatedUserIds)

    if (relatedProfiles) {
      const profileMap = Object.fromEntries(relatedProfiles.map((p) => [p.id, p]))
      initialEntries = initialEntries.map((e) => ({
        ...e,
        profiles: e.associated_user_id ? profileMap[e.associated_user_id] : null,
      }))
    }
  }

  const displayName = profile?.full_name || user.email || 'User'

  return (
    <div className="min-h-screen bg-gray-50 relative overflow-x-hidden text-gray-800">

      {/* ── Shared top navbar ── */}
      <DashboardNav displayName={displayName} />

      {/* ── Main content ── */}
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto space-y-10">
        <DashboardClient
          profile={profile as Profile | null}
          initialEntries={(initialEntries as LedgerEntry[]) || []}
        />
      </main>

      {/* ── FAB with dropdown menu ── */}
      <FabMenu />

      <MobileNav />
    </div>
  )
}
