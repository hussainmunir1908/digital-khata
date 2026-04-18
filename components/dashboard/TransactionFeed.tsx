/**
 * TransactionFeed — Right-side scrollable activity feed.
 * Updated to Professional SaaS styling: Clean solid borders and custom scrollbar removal.
 */
import { LedgerEntry } from '@/types/database'
import { format, parseISO } from 'date-fns'
import {
  UtensilsCrossed,
  Car,
  ShoppingCart,
  DollarSign,
  Receipt,
  Download,
} from 'lucide-react'

type Props = { entries: LedgerEntry[] }

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

export default function TransactionFeed({ entries }: Props) {
  const sorted = [...entries].sort(
    (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
  )

  return (
    <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-[560px]">
      {/* Header */}
      <div className="p-6 border-b border-gray-100 shrink-0">
        <h2
          className="text-xl font-bold text-gray-800"
          style={{ fontFamily: 'var(--font-headline, sans-serif)' }}
        >
          Recent Activity
        </h2>
      </div>

      {/* Scrollable list */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
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
            const { icon: Icon, bg, iconColor } = categoryIcon(entry.description)
            const amount = Number(entry.amount).toLocaleString('en-US', {
              minimumFractionDigits: 0,
            })

            return (
              <div
                key={entry.id}
                className="flex items-center gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer"
              >
                {/* Category icon */}
                <div className={`w-10 h-10 rounded-full ${bg} flex items-center justify-center shrink-0`}>
                  <Icon size={18} className={iconColor} />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-sm text-gray-800 truncate">{entry.person_name}</p>
                  <p className="text-[10px] text-gray-400 mt-0.5">
                    {format(parseISO(entry.created_at), "MMM d, h:mm a")}
                    {entry.description ? ` · ${entry.description}` : ''}
                  </p>
                </div>

                {/* Amount */}
                <span
                  className={`font-bold tabular-nums shrink-0 ${
                    isDebt ? 'text-emerald-600' : 'text-red-500'
                  }`}
                >
                  <span className="text-xs font-bold mr-0.5">{isDebt ? '+' : '-'}Rs</span>
                  {amount}
                </span>
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
