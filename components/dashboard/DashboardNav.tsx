'use client'

/**
 * DashboardNav — Sleek Top Header Navigation
 * Features:
 *  - Fixed, solid white background with bottom border
 *  - Core navigation [Overview, Ledger, Scanner, Recordings]
 *  - Account dropdown menu
 */
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import { signOut } from '@/app/actions/auth'
import { Search, Bell, Settings, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

const NAV_ITEMS = [
  { label: 'Overview', href: '/dashboard' },
  { label: 'Ledger',   href: '/ledger' },
]

type Props = { displayName: string }

export default function DashboardNav({ displayName }: Props) {
  const pathname = usePathname()
  const initial  = displayName.charAt(0).toUpperCase()

  // ── Account dropdown ───────────────────────────────────────
  const [open, setOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  // ── Notifications ──────────────────────────────────────────
  const [unreadCount, setUnreadCount] = useState(0)

  useEffect(() => {
    let canceled = false
    let channel: ReturnType<typeof supabase.channel> | null = null

    async function init() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user || canceled) return

      const userId = user.id

      async function checkNotifications() {
        if (canceled) return
        const { count } = await supabase
          .from('notifications')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId)
          .eq('is_read', false)
        if (count !== null && !canceled) setUnreadCount(count)
      }

      checkNotifications()

      channel = supabase
        .channel(`nav-notifications-${userId}`)
        .on('postgres_changes', { event: '*', schema: 'public', table: 'notifications' }, () => {
          checkNotifications()
        })
        .subscribe()
    }

    init()

    return () => {
      canceled = true
      if (channel) {
        supabase.removeChannel(channel)
        channel = null
      }
    }
  }, [])

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [])

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="flex items-center justify-between max-w-7xl mx-auto px-6 py-3">

        {/* ── Brand + Nav ── */}
        <div className="flex items-center gap-8">
          <Link
            href="/"
            className="text-2xl font-black text-blue-600 tracking-tight hover:opacity-80 transition-opacity"
            style={{ fontFamily: 'var(--font-headline, sans-serif)' }}
          >
            Khata
          </Link>

          <nav className="hidden md:flex items-center gap-2">
            {NAV_ITEMS.map(({ label, href }) => {
              const active = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`px-3 py-1.5 text-sm font-semibold transition-all ${
                    active
                      ? 'text-blue-600 border-b-2 border-blue-600 rounded-none'
                      : 'text-gray-600 hover:bg-gray-100 rounded-lg'
                  }`}
                >
                  {label}
                </Link>
              )
            })}
          </nav>
        </div>

        {/* ── Right actions ── */}
        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="hidden md:flex items-center rounded-lg px-4 py-2 gap-2 bg-gray-50 border border-gray-200">
            <Search size={15} className="text-gray-400 shrink-0" />
            <input
              className="bg-transparent border-none outline-none text-sm w-44 text-gray-800 placeholder-gray-400"
              placeholder="Search transactions..."
              type="text"
            />
          </div>

          {/* Notifications */}
          <Link href="/notifications" className="relative p-2 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors inline-block">
            <Bell size={18} />
            {unreadCount > 0 && (
              <span className="absolute top-2 right-2.5 w-2 h-2 bg-red-500 rounded-full border border-white" />
            )}
          </Link>

          {/* ── Avatar + dropdown ── */}
          <div ref={dropdownRef} className="relative">
            <button
              onClick={() => setOpen((v) => !v)}
              aria-label="Account menu"
              className="w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm flex items-center justify-center transition-colors focus:ring-2 focus:ring-blue-600 focus:ring-offset-2"
            >
              {initial}
            </button>

            {/* Dropdown panel */}
            {open && (
              <div className="absolute right-0 top-12 w-52 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden z-50">
                {/* User info */}
                <div className="px-4 py-3.5 border-b border-gray-100 bg-gray-50">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-0.5">
                    Signed in as
                  </p>
                  <p className="text-sm font-semibold text-gray-800 truncate">
                    {displayName}
                  </p>
                </div>

                {/* Menu items */}
                <div className="p-1.5 space-y-0.5">
                  <button className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-100 transition-colors text-left">
                    <Settings size={15} className="shrink-0" />
                    Settings
                  </button>

                  <form action={signOut} className="w-full">
                    <button
                      type="submit"
                      className="w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-red-600 hover:bg-red-50 transition-colors text-left"
                    >
                      <LogOut size={15} className="shrink-0" />
                      Sign Out
                    </button>
                  </form>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
