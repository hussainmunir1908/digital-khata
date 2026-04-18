'use client'

import { LedgerEntry, Profile } from '@/types/database'
import { differenceInDays, parseISO } from 'date-fns'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { BellRing, CreditCard } from 'lucide-react'
import BulkSettleModal, { BulkContact } from '@/components/payment/BulkSettleModal'
import { useState } from 'react'

type Props = {
  entries: LedgerEntry[]
  profile: Profile | null
}

const AVATAR_COLORS = [
  'bg-blue-100 text-blue-700',
  'bg-cyan-100 text-cyan-700',
  'bg-orange-100 text-orange-700',
  'bg-pink-100 text-pink-700',
  'bg-teal-100 text-teal-700',
  'bg-amber-100 text-amber-700',
]

const supabase = createClient()

export default function ContactCircleCards({ entries, profile }: Props) {
  const [payingContact, setPayingContact] = useState<BulkContact | null>(null)

  // Aggregate by contact — collect ALL entry IDs
  const contactMap = new Map<string, {
    net: number
    lastActivity: Date
    userId: string | null
    entryIds: string[]
    latestEntryId: string | null
  }>()

  for (const entry of entries) {
    const date        = parseISO(entry.created_at)
    const contribution = entry.type === 'debt' ? Number(entry.amount) : -Number(entry.amount)
    const keyName     = entry.profiles?.full_name || entry.person_name
    const existing    = contactMap.get(keyName)

    if (!existing) {
      contactMap.set(keyName, {
        net:           contribution,
        lastActivity:  date,
        userId:        entry.associated_user_id || null,
        entryIds:      [entry.id],
        latestEntryId: entry.id,
      })
    } else {
      contactMap.set(keyName, {
        net:           existing.net + contribution,
        lastActivity:  date > existing.lastActivity ? date : existing.lastActivity,
        userId:        entry.associated_user_id ?? existing.userId,
        entryIds:      [...existing.entryIds, entry.id],
        latestEntryId: date > existing.lastActivity ? entry.id : existing.latestEntryId,
      })
    }
  }

  const contacts = Array.from(contactMap.entries())
    .map(([entity, v]) => ({ entity, ...v }))
    .filter(c => Math.abs(c.net) > 0.01)

  async function handleAction(e: React.MouseEvent, contact: typeof contacts[0], action: 'remind' | 'pay') {
    e.preventDefault()

    if (action === 'pay') {
      setPayingContact({
        entryIds:        contact.entryIds,
        associatedUserId: contact.userId,
        payeeName:       contact.entity,
        totalAmount:     Math.abs(contact.net),
      })
      return
    }

    if (!contact.userId) { toast.error('User not registered yet.'); return }
    if (!profile)        { toast.error('Complete your profile to use this feature.'); return }

    const { error } = await supabase.from('notifications').insert({
      user_id:   contact.userId,
      sender_id: profile.id,
      ledger_id: contact.latestEntryId,
      type:      'reminder',
      message:   `${profile.full_name || 'Someone'} has reminded you to settle a balance of Rs ${Math.abs(contact.net)}.`,
    })

    if (error) toast.error(`Failed to send reminder: ${error.message}`)
    else       toast.success('Reminder sent!')
  }

  if (contacts.length === 0) {
    return (
      <section>
        <h2 className="text-lg font-bold text-gray-800 mb-4">Your Circle</h2>
        <div className="rounded-xl p-8 text-center bg-white border border-gray-200 shadow-sm">
          <p className="text-gray-500">No contacts yet. Add ledger entries to see your circle.</p>
        </div>
      </section>
    )
  }

  return (
    <section className="relative">
      <BulkSettleModal contact={payingContact} onClose={() => setPayingContact(null)} />
      <h2 className="text-lg font-bold text-gray-800 mb-4">Your Circle</h2>

      <div className="flex gap-4 overflow-x-auto pb-3 custom-scrollbar sm:grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 sm:overflow-visible sm:pb-0">
        {contacts.map((contact, i) => {
          const isOwesMe  = contact.net > 0
          const daysSince = differenceInDays(new Date(), contact.lastActivity)
          const isDueSoon = daysSince >= 3

          return (
            <div
              key={contact.entity}
              className="relative flex flex-col gap-3 rounded-xl p-5 min-w-[200px] sm:min-w-0 bg-white border border-gray-200 shadow-sm hover:border-gray-300 hover:shadow-md transition-all duration-300"
            >
              <div className="absolute top-4 right-4">
                {isDueSoon ? (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-red-100 text-red-600">Due soon</span>
                ) : (
                  <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-500">Pending</span>
                )}
              </div>

              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl font-bold shrink-0 ${AVATAR_COLORS[i % AVATAR_COLORS.length]}`}>
                {contact.entity.charAt(0).toUpperCase()}
              </div>

              <div>
                <p className="font-bold text-gray-900 text-base leading-tight">{contact.entity}</p>
                <p className="text-sm text-gray-500 mt-0.5">{isOwesMe ? 'Owes you' : 'You owe'}</p>
                <p className={`text-2xl font-black mt-1 ${isOwesMe ? 'text-blue-600' : 'text-red-600'}`}>
                  <span className="text-sm font-bold opacity-70">Rs</span> {Math.abs(contact.net).toLocaleString()}
                </p>
              </div>

              <div className="mt-auto pt-2 border-t border-gray-100 flex">
                {isOwesMe ? (
                  <button
                    onClick={(e) => handleAction(e, contact, 'remind')}
                    className="flex-1 text-xs font-semibold text-gray-600 hover:text-gray-900 border border-gray-200 px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <BellRing size={14} /> Send Reminder
                  </button>
                ) : (
                  <button
                    onClick={(e) => handleAction(e, contact, 'pay')}
                    className="flex-1 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 px-3 py-1.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                  >
                    <CreditCard size={14} /> Pay Now
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
