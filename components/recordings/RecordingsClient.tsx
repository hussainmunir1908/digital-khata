'use client'

/**
 * RecordingsClient — Wrapper for the Voice Recordings layout.
 */
import { Mic } from 'lucide-react'
import RecordingsList from './RecordingsList'
import InsightsPanel from './InsightsPanel'

export default function RecordingsClient() {
  return (
    <>
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12">
        <div className="space-y-2">
          <span className="text-xs font-semibold tracking-widest uppercase text-blue-600 dark:text-blue-400">
            Voice Ledger
          </span>
          <h1
            className="text-4xl md:text-5xl font-extrabold tracking-tight text-slate-800 dark:text-slate-100"
            style={{ fontFamily: 'var(--font-headline, sans-serif)' }}
          >
            Voice Recordings
          </h1>
          <p className="text-slate-500 dark:text-slate-400 max-w-xl text-lg leading-relaxed">
            Instantly transform spoken transactions into structured ledger entries using AI transcription and categorization.
          </p>
        </div>
        <div>
          <button className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20 active:scale-95">
            <Mic size={20} className="fill-current" />
            <span>Start New Recording</span>
          </button>
        </div>
      </header>

      {/* Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <RecordingsList />
        </div>
        <div className="lg:col-span-4">
          <InsightsPanel />
        </div>
      </div>
    </>
  )
}
