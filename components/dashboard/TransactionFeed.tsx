'use client'

import { LedgerEntry, Profile } from '@/types/database'
import { format, parseISO } from 'date-fns'
import {
  UtensilsCrossed,
  Car,
  ShoppingCart,
  DollarSign,
  Receipt,
  Download,
  BellRing,
  CreditCard,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import PaymentModal from '@/components/payment/PaymentModal'
import { useState } from 'react'

type Props = { 
  entries: LedgerEntry[]
  profile: Profile | null
}

type IconConfig = { icon: React.ElementType; bg: string; iconColor: string }

function categoryIcon(category: string | null): IconConfig {
  const cat = (category ?? '').toLowerCase()
  if (cat.includes('lunch') || cat.includes('food') || cat.includes('dinner') || cat.includes('breakfast'))
    return { icon: UtensilsCrossed, bg: 'bg-blue-100', iconColor: 'text-blue-600' }
  if (cat.includes('uber') || cat.includes('transport') || cat.includes('ride') || cat.includes('fuel') || cat.includes('car'))
    return { icon: Car, bg: 'bg-orange-100', iconColor: 'text-orange-600' }
  if (cat.includes('grocer') || cat.includes('market') || cat.includes('shop'))
    return { icon: ShoppingCart, bg: 'bg-purple-100', iconColor: 'text-purple-600' }
  if (cat.includes('payment') || cat.includes('receive') || cat.includes('settle'))
    return { icon: DollarSign, bg: 'bg-emerald-100', iconColor: 'text-emerald-600' }
  return { icon: Receipt, bg: 'bg-gray-100', iconColor: 'text-gray-500' }
}

export default function TransactionFeed({ entries, profile }: Props) {
  const supabase = createClient()
  const [payingEntryId, setPayingEntryId] = useState<string | null>(null)

  async function handleAction(e: React.MouseEvent, entry: LedgerEntry, action: 'remind' | 'pay') {
    e.preventDefault()
    if (action === 'pay') {
      setPayingEntryId(entry.id)
      return
    }

    if (!entry.associated_user_id) {
      toast.error('User not registered yet.')
      return
    }
    if (!profile) {
      toast.error('Complete your profile to use this feature.')
      return
    }

    const { error } = await supabase.from('notifications').insert({
      user_id: entry.associated_user_id,
      sender_id: profile.id,
      ledger_id: entry.id,
      type: 'reminder',
      message: `${profile.full_name || 'Someone'} has reminded you to settle a balance of Rs ${entry.amount}.`,
    })

    if (error) {
      toast.error(`Failed to send reminder: ${error.message}`)
    } else {
      toast.success('Reminder sent!')
    }
  }

  const sorted = [...entries].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col relative">
      <PaymentModal entryId={payingEntryId} onClose={() => setPayingEntryId(null)} />
      <div className="flex items-center justify-between mb-5 shrink-0">
        <h2
          className="text-xl font-bold text-gray-800"
          style={{ fontFamily: 'var(--font-headline, sans-serif)' }}
        >
          Recent Activity
        </h2>
      </div>

      <div className="p-2 space-y-1">
        {sorted.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-12 text-center px-6">
            <div className="w-14 h-14 bg-blue-50 rounded-full flex items-center justify-center mb-4">
              <Receipt size={22} className="text-blue-500" />
            </div>
            <p className="font-bold text-gray-700 text-sm mb-1">No activity yet</p>
            <p className="text-xs text-gray-400">
              Add an entry to see your transaction history here.
            </p>
          </div>
        ) : (
          sorted.map((entry) => {
            const isDebt = entry.type === 'debt'

            return (
              <div
                key={entry.id}
                className="flex flex-col gap-3 p-4 rounded-xl border border-transparent hover:border-gray-100 hover:bg-gray-50 transition-all"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                        isDebt ? 'bg-sky-100 text-sky-700' : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {(entry.profiles?.full_name || entry.person_name || '?').charAt(0).toUpperCase()}
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-gray-800 truncate">
                        {entry.profiles?.full_name || entry.person_name}
                      </p>
                      <p className="text-[10px] text-gray-400 mt-0.5">
                        {format(parseISO(entry.created_at), "MMM d, h:mm a")}
                        {entry.description ? ` · ${entry.description}` : ''}
                      </p>
                    </div>
                  </div>

                  {/* Amount */}
                  <div className="text-right shrink-0">
                    <p
                      className={`font-extrabold tabular-nums block ${isDebt ? 'text-emerald-600' : 'text-red-500'}`}
                      style={{ fontFamily: 'var(--font-headline, sans-serif)' }}
                    >
                      {isDebt ? '+' : '-'}
                      <span className="text-xs">Rs</span> {Number(entry.amount).toLocaleString()}
                    </p>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex justify-end border-t border-gray-100 pt-2">
                  {isDebt ? (
                    <button
                      onClick={(e) => handleAction(e, entry, 'remind')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-semibold transition-colors"
                    >
                      <BellRing size={12} /> Send Reminder
                    </button>
                  ) : (
                    <button
                      onClick={(e) => handleAction(e, entry, 'pay')}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors"
                    >
                      <CreditCard size={12} /> Pay Now
                    </button>
                  )}
                </div>
              </div>
            )
          })
        )}
      </div>

      {/* Footer */}
      <div className="p-4 text-center border-t border-gray-100 shrink-0">
        <button className="text-blue-600 text-xs font-bold hover:underline flex items-center justify-center w-full gap-1 p-1">
          <Download size={14} />
          Download Statement (PDF)
        </button>
      </div>
    </div>
  )
}
