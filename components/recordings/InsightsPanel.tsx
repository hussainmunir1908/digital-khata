'use client'

/**
 * InsightsPanel — Side panel for Recordings page with stats and suggestions.
 */
import { Zap } from 'lucide-react'

export default function InsightsPanel() {
  return (
    <div className="space-y-8">
      {/* Insight Card */}
      <div className="bg-blue-600 text-white p-8 rounded-2xl relative overflow-hidden shadow-lg shadow-blue-500/20">
        <div className="relative z-10">
          <h3
            className="text-xl font-bold mb-2"
            style={{ fontFamily: 'var(--font-headline, sans-serif)' }}
          >
            Voice Utilization
          </h3>
          <p className="text-blue-100 text-sm mb-6 leading-relaxed">
            You&apos;ve saved roughly 45 minutes of manual data entry this week using voice recordings.
          </p>
          <div className="flex items-baseline gap-2">
            <span
              className="text-4xl font-extrabold tabular-nums"
              style={{ fontFamily: 'var(--font-headline, sans-serif)' }}
            >
              82%
            </span>
            <span className="text-xs font-semibold text-blue-200 uppercase tracking-widest">
              accuracy rate
            </span>
          </div>
        </div>
        <div className="absolute -right-6 -bottom-6 opacity-10">
          <Zap size={140} className="fill-current" />
        </div>
      </div>


    </div>
  )
}
