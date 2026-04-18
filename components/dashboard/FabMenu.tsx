'use client'

/**
 * components/dashboard/FabMenu.tsx
 * Floating Action Button with a pop-up menu of three entry options.
 * Closes on outside click or Escape key.
 */
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { Plus, PencilLine, Mic, ScanLine } from 'lucide-react'

const MENU_ITEMS = [
  {
    href:  '/entryPage',
    icon:  PencilLine,
    label: 'Enter Data',
    desc:  'Manual ledger entry',
    color: 'bg-violet-500',
  },
  {
    href:  '/recordings',
    icon:  Mic,
    label: 'Record Data',
    desc:  'Voice → AI ledger',
    color: 'bg-blue-500',
  },
  {
    href:  '/scanner',
    icon:  ScanLine,
    label: 'Upload Image',
    desc:  'Scan a receipt',
    color: 'bg-emerald-500',
  },
]

export default function FabMenu() {
  const [open, setOpen] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)

  // Close on outside click
  useEffect(() => {
    function onPointerDown(e: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('pointerdown', onPointerDown)
    return () => document.removeEventListener('pointerdown', onPointerDown)
  }, [])

  // Close on Escape
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [])

  return (
    <div ref={containerRef} className="fixed bottom-24 md:bottom-8 right-6 md:right-8 z-50 flex flex-col items-end gap-3">

      {/* ── Pop-up menu items ── */}
      <div
        className={`flex flex-col items-end gap-2 transition-all duration-300 origin-bottom ${
          open
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        aria-hidden={!open}
      >
        {MENU_ITEMS.map(({ href, icon: Icon, label, desc, color }) => (
          <Link
            key={href}
            href={href}
            onClick={() => setOpen(false)}
            className="flex items-center gap-3 pr-4 pl-3 py-2.5 rounded-2xl bg-white shadow-sm border border-gray-200 hover:border-gray-300 hover:shadow-md hover:-translate-y-0.5 active:scale-95 transition-all group"
          >
            <span className={`w-8 h-8 flex items-center justify-center rounded-xl ${color} text-white shrink-0 shadow-sm`}>
              <Icon size={16} />
            </span>
            <span className="text-right">
              <span className="block text-sm font-bold text-gray-800 group-hover:text-blue-600 transition-colors">
                {label}
              </span>
              <span className="block text-[11px] font-medium text-gray-400">{desc}</span>
            </span>
          </Link>
        ))}
      </div>

      {/* ── FAB button ── */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close menu' : 'Add entry'}
        aria-expanded={open}
        className="w-14 h-14 md:w-16 md:h-16 text-white rounded-full flex items-center justify-center shadow-lg shadow-blue-600/30 hover:scale-110 active:scale-95 transition-all group relative border border-blue-400/20"
        style={{ background: '#2563EB' }}
      >
        <Plus
          size={28}
          strokeWidth={2}
          className={`transition-transform duration-300 ${open ? 'rotate-45' : 'group-hover:rotate-90'}`}
        />
        {!open && (
          <span className="absolute inset-0 rounded-full border-2 border-white/30 animate-ping opacity-20" />
        )}
      </button>
    </div>
  )
}
