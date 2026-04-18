'use client'

import { useEffect, useRef, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ShieldCheck, FileCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()

const STAGES = [
  'Authenticating payment gateway…',
  'Authorizing transfer…',
  'Finalizing secure receipt…',
]

export default function PaymentModal({ entryId }: { entryId: string | null; onClose: () => void }) {
  const router = useRouter()
  const [stage, setStage] = useState(STAGES[0])
  const running = useRef(false)

  useEffect(() => {
    if (!entryId || running.current) return
    running.current = true

    async function processPayment() {
      setStage(STAGES[0])

      // 1. Fetch entry + current user profile in parallel
      const [{ data: entry }, { data: { user } }] = await Promise.all([
        supabase.from('ledger').select('*').eq('id', entryId).single(),
        supabase.auth.getUser(),
      ])

      let payerName = 'You'
      if (user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', user.id)
          .single()
        if (profile?.full_name) payerName = profile.full_name
      }

      // Determine payee:
      // - If the entry belongs to the current user → person_name is who they're paying
      // - If the entry belongs to someone else (paying via notification) → that person is the payee
      let payeeName = entry?.person_name ?? 'Unknown'
      if (entry && user && entry.user_id !== user.id) {
        const { data: ownerProfile } = await supabase
          .from('profiles')
          .select('full_name')
          .eq('id', entry.user_id)
          .single()
        if (ownerProfile?.full_name) payeeName = ownerProfile.full_name
      }

      await new Promise(r => setTimeout(r, 1800))
      setStage(STAGES[1])

      // 2. Mark both sides as paid
      if (entry) {
        await supabase.from('ledger').update({ status: 'paid' }).eq('id', entryId)

        if (entry.associated_user_id) {
          await supabase
            .from('ledger')
            .update({ status: 'paid' })
            .eq('user_id', entry.associated_user_id)
            .eq('associated_user_id', entry.user_id)
        }
      }

      await new Promise(r => setTimeout(r, 2000))
      setStage(STAGES[2])
      await new Promise(r => setTimeout(r, 800))

      // 3. Encode all receipt data in the URL — receipt page needs zero DB calls
      const amount = entry ? String(entry.amount) : '0'
      const description = entry?.description?.replace('[PAID]', '').trim() ?? ''

      const params = new URLSearchParams({
        id: entryId!,
        payer: payerName,
        payee: payeeName,
        amount,
        desc: description,
        ts: new Date().toISOString(),
      })

      router.push(`/successPayment?${params.toString()}`)
    }

    processPayment()
  }, [entryId, router])

  if (!entryId) return null

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

        <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight" style={{ fontFamily: 'var(--font-headline, sans-serif)' }}>
          Processing
        </h3>
        <p className="text-slate-500 text-sm font-medium animate-pulse">{stage}</p>

        <div className="mt-6 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded border border-slate-100">
          <FileCheck size={14} className="text-emerald-500" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Encrypted</span>
        </div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes loading { 0% { width: 0% } 100% { width: 100% } }
      `}} />
    </div>
  )
}
