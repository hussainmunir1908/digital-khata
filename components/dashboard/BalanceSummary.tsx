/**
 * BalanceSummary — Full-width hero balance card.
 * Updated to Professional SaaS styling: Clean borders, solid backgrounds.
 */
import { LedgerEntry, Profile } from '@/types/database'
import { TrendingUp, Zap, BarChart2, BellRing, CreditCard, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { createClient } from '@/lib/supabase/client'
import PaymentModal from '@/components/payment/PaymentModal'

type Props = { 
  entries: LedgerEntry[]
  profile: Profile | null
}

export default function BalanceSummary({ entries, profile }: Props) {
  const [showQuickSettle, setShowQuickSettle] = useState(false)
  const [payingEntryId, setPayingEntryId] = useState<string | null>(null)
  const supabase = createClient()
  let owesMe = 0
  let iOwe = 0
  entries.forEach((e) => {
    const amt = Number(e.amount)
    if (e.type === 'debt') owesMe += amt
    else iOwe += amt
  })
  const net = owesMe - iOwe
  const isPositive = net >= 0

  // Month-over-month placeholder: show this month's credits vs debts
  const now = new Date()
  const monthlyCredit = entries
    .filter((e) => {
      const d = new Date(e.created_at)
      return e.type === 'debt' && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
    })
    .reduce((s, e) => s + Number(e.amount), 0)

  // Quick Settle Logic
  const map = new Map<string, { owesMe: number; iOwe: number; userId: string | null; entryId: string | null }>()
  entries.forEach((e) => {
    const keyName = e.profiles?.full_name || e.person_name
    const cur = map.get(keyName) ?? { owesMe: 0, iOwe: 0, userId: null, entryId: null }
    if (e.type === 'debt') cur.owesMe += Number(e.amount)
    else cur.iOwe += Number(e.amount)

    if (e.associated_user_id) cur.userId = e.associated_user_id
    cur.entryId = e.id

    map.set(keyName, cur)
  })

  const topUnsettled = Array.from(map.entries())
    .map(([name, { owesMe, iOwe, userId, entryId }]) => ({ name, net: owesMe - iOwe, userId, entryId }))
    .filter(p => Math.abs(p.net) > 0.01)
    .sort((a, b) => Math.abs(b.net) - Math.abs(a.net))
    .slice(0, 5)

  async function handleAction(person: typeof topUnsettled[0], action: 'remind' | 'pay') {
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
      ledger_id: person.entryId,
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
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden relative">
      <PaymentModal entryId={payingEntryId} onClose={() => setPayingEntryId(null)} />
      <div className="p-8 sm:p-10">
        <p className="text-gray-500 font-bold tracking-widest uppercase text-xs mb-2">
          Total Balance
        </p>

        <div className="flex flex-wrap items-baseline gap-4 mb-8">
          <h1
            className={`text-5xl sm:text-6xl tracking-tighter tabular-nums ${
              isPositive ? 'text-gray-900' : 'text-red-600'
            }`}
            style={{ fontFamily: 'var(--font-headline, sans-serif)' }}
          >
            {isPositive ? '' : '-'}
            <span className="text-2xl sm:text-3xl font-bold pr-1 text-gray-400">Rs</span>
            <span className="font-extrabold">{Math.abs(net).toLocaleString('en-US', { minimumFractionDigits: 0 })}</span>
          </h1>

          {monthlyCredit > 0 && (
            <span className="flex items-center gap-1 bg-emerald-50 text-emerald-700 text-xs font-bold px-3 py-1.5 rounded-full border border-emerald-200">
              <TrendingUp size={12} />
              +<span className="text-[10px]">Rs</span> {monthlyCredit.toLocaleString()} this month
            </span>
          )}
        </div>

        {/* 3-col mini stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Net Balance', sign: isPositive ? '+' : '-', value: Math.abs(net).toLocaleString(), color: isPositive ? 'text-blue-600' : 'text-red-600' },
            { label: 'Owes Me', sign: '', value: owesMe.toLocaleString(), color: 'text-emerald-600' },
            { label: 'I Owe', sign: '', value: iOwe.toLocaleString(), color: 'text-red-600' },
          ].map(({ label, sign, value, color }) => (
            <div key={label} className="bg-gray-50 rounded-xl p-4 border border-gray-100">
              <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-1">{label}</p>
              <p className={`text-xl flex items-baseline gap-1 tabular-nums ${color}`}
                style={{ fontFamily: 'var(--font-headline, sans-serif)' }}>
                <span className="font-extrabold">
                  {sign}<span className="text-xs font-bold opacity-70">Rs</span> {value}
                </span>
              </p>
            </div>
          ))}
        </div>

        {/* CTA buttons */}
        <div className="flex flex-wrap gap-3">
          <button 
            onClick={() => setShowQuickSettle(true)}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-lg font-bold text-sm shadow-sm transition-colors"
          >
            <Zap size={16} />
            Quick Settle
          </button>
          <button className="flex items-center gap-2 text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 px-7 py-3 rounded-lg font-bold text-sm shadow-sm transition-colors">
            <BarChart2 size={16} />
            Detailed Report
          </button>
        </div>
      </div>

      {/* Quick Settle Modal */}
      {showQuickSettle && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md animate-in fade-in zoom-in-95 duration-200 border border-slate-100 overflow-hidden flex flex-col max-h-[80vh]">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between flex-shrink-0 bg-slate-50/50">
              <div>
                <h3 className="font-bold text-slate-800 text-lg flex items-center gap-2">
                  <Zap size={18} className="text-blue-500" />
                  Quick Settle
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">Top unresolved balances</p>
              </div>
              <button onClick={() => setShowQuickSettle(false)} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                <X size={18} />
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1 custom-scrollbar">
              {topUnsettled.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-sm font-semibold text-slate-500">You are all settled up with everyone!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topUnsettled.map(p => {
                    const isOwesMe = p.net > 0
                    return (
                      <div key={p.name} className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-100 bg-slate-50/30">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm shrink-0 ${isOwesMe ? 'bg-sky-100 text-sky-700' : 'bg-red-100 text-red-700'}`}>
                            {p.name.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-sm whitespace-nowrap">{p.name}</p>
                            <p className={`text-xs font-bold leading-tight ${isOwesMe ? 'text-emerald-600' : 'text-red-500'}`}>
                              {isOwesMe ? '+' : '-'}Rs {Math.abs(p.net).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        
                        <div className="shrink-0 flex items-center self-end sm:self-auto">
                          {isOwesMe ? (
                            <button
                              onClick={() => handleAction(p, 'remind')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 text-slate-600 hover:bg-white text-xs font-semibold shadow-sm transition-colors w-full sm:w-auto justify-center"
                            >
                              <BellRing size={14} /> Send Reminder
                            </button>
                          ) : (
                            <button
                              onClick={() => handleAction(p, 'pay')}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-sm transition-colors w-full sm:w-auto justify-center"
                            >
                              <CreditCard size={14} /> Pay Now
                            </button>
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
            
            <div className="p-4 border-t border-gray-100 shrink-0 bg-slate-50">
              <button onClick={() => setShowQuickSettle(false)} className="w-full py-2.5 rounded-xl font-bold text-sm text-slate-600 border border-slate-200 bg-white shadow-sm hover:bg-slate-50 transition-colors">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}
