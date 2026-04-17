'use client'

/**
 * Navbar — Client Component (needs state for mobile menu toggle)
 * Mobile: hamburger icon → slide-down menu
 * Desktop (lg+): horizontal nav links + CTA button
 */

import { useState } from 'react'
import Link from 'next/link'
import { Menu, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const NAV_LINKS = [
  { label: 'Overview', href: '#overview' },
  { label: 'Ledger', href: '#ledger' },
  { label: 'System', href: '#system' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)

  return (
    <header className="fixed inset-x-0 top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-[#3B5BDB] hover:opacity-80 transition-opacity"
        >
          Khata
        </Link>

        {/* Desktop nav links — hidden on mobile */}
        <ul className="hidden lg:flex items-center gap-8">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                className="text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Desktop CTA — hidden on mobile */}
        <div className="hidden lg:flex items-center gap-3">
          <Link
            href="#login"
            className="text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors min-h-[44px] flex items-center px-2"
          >
            Login
          </Link>
          <Button
            asChild
            className="rounded-full bg-[#3B5BDB] hover:bg-[#2f4ac4] text-white text-sm font-semibold px-5 py-2 min-h-[44px] transition-all hover:scale-[1.03] hover:shadow-md"
          >
            <Link href="#waitlist">Get Early Access</Link>
          </Button>
        </div>

        {/* Mobile hamburger — visible only below lg */}
        <button
          aria-label={open ? 'Close menu' : 'Open menu'}
          onClick={() => setOpen((prev) => !prev)}
          className="lg:hidden flex items-center justify-center w-11 h-11 rounded-lg hover:bg-gray-100 transition-colors"
        >
          {open ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      {/* Mobile slide-down menu */}
      <div
        className={cn(
          'lg:hidden overflow-hidden transition-all duration-300 ease-in-out bg-white border-b border-gray-100',
          open ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        )}
      >
        <ul className="flex flex-col px-4 pb-4 pt-2 gap-1">
          {NAV_LINKS.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                onClick={() => setOpen(false)}
                className="block text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg py-3 px-3 transition-colors min-h-[44px] flex items-center"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li className="pt-2 flex flex-col gap-2">
            <Link
              href="#login"
              onClick={() => setOpen(false)}
              className="block text-center text-sm font-medium text-gray-700 border border-gray-200 rounded-full py-2.5 hover:bg-gray-50 transition-colors"
            >
              Login
            </Link>
            <Link
              href="#waitlist"
              onClick={() => setOpen(false)}
              className="block text-center text-sm font-semibold text-white bg-[#3B5BDB] hover:bg-[#2f4ac4] rounded-full py-2.5 transition-colors"
            >
              Get Early Access
            </Link>
          </li>
        </ul>
      </div>
    </header>
  )
}
