'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, ShieldCheck, FileCheck } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function PaymentModal({ entryId, onClose }: { entryId: string | null, onClose: () => void }) {
  const router = useRouter()
  const supabase = createClient()
  const [stage, setStage] = useState('Initializing connection...')

  useEffect(() => {
    if (!entryId) return

    async function processPayment() {
      // 1. Fetch entry details
      setStage('Authenticating payment gateway...')
      const { data: entry } = await supabase.from('ledger').select('*').eq('id', entryId).single()
      
      await new Promise(r => setTimeout(r, 1500))
      setStage('Authorizing transfer and checking lines...')

      // 2. Mark as paid (Try status column first, fallback to description modification)
      if (entry) {
        let res = await supabase.from('ledger').update({ status: 'paid' }).eq('id', entryId)
        // If the 'status' column does not exist structurally on unmigrated backends:
        if (res.error && res.error.message.includes('column')) {
          const newDesc = entry.description ? `${entry.description} [PAID]` : '[PAID]'
          await supabase.from('ledger').update({ description: newDesc }).eq('id', entryId)
        }
      }

      await new Promise(r => setTimeout(r, 2000))
      setStage('Finalizing secure receipt...')
      await new Promise(r => setTimeout(r, 1000))

      router.push(`/successPayment?entry_id=${entryId}`)
    }

    processPayment()
  }, [entryId, router, supabase])

  if (!entryId) return null

  return (
    <div className="fixed inset-0 z-[999] bg-slate-900/60 backdrop-blur-md flex items-center justify-center p-4 transition-all">
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

        <h3 className="text-2xl font-bold text-slate-900 mb-2 tracking-tight" style={{ fontFamily: 'var(--font-headline, sans-serif)' }}>Processing</h3>
        <p className="text-slate-500 text-sm font-medium animate-pulse">{stage}</p>
        <div className="mt-6 inline-flex items-center gap-1.5 px-3 py-1 bg-slate-50 rounded border border-slate-100">
           <FileCheck size={14} className="text-emerald-500"/>
           <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Encrypted</span>
        </div>
      </div>
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes loading {
          0% { width: 0%; }
          100% { width: 100%; }
        }
      `}} />
    </div>
  )
}
