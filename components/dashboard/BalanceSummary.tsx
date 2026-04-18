/**
 * BalanceSummary — Full-width hero balance card.
 * Updated to Professional SaaS styling: Clean borders, solid backgrounds.
 */
import { LedgerEntry } from '@/types/database'
import { TrendingUp, Zap, BarChart2 } from 'lucide-react'

type Props = { entries: LedgerEntry[] }

export default function BalanceSummary({ entries }: Props) {
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

  return (
    <section className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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
          <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-7 py-3 rounded-lg font-bold text-sm shadow-sm transition-colors">
            <Zap size={16} />
            Quick Settle
          </button>
          <button className="flex items-center gap-2 text-gray-700 bg-white hover:bg-gray-50 border border-gray-200 px-7 py-3 rounded-lg font-bold text-sm shadow-sm transition-colors">
            <BarChart2 size={16} />
            Detailed Report
          </button>
        </div>
      </div>
    </section>
  )
}
