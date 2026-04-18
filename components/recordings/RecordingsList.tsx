'use client'

/**
 * RecordingsList — Render recent voice recordings.
 */
import { AudioLines, Calendar, Clock, Loader2, PlusCircle } from 'lucide-react'

// Dummy Data mapped to match the user's provided HTML
const RECORDINGS = [
  {
    id: 1,
    title: 'Groceries with Ali',
    date: 'Oct 24, 2023',
    time: '0:42',
    status: 'transcribed',
  },
  {
    id: 2,
    title: 'Office Supplies - Stationary Shop',
    date: 'Oct 23, 2023',
    time: '1:15',
    status: 'transcribed',
  },
  {
    id: 3,
    title: 'Uber Ride - Airport to Hotel',
    date: 'Oct 22, 2023',
    time: '0:12',
    status: 'processing',
  },
  {
    id: 4,
    title: 'Dinner Party Reimbursements',
    date: 'Oct 20, 2023',
    time: '3:44',
    status: 'transcribed',
  },
]

export default function RecordingsList() {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <h2
          className="text-xl font-bold tracking-tight text-gray-800"
          style={{ fontFamily: 'var(--font-headline, sans-serif)' }}
        >
          Recent Sessions
        </h2>
        <div className="flex gap-2">
          <button className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
            Filter
          </button>
          <button className="px-4 py-2 text-sm font-medium rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition">
            Sort
          </button>
        </div>
      </div>

      <div className="divide-y divide-gray-100">
        {RECORDINGS.map((record) => {
          const isProcessing = record.status === 'processing'
          
          return (
            <div key={record.id} className="p-6 flex items-center gap-6 hover:bg-gray-50 transition-colors group">
              
              {/* Icon Bubble */}
              <div
                className={`w-12 h-12 flex items-center justify-center rounded-xl transition-transform group-hover:scale-105 shrink-0 ${
                  isProcessing 
                    ? 'bg-gray-100 text-gray-400' 
                    : 'bg-purple-50 text-purple-600'
                }`}
              >
                {isProcessing ? <Loader2 size={24} className="animate-spin" /> : <AudioLines size={24} />}
              </div>

              {/* Info Details */}
              <div className="flex-grow min-w-0">
                <h3 className="font-bold text-gray-800 truncate">{record.title}</h3>
                <div className="flex items-center gap-4 mt-1">
                  <span className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Calendar size={13} />
                    {record.date}
                  </span>
                  <span className="text-xs text-gray-500 flex items-center gap-1.5">
                    <Clock size={13} />
                    {record.time}
                  </span>
                </div>
              </div>

              {/* Status and Action Buttons */}
              <div className="flex items-center gap-4 sm:gap-6 shrink-0">
                
                {/* Status Pill */}
                <div
                  className={`hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full ${
                    isProcessing
                      ? 'bg-gray-100'
                      : 'bg-emerald-50'
                  }`}
                >
                  <div
                    className={`w-1.5 h-1.5 rounded-full ${
                      isProcessing ? 'bg-gray-400 animate-pulse' : 'bg-emerald-500'
                    }`}
                  />
                  <span
                    className={`text-[10px] font-bold tracking-wide uppercase ${
                      isProcessing ? 'text-gray-500' : 'text-emerald-700'
                    }`}
                  >
                    {isProcessing ? 'Processing' : 'Transcribed'}
                  </span>
                </div>

                {/* Add to Ledger Button */}
                <button
                  disabled={isProcessing}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-bold text-sm transition-all ${
                    isProcessing
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed opacity-50'
                      : 'bg-blue-50 text-blue-600 hover:bg-blue-600 hover:text-white'
                  }`}
                >
                  <PlusCircle size={16} />
                  <span className="hidden sm:inline">Add to Ledger</span>
                  <span className="sm:hidden">Add</span>
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
