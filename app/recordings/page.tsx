/**
 * app/recordings/page.tsx — Voice Recordings Page
 * Server Component: auth check + profile fetch, then renders recordings UI.
 */
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DashboardNav from '@/components/dashboard/DashboardNav'
import RecordingsClient from '@/components/recordings/RecordingsClient'
import { LayoutGrid, TrendingUp, Wallet, User } from 'lucide-react'

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
    <div className="min-h-screen bg-slate-100 dark:bg-slate-900 relative overflow-x-hidden transition-colors duration-300">
      {/* Grain texture overlay */}
      <div className="grain-overlay fixed inset-0 -z-10" aria-hidden="true" />

      {/* Shared navbar — active item is "Recordings" via usePathname */}
      <DashboardNav displayName={displayName} />

      {/* Main content */}
      <main className="pt-32 pb-24 px-6 md:px-12 max-w-7xl mx-auto space-y-12 flex-grow">
        <RecordingsClient />
      </main>

      {/* Mobile bottom nav */}
      <footer
        className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-6 pb-6 pt-2 rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.04)] glass-border"
        style={{ background: 'rgba(255,255,255,0.70)', backdropFilter: 'blur(24px)' }}
      >
        {([
          { icon: LayoutGrid, label: 'Home',     active: false, href: '/dashboard' },
          { icon: TrendingUp, label: 'Insights',  active: false, href: '#' },
          { icon: Wallet,     label: 'Wallets',   active: false, href: '#' },
          { icon: User,       label: 'Profile',   active: false, href: '#' },
        ] as const).map(({ icon: Icon, label, active }) => (
          <button
            key={label}
            className={`flex flex-col items-center justify-center p-3 rounded-full transition-all ${
              active
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 scale-110'
                : 'text-slate-500 hover:text-blue-500'
            }`}
          >
            <Icon size={20} />
            <span className="text-[11px] font-bold uppercase tracking-widest mt-1">{label}</span>
          </button>
        ))}
      </footer>
    </div>
  )
}
