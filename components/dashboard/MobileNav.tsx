'use client'

/**
 * MobileNav — Shared bottom navigation bar for mobile devices.
 * Implements the "Mobile-First" approach where Voice Ledger (Recordings) 
 * and Scanner are top-level icons alongside Home and Ledger.
 */
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutGrid, TrendingUp, User } from 'lucide-react'

const MOBILE_NAV_ITEMS = [
  { icon: LayoutGrid, label: 'Overview',   href: '/dashboard' },
  { icon: TrendingUp, label: 'Ledger',     href: '/ledger' },
  { icon: User,       label: 'Profile',    href: '/dashboard' },
]

export default function MobileNav() {
  const pathname = usePathname()

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-[40] bg-white border-t border-gray-200 safe-area-bottom">
      <div className="flex justify-around items-center px-4 py-2">
        {MOBILE_NAV_ITEMS.map(({ icon: Icon, label, href }) => {
          const active = pathname === href || pathname.startsWith(`${href}/`)

          return (
            <Link
              key={label}
              href={href}
              className={`flex flex-col items-center justify-center p-2 min-w-[64px] transition-colors ${
                active ? 'text-blue-600' : 'text-gray-500 hover:text-gray-800'
              }`}
            >
              <div
                className={`flex items-center justify-center w-12 h-8 rounded-full mb-1 transition-all ${
                  active ? 'bg-blue-100' : 'bg-transparent'
                }`}
              >
                <Icon size={20} className={active ? 'fill-current opacity-20 stroke-[1.5]' : 'stroke-2'} />
                {/* Note: fill-current + opacity-20 simulates a filled/active state while letting the primary stroke show */}
                {/* Since lucide uses SVG lines, true fill differs per icon, so we use stroke styling for consistency */}
              </div>
              <span
                className={`text-[10px] font-semibold ${
                  active ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
