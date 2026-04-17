'use client'

import { LedgerEntry } from '@/types/database'
import { differenceInDays, parseISO } from 'date-fns'

type Props = { entries: LedgerEntry[] }

type ContactSummary = {
  entity: string
  net: number
  lastActivity: Date
}

const AVATAR_GRADIENTS = [
  'linear-gradient(135deg, #3B5BDB, #7C3AED)',
  'linear-gradient(135deg, #0891B2, #0D9488)',
  'linear-gradient(135deg, #DC2626, #EA580C)',
  'linear-gradient(135deg, #7C3AED, #DB2777)',
  'linear-gradient(135deg, #059669, #0D9488)',
  'linear-gradient(135deg, #D97706, #B45309)',
]

export default function ContactCircleCards({ entries }: Props) {
  const contactMap = new Map<string, ContactSummary>()

  for (const entry of entries) {
    const date = parseISO(entry.created_at)
    // debt = entity owes me (+), credit = I owe entity (-)
    const contribution = entry.type === 'debt' ? entry.amount : -entry.amount
    const existing = contactMap.get(entry.person_name)

    if (!existing) {
      contactMap.set(entry.person_name, { entity: entry.person_name, net: contribution, lastActivity: date })
    } else {
      contactMap.set(entry.person_name, {
        ...existing,
        net: existing.net + contribution,
        lastActivity: date > existing.lastActivity ? date : existing.lastActivity,
      })
    }
  }

  const contacts = Array.from(contactMap.values()).filter(c => Math.abs(c.net) > 0.01)

  if (contacts.length === 0) {
    return (
      <section>
        <h2 className="text-lg font-bold text-slate-800 mb-4">Your Circle</h2>
        <div
          className="rounded-3xl p-8 text-center glass-border"
          style={{ background: 'rgba(255,255,255,0.35)', backdropFilter: 'blur(20px)' }}
        >
          <p className="text-slate-500">No contacts yet. Add ledger entries to see your circle.</p>
        </div>
      </section>
    )
  }

  return (
    <section>
      <h2 className="text-lg font-bold text-slate-800 mb-4">Your Circle</h2>
      {/* Horizontal scroll on mobile, responsive grid on sm+ */}
      <div className="flex gap-4 overflow-x-auto pb-3 custom-scrollbar sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:overflow-visible sm:pb-0">
        {contacts.map((contact, i) => {
          const isOwesMe = contact.net > 0
          const daysSince = differenceInDays(new Date(), contact.lastActivity)
          const isDueSoon = daysSince >= 3
          const initial = contact.entity.charAt(0).toUpperCase()
          const gradient = AVATAR_GRADIENTS[i % AVATAR_GRADIENTS.length]

          return (
            <div
              key={contact.entity}
              className="relative flex flex-col gap-3 rounded-3xl p-5 min-w-[200px] sm:min-w-0 glass-border shadow-sm hover:shadow-md transition-all duration-300"
              style={{ background: 'rgba(255,255,255,0.45)', backdropFilter: 'blur(20px)' }}
            >
              {/* Status Badge */}
              <div className="absolute top-4 right-4">
                {isDueSoon ? (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 text-red-600">
                    Due soon
                  </span>
                ) : (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500">
                    Pending
                  </span>
                )}
              </div>

              {/* Avatar */}
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold text-white shadow-md"
                style={{ background: gradient }}
              >
                {initial}
              </div>

              {/* Details */}
              <div>
                <p className="font-bold text-slate-900 text-base leading-tight">{contact.entity}</p>
                <p className="text-sm text-slate-500 mt-0.5">{isOwesMe ? 'Owes you' : 'You owe'}</p>
                <p className={`text-2xl font-black mt-1 ${isOwesMe ? 'text-blue-600' : 'text-red-600'}`}>
                  Rs {Math.abs(contact.net).toLocaleString()}
                </p>
              </div>

              {/* Action Link */}
              <button
                className={`text-sm font-semibold mt-auto text-left transition-colors ${
                  isOwesMe
                    ? 'text-blue-600 hover:text-blue-800'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
              >
                {isOwesMe ? 'Send Reminder →' : 'Settle Up 💳'}
              </button>
            </div>
          )
        })}
      </div>
    </section>
  )
}
