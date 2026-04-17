/**
 * Footer — Server Component
 * Simple two-row footer: logo + copyright left, nav links right.
 * Stacks vertically on mobile, horizontal on sm+.
 */

import Link from 'next/link'

const FOOTER_LINKS = [
  { label: 'Privacy', href: '#' },
  { label: 'Legal', href: '#' },
  { label: 'Twitter', href: '#' },
  { label: 'Support', href: '#' },
]

export default function Footer() {
  const year = new Date().getFullYear()

  return (
    <footer className="bg-white border-t border-gray-100 py-8">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          {/* Left: logo + copyright */}
          <div className="flex flex-col items-center sm:items-start gap-1">
            <Link
              href="/"
              className="text-lg font-bold text-[#3B5BDB] hover:opacity-80 transition-opacity"
            >
              Khata
            </Link>
            <p className="text-xs text-gray-400">
              © {year} Khata. All rights reserved.
            </p>
          </div>

          {/* Right: footer nav links */}
          <nav aria-label="Footer navigation">
            <ul className="flex items-center gap-5 flex-wrap justify-center sm:justify-end">
              {FOOTER_LINKS.map((link) => (
                <li key={link.label}>
                  <Link
                    href={link.href}
                    className="text-xs text-gray-400 hover:text-gray-700 transition-colors uppercase tracking-wide font-medium"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        </div>
      </div>
    </footer>
  )
}
