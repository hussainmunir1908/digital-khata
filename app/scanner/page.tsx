/**
 * app/scanner/page.tsx — Khata Scanner Page
 * Server Component: auth check + profile fetch, then renders scanner UI.
 */
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import DashboardNav from '@/components/dashboard/DashboardNav'
import MobileNav from '@/components/dashboard/MobileNav'
import ScannerClient from '@/components/scanner/ScannerClient'

export default async function ScannerPage() {
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


      {/* Shared navbar — active item is "Scanner" via usePathname */}
      <DashboardNav displayName={displayName} />

      {/* Main scanner content */}
      <main className="pt-32 pb-24 px-4 sm:px-6 max-w-3xl mx-auto space-y-6">
        {/* Page header */}
        <div>
          <h1
            className="text-3xl font-extrabold text-slate-800 tracking-tight"
            style={{ fontFamily: 'var(--font-headline, sans-serif)' }}
          >
            Receipt Scanner
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Snap a photo or upload a receipt to auto-log an entry
          </p>
        </div>

        <ScannerClient userId={user.id} />
      </main>

      <MobileNav />
    </div>
  )
}
