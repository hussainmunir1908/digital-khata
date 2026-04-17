/**
 * PhoneMockup — Server Component
 * Renders a stylized phone frame containing a mini finance UI.
 * Purely presentational — no client interactivity needed.
 */

import { Plus } from 'lucide-react'

/** A single transaction row in the phone UI */
interface Transaction {
  avatar: string
  name: string
  description: string
  amount: string
  isDebit: boolean
}

const TRANSACTIONS: Transaction[] = [
  { avatar: '🛒', name: 'Whole Foods', description: 'Groceries · Today', amount: 'Rs.145.00', isDebit: true },
  { avatar: '👤', name: 'Osama Merth', description: 'Salary · Yesterday', amount: 'Rs.56.50', isDebit: false },
  { avatar: '🍽️', name: '"Lunch with Saah…"', description: '3 nearby matches', amount: 'Rs.32.00', isDebit: true },
]

export default function PhoneMockup() {
  return (
    <div className="relative mx-auto w-[260px] sm:w-[300px] lg:w-[320px]">
      {/* Phone outer frame */}
      <div className="relative rounded-[40px] border-[6px] border-gray-900 bg-gray-900 shadow-2xl shadow-gray-900/40">
        {/* Notch */}
        <div className="absolute top-3 left-1/2 -translate-x-1/2 w-20 h-5 bg-gray-900 rounded-full z-10" />

        {/* Screen */}
        <div className="rounded-[34px] bg-white overflow-hidden">
          {/* Status bar space */}
          <div className="h-8 bg-white" />

          {/* App content */}
          <div className="px-5 pb-8 pt-2">
            {/* Balance card */}
            <div className="flex items-start justify-between mb-5">
              <div>
                <p className="text-[9px] font-semibold tracking-widest text-gray-400 uppercase mb-0.5">
                  Total Balance
                </p>
                <p className="text-2xl font-bold text-gray-900 tracking-tight">
                  Rs12,450.80
                </p>
              </div>
              <button className="flex items-center justify-center w-8 h-8 rounded-full bg-[#3B5BDB] text-white shadow-sm">
                <Plus size={16} />
              </button>
            </div>

            {/* Recent Transactions label */}
            <p className="text-[9px] font-semibold tracking-widest text-gray-400 uppercase mb-3">
              Recent Transactions
            </p>

            {/* Transaction list */}
            <div className="flex flex-col gap-3">
              {TRANSACTIONS.map((tx, i) => (
                <div key={i} className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="flex items-center justify-center w-7 h-7 rounded-full bg-gray-100 text-sm">
                      {tx.avatar}
                    </span>
                    <div>
                      <p className="text-[10px] font-semibold text-gray-800 leading-tight">{tx.name}</p>
                      <p className="text-[8px] text-gray-400 leading-tight">{tx.description}</p>
                    </div>
                  </div>
                  <p className={`text-[10px] font-semibold ${tx.isDebit ? 'text-red-500' : 'text-green-500'}`}>
                    {tx.isDebit ? '-' : '+'}{tx.amount}
                  </p>
                </div>
              ))}
            </div>

            {/* Spacer to make phone look full */}
            <div className="h-20" />
          </div>
        </div>
      </div>

      {/* Subtle glow under phone */}
      <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 w-3/4 h-8 bg-blue-400/20 blur-xl rounded-full" />
    </div>
  )
}
