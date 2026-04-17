'use client'

import { LedgerEntry } from '@/types/database'
import { format, parseISO } from 'date-fns'
import { Receipt } from 'lucide-react'

type Props = { entries: LedgerEntry[] }

export default function TransactionList({ entries }: Props) {
  return (
    <section>
      <h2 className="text-lg font-bold text-slate-800 mb-4">All Transactions</h2>

      <div
        className="rounded-3xl overflow-hidden glass-border"
        style={{ background: 'rgba(255,255,255,0.40)', backdropFilter: 'blur(20px)' }}
      >
        {entries.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center px-6">
            <Receipt className="text-slate-300 mb-3" size={40} />
            <p className="font-semibold text-slate-500">No transactions yet.</p>
            <p className="text-sm text-slate-400 mt-1">Add a ledger entry to get started.</p>
          </div>
        ) : (
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-white/30">
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                    Date
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                    Description
                  </th>
                  <th className="text-left px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                    Person
                  </th>
                  <th className="text-right px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-500">
                    Amount
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/20">
                {entries.map((entry) => {
                  const isOwedToMe = entry.type === 'debt'
                  return (
                    <tr
                      key={entry.id}
                      className="hover:bg-white/25 transition-colors"
                    >
                      {/* Date */}
                      <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                        {format(parseISO(entry.created_at), 'MMM d, yyyy')}
                        <span className="block text-xs text-slate-400 mt-0.5">
                          {format(parseISO(entry.created_at), 'h:mm a')}
                        </span>
                      </td>

                      {/* Description */}
                      <td className="px-6 py-4 text-slate-700 max-w-[200px]">
                        <span className="block truncate">
                          {entry.description || <span className="text-slate-400 italic">No description</span>}
                        </span>
                      </td>

                      {/* Person */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div
                            className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0"
                            style={{ background: 'linear-gradient(135deg, #3B5BDB, #7C3AED)' }}
                          >
                            {entry.person_name.charAt(0).toUpperCase()}
                          </div>
                          <span className="font-medium text-slate-800 truncate">{entry.person_name}</span>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4 text-right whitespace-nowrap">
                        <span className={`font-bold tabular-nums ${isOwedToMe ? 'text-blue-600' : 'text-red-600'}`}>
                          {isOwedToMe ? '+' : '−'} Rs {Number(entry.amount).toLocaleString()}
                        </span>
                        <span className="block text-xs text-slate-400 mt-0.5">
                          {isOwedToMe ? 'Owed by' : 'Owed to'} {entry.person_name}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  )
}
