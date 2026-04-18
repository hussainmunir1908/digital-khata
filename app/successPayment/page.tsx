import { CheckCircle, ArrowLeft, ReceiptText, ShieldCheck, CalendarClock, CreditCard } from 'lucide-react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { format, parseISO } from 'date-fns'
import { redirect } from 'next/navigation'

export default async function SuccessPaymentPage({ searchParams }: { searchParams: { entry_id?: string } }) {
  if (!searchParams.entry_id) {
    redirect('/dashboard')
  }

  const supabase = await createClient()
  const { data: entry } = await supabase
    .from('ledger')
    .select('*, profiles:associated_user_id(full_name)')
    .eq('id', searchParams.entry_id)
    .single()

  if (!entry) {
    redirect('/dashboard')
  }

  const name = entry.profiles?.full_name || entry.person_name
  const amount = Number(entry.amount).toLocaleString('en-US')
  const date = format(new Date(), "PPpp")
  const originalDate = format(parseISO(entry.created_at), "PPp")

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4 py-12 relative overflow-hidden">
      {/* Background radial */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(circle_at_top,_var(--tw-gradient-stops))] from-blue-100/50 via-slate-100 to-slate-100" />
      
      <div className="bg-white rounded-[2rem] shadow-2xl shadow-blue-900/5 max-w-sm w-full border border-slate-100 overflow-hidden z-10 animate-in slide-in-from-bottom-8 fade-in duration-700">
        
        {/* Header Ribbon */}
        <div className="bg-emerald-500 p-8 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-10">
            <ShieldCheck size={100} />
          </div>
          <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg ring-8 ring-emerald-400">
            <CheckCircle className="w-10 h-10 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight" style={{ fontFamily: 'var(--font-headline, sans-serif)' }}>
            Payment Sent
          </h1>
          <p className="text-emerald-100 font-medium mt-1">Status: Success</p>
        </div>

        {/* Receipt Body */}
        <div className="p-8 relative">
          {/* Jagged border effect overlay at the top */}
          <div className="absolute top-[-10px] left-0 w-full h-5 bg-[radial-gradient(circle,_#ffffff_4px,_transparent_4px)] bg-[length:16px_16px] bg-repeat-x -mt-2"></div>
          
          <div className="text-center mb-8">
            <p className="text-sm font-semibold text-slate-400 uppercase tracking-widest mb-1">Total Paid</p>
            <h2 className="text-5xl font-extrabold text-slate-800 tracking-tighter" style={{ fontFamily: 'var(--font-headline, sans-serif)' }}>
              <span className="text-3xl text-slate-300 pr-1">Rs</span>{amount}
            </h2>
          </div>

          <div className="space-y-4 text-sm">
            <div className="flex justify-between items-center py-3 border-b border-dashed border-slate-200">
              <span className="text-slate-500 flex items-center gap-2"><CreditCard size={16} /> Paid To</span>
              <span className="font-bold text-slate-800">{name}</span>
            </div>
            
            <div className="flex justify-between items-center py-3 border-b border-dashed border-slate-200">
              <span className="text-slate-500 flex items-center gap-2"><ReceiptText size={16} /> Transaction ID</span>
              <span className="font-medium text-slate-800 tabular-nums">#{entry.id.substring(0, 8).toUpperCase()}</span>
            </div>

            <div className="flex justify-between items-center py-3 border-b border-dashed border-slate-200">
              <span className="text-slate-500 flex items-center gap-2"><CalendarClock size={16} /> Time</span>
              <span className="font-medium text-slate-800 text-right">{date}</span>
            </div>
            
            <div className="flex justify-between items-start py-3 border-b border-dashed border-slate-200">
              <span className="text-slate-500 inline-block w-1/3">Notes</span>
              <span className="font-medium text-slate-800 text-right inline-block w-2/3 break-words">Settlement for: {entry.description?.replace('[PAID]', '').trim() || 'Ledger Dues'}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-100 flex gap-3">
          <Link href="/dashboard" className="flex-1 bg-white hover:bg-slate-50 border border-slate-200 text-slate-700 font-bold py-3.5 rounded-xl transition-all shadow-sm text-center">
            Dashboard
          </Link>
          <Link href="/ledger" className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all shadow-[0_4px_14px_0_rgb(37,99,235,0.39)] text-center">
            View Ledger
          </Link>
        </div>
      </div>
    </div>
  )
}
