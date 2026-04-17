import { redirect } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { signOut } from '@/app/actions/auth'
import { Search, Bell, Settings, Filter, LayoutGrid, TrendingUp, Wallet, User, Plus } from 'lucide-react'
import { Toaster } from 'sonner'
import LedgerClient from '@/components/khata-ledger/LedgerClient'
import { Profile, LedgerEntry } from '@/types/database'

export default async function LedgerPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const { data: initialEntries } = await supabase
    .from('ledger')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  const displayName = profile?.full_name || user.email || 'User'
  const initial = displayName.charAt(0).toUpperCase()

  return (
    <div className="min-h-screen relative overflow-x-hidden">
      <Toaster position="top-right" />

      {/* Background */}
      <div
        className="fixed inset-0 -z-20"
        style={{ background: 'radial-gradient(circle at top left, #DBEAFE, #BFDBFE, #93C5FD)' }}
      />
      <div className="grain-overlay fixed inset-0 -z-10" aria-hidden="true" />

      {/* ── Fixed Top Navbar ── */}
      <header className="fixed top-0 left-0 right-0 z-50 px-4 pt-4">
        <div
          className="flex items-center justify-between max-w-7xl mx-auto px-8 py-3 rounded-full glass-border shadow-[0_20px_40px_rgba(44,52,55,0.06)]"
          style={{ background: 'rgba(255,255,255,0.40)', backdropFilter: 'blur(24px)' }}
        >
          {/* Left: brand + nav */}
          <div className="flex items-center gap-8">
            <Link
              href="/"
              className="text-2xl font-black text-blue-700 tracking-tight hover:opacity-80 transition-opacity"
              style={{ fontFamily: 'var(--font-headline, sans-serif)' }}
            >
              Khata
            </Link>
            <nav className="hidden md:flex items-center gap-2">
              <Link
                href="/dashboard"
                className="text-slate-600 font-medium hover:bg-white/20 transition-all px-3 py-1 rounded-full text-sm"
              >
                Overview
              </Link>
              <Link
                href="/ledger"
                className="text-blue-700 font-bold border-b-2 border-blue-600 px-1 pb-0.5 text-sm"
              >
                Ledger
              </Link>
              <Link
                href="/scanner"
                className="text-slate-600 font-medium hover:bg-white/20 transition-all px-3 py-1 rounded-full text-sm cursor-pointer"
              >
                Scanner
              </Link>
            </nav>
          </div>

          {/* Right: search + icons + avatar */}
          <div className="flex items-center gap-3">
            <div
              className="hidden md:flex items-center rounded-full px-4 py-1.5 gap-2 glass-border"
              style={{ background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(12px)' }}
            >
              <Search size={15} className="text-slate-500 shrink-0" />
              <input
                className="bg-transparent border-none outline-none text-sm w-44 text-slate-800 placeholder-slate-500"
                placeholder="Search transactions..."
                type="text"
              />
            </div>
            <button className="p-2 text-slate-600 hover:bg-white/20 rounded-full transition-all">
              <Bell size={18} />
            </button>
            <button className="p-2 text-slate-600 hover:bg-white/20 rounded-full transition-all">
              <Settings size={18} />
            </button>
            <form action={signOut}>
              <button
                type="submit"
                title={`Signed in as ${displayName} — click to sign out`}
                className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center border-2 border-white/50 shadow-sm hover:bg-blue-700 transition-colors"
              >
                {initial}
              </button>
            </form>
          </div>
        </div>
      </header>

      {/* ── Main Content ── */}
      <main className="pt-32 pb-24 px-6 max-w-7xl mx-auto space-y-10">
        {/* Page Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Financial Circle</h1>
            <p className="text-slate-500 mt-1 text-base">Keep track of who owes who.</p>
          </div>
          <button
            className="flex items-center gap-2 px-4 py-2 rounded-full glass-border text-slate-700 text-sm font-medium hover:bg-white/40 transition-all shrink-0"
            style={{ background: 'rgba(255,255,255,0.20)', backdropFilter: 'blur(12px)' }}
          >
            <Filter size={15} />
            Filter Activity
          </button>
        </div>

        <LedgerClient
          profile={profile as Profile | null}
          initialEntries={(initialEntries as LedgerEntry[]) ?? []}
        />
      </main>

      {/* ── FAB ── */}
      <Link
        href="/scanner"
        className="fixed bottom-8 right-8 w-16 h-16 text-white rounded-full flex items-center justify-center shadow-[0_8px_24px_rgba(59,130,246,0.4)] hover:scale-110 active:scale-95 transition-all z-50 group"
        style={{ background: 'linear-gradient(135deg, #2563EB, #7C3AED)' }}
        aria-label="Scan or add entry"
      >
        <Plus size={28} strokeWidth={2} className="group-hover:rotate-90 transition-transform duration-300" />
        <span className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping opacity-20" />
      </Link>

      {/* ── Mobile Bottom Nav ── */}
      <footer
        className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-6 pb-6 pt-2 rounded-t-[3rem] shadow-[0_-10px_40px_rgba(0,0,0,0.04)] glass-border"
        style={{ background: 'rgba(255,255,255,0.30)', backdropFilter: 'blur(24px)' }}
      >
        {(
          [
            { icon: LayoutGrid, label: 'Home', href: '/dashboard', active: false },
            { icon: TrendingUp, label: 'Ledger', href: '/ledger', active: true },
            { icon: Wallet, label: 'Wallets', href: '#', active: false },
            { icon: User, label: 'Profile', href: '#', active: false },
          ] as const
        ).map(({ icon: Icon, label, href, active }) => (
          <Link
            key={label}
            href={href}
            className={`flex flex-col items-center justify-center p-3 rounded-full transition-all duration-300 ${
              active
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/40 scale-110'
                : 'text-slate-500 hover:text-blue-500'
            }`}
          >
            <Icon size={20} />
            <span className="text-[11px] font-bold uppercase tracking-widest mt-1">{label}</span>
          </Link>
        ))}
      </footer>
    </div>
  )
}
