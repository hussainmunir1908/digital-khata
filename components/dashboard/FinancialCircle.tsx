'use client'

import { LedgerEntry, Profile } from '@/types/database'
import { ArrowRight, BellRing, CreditCard } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import PaymentModal from '@/components/payment/PaymentModal'
import { useState } from 'react'

type Props = { 
  entries: LedgerEntry[]
  profile: Profile | null
}

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-purple-100 text-purple-700',
  'bg-pink-100 text-pink-700',
  'bg-orange-100 text-orange-700',
  'bg-emerald-100 text-emerald-700',
  'bg-sky-100 text-sky-700',
]

function getAvatarColor(name: string) {
  let h = 0
  for (let i = 0; i < name.length; i++) h = name.charCodeAt(i) + ((h << 5) - h)
  return AVATAR_COLORS[Math.abs(h) % AVATAR_COLORS.length]
}

export default function FinancialCircle({ entries, profile }: Props) {
  const supabase = createClient()
  const [payingEntryId, setPayingEntryId] = useState<string | null>(null)

  // Aggregate by entity
  const map = new Map<string, { owesMe: number; iOwe: number; userId: string | null; entryId: string | null }>()
  entries.forEach((e) => {
    const keyName = e.profiles?.full_name || e.person_name
    const cur = map.get(keyName) ?? { owesMe: 0, iOwe: 0, userId: null, entryId: null }
    if (e.type === 'debt') cur.owesMe += Number(e.amount)
    else cur.iOwe += Number(e.amount)

    // Keep the most recent association info
    if (e.associated_user_id) cur.userId = e.associated_user_id
    cur.entryId = e.id

    map.set(keyName, cur)
  })

  const people = Array.from(map.entries())
    .map(([name, { owesMe, iOwe, userId, entryId }]) => ({ name, net: owesMe - iOwe, userId, entryId }))
    .sort((a, b) => Math.abs(b.net) - Math.abs(a.net))
    .slice(0, 4)

  async function handleAction(e: React.MouseEvent, person: typeof people[0], action: 'remind' | 'pay') {
    e.preventDefault()
    if (action === 'pay') {
      if (person.entryId) setPayingEntryId(person.entryId)
      return
    }

    if (!person.userId) {
      toast.error('User not registered yet.')
      return
    }
    if (!profile) {
      toast.error('Complete your profile to use this feature.')
      return
    }

    const { error } = await supabase.from('notifications').insert({
      user_id: person.userId,
      sender_id: profile.id,
      ledger_id: person.entryId, // closest reference
      type: 'reminder',
      message: `${profile.full_name || 'Someone'} has reminded you to settle a balance of Rs ${Math.abs(person.net)}.`,
    })

    if (error) {
      toast.error(`Failed to send reminder: ${error.message}`)
    } else {
      toast.success('Reminder sent!')
    }
  }

  return (
    <div className="space-y-5">
      <PaymentModal entryId={payingEntryId} onClose={() => setPayingEntryId(null)} />
      <div className="flex items-center justify-between px-1">
        <h2
          className="text-xl font-bold text-gray-800 tracking-tight"
          style={{ fontFamily: 'var(--font-headline, sans-serif)' }}
        >
          Financial Circle
        </h2>
        <button className="text-blue-600 text-sm font-semibold flex items-center gap-1 hover:gap-2 transition-all">
          View All <ArrowRight size={14} />
        </button>
      </div>

      {people.length === 0 ? (
        <div className="rounded-xl p-10 text-center bg-white border border-gray-200 shadow-sm">
          <p className="text-gray-500 text-sm">No contacts yet. Add a ledger entry to build your Financial Circle.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {people.map(({ name, net, userId, entryId }) => {
            const owesMe = net > 0
            const settled = net === 0
            
            return (
              <div
                key={name}
                className="flex flex-col justify-between p-5 rounded-xl bg-white border border-gray-200 shadow-sm hover:border-gray-300 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${getAvatarColor(name)}`}
                    >
                      {name.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 truncate pr-2">
                      <h3 className="font-bold text-gray-900 truncate">{name}</h3>
                      <p className="text-xs text-gray-500 mt-0.5">
                        {settled ? 'Settled' : owesMe ? 'Owes you' : 'You owe'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span
                      className={`font-extrabold tabular-nums ${
                        settled ? 'text-gray-400' : owesMe ? 'text-emerald-600' : 'text-red-500'
                      }`}
                      style={{ fontFamily: 'var(--font-headline, sans-serif)' }}
                    >
                      <span className="text-xs">Rs</span> {Math.abs(net).toLocaleString('en-US', { minimumFractionDigits: 0 })}
                    </span>
                  </div>
                </div>

                <div className="mt-auto border-t border-gray-100 pt-3 flex justify-end">
                  {!settled && (
                    owesMe ? (
                      <button 
                        onClick={(e) => handleAction(e, { name, net, userId, entryId }, 'remind')}
                        className="text-xs font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors"
                      >
                        <BellRing size={12} />
                        Send Reminder
                      </button>
                    ) : (
                      <button 
                        onClick={(e) => handleAction(e, { name, net, userId, entryId }, 'pay')}
                        className="text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded flex items-center gap-1.5 transition-colors shadow-sm"
                      >
                        <CreditCard size={12} />
                        Pay Now
                      </button>
                    )
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
