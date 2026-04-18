/**
 * FinancialCircle — 2×2 grid of debt contact cards.
 * Updated to Professional SaaS styling: clean grids, borders, and 'Send Reminder' text link.
 */
import { LedgerEntry } from '@/types/database'
import { ArrowRight, BellRing } from 'lucide-react'

type Props = { entries: LedgerEntry[] }

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

export default function FinancialCircle({ entries }: Props) {
  // Aggregate by entity
  const map = new Map<string, { owesMe: number; iOwe: number }>()
  entries.forEach((e) => {
    const cur = map.get(e.person_name) ?? { owesMe: 0, iOwe: 0 }
    if (e.type === 'debt') cur.owesMe += Number(e.amount)
    else cur.iOwe += Number(e.amount)
    map.set(e.person_name, cur)
  })

  const people = Array.from(map.entries())
    .map(([name, { owesMe, iOwe }]) => ({ name, net: owesMe - iOwe }))
    .sort((a, b) => Math.abs(b.net) - Math.abs(a.net))
    .slice(0, 4)

  return (
    <div className="space-y-5">
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
          {people.map(({ name, net }) => {
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

                {/* Fixed "Send Reminder" link text requested in the prompt */}
                <div className="mt-auto border-t border-gray-100 pt-3">
                  <button className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors">
                    <BellRing size={12} />
                    Send Reminder
                  </button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
