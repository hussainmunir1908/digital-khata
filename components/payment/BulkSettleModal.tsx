'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, FileCheck, ShieldCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

export type BulkContact = {
  entryIds: string[]          // every pending entry ID for this contact
  associatedUserId: string | null
  payeeName: string
  totalAmount: number
}

type Props = {
  contact: BulkContact | null
  onClose: () => void
}

const STAGES = [
  'Authenticating payment gateway…',
  'Authorizing transfer…',
  'Finalizing receipt…',
]

export default function BulkSettleModal({ contact, onClose }: Props) {
  const router = useRouter()
  const [stage, setStage] = useState(STAGES[0])
  const running = useRef(false)

  useEffect(() => {
    if (!contact || running.current) return
    running.current = true

    async function process() {
      setStage(STAGES[0])

      const { data: { user } } = await supabase.auth.getUser()
      let payerName = 'You'
      if (user) {
        const { data: profile } = await supabase
          .from('profiles').select('full_name').eq('id', user.id).single()
        if (profile?.full_name) payerName = profile.full_name
      }

      await new Promise(r => setTimeout(r, 1800))
      setStage(STAGES[1])

      // Mark every one of MY entries for this contact as paid
      await supabase
        .from('ledger')
        .update({ status: 'paid' })
        .in('id', contact.entryIds)

      // Mark the exact mirror entries on the other user's side as paid
      // (only the ones that link back to me, not their entire ledger)
      if (contact.associatedUserId && user) {
        await supabase
          .from('ledger')
          .update({ status: 'paid' })
          .eq('user_id', contact.associatedUserId)
          .eq('associated_user_id', user.id)
          .in('status', ['pending', null])  // only touch unsettled ones
      }

      await new Promise(r => setTimeout(r, 2000))
      setStage(STAGES[2])
      await new Promise(r => setTimeout(r, 800))

      const params = new URLSearchParams({
        id:     contact.entryIds[0] ?? '',
        payer:  payerName,
        payee:  contact.payeeName,
        amount: String(contact.totalAmount),
        ts:     new Date().toISOString(),
      })
      router.push(`/successPayment?${params.toString()}`)
    }

    process()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  if (!contact) return null

  return (
    <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl shadow-[0_24px_48px_-12px_rgba(0,0,0,0.3)] w-full max-w-sm p-10 flex flex-col items-center text-center animate-in fade-in zoom-in-95 duration-500 relative overflow-hidden ring-1 ring-slate-900/5">
        <div className="absolute top-0 left-0 w-full h-1.5 bg-blue-50">
          <div className="h-full bg-blue-600 animate-[loading_5s_ease-in-out_forwards]" />
        </div>

        <div className="relative mb-6">
          <div className="w-20 h-20 rounded-full bg-blue-50 border-4 border-white shadow-inner flex items-center justify-center absolute left-0 top-0">
            <ShieldCheck className="w-8 h-8 text-blue-300 opacity-50" />
          </div>
          <div className="w-20 h-20 rounded-full bg-blue-600/5 flex items-center justify-center ring-8 ring-blue-50/50">
            <Loader2 className="w-10 h-10 text-blue-600 animate-spin" />
          </div>
        </div>

        <h3
          className="text-2xl font-bold text-slate-900 mb-2 tracking-tight"
          style={{ fontFamily: 'var(--font-headline, sans-serif)' }}
        >
          Processing
        </h3>
        <p className="text-slate-500 text-sm font-medium animate-pulse">{stage}</p>

        <div className="mt-6 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded border border-slate-100">
          <FileCheck size={14} className="text-emerald-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Encrypted</span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `@keyframes loading { 0% { width: 0% } 100% { width: 100% } }` }} />
    </div>
  )
}
