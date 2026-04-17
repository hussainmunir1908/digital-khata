/**
 * StatsSection — Server Component
 * 4 stat counters: responsive grid
 *   mobile: 2 columns  (grid-cols-2)
 *   lg+:    4 columns  (lg:grid-cols-4)
 */

interface Stat {
  value: string
  label: string
  sublabel: string
}

const STATS: Stat[] = [
  { value: '200 Users', label: 'Early Adopters', sublabel: '' },
  { value: '4 Hours', label: 'Saved', sublabel: 'Weekly Manual Entry' },
  { value: '56 Minutes', label: 'Average', sublabel: 'Session Time' },
  { value: '4 Months', label: 'Active', sublabel: 'Since Private Beta' },
]

export default function StatsSection() {
  return (
    <section
      id="ledger"
      className="bg-white py-16 sm:py-20"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <dl className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-4">
          {STATS.map((stat) => (
            <div key={stat.value} className="flex flex-col items-center text-center">
              {/* Large blue metric value */}
              <dt className="text-2xl sm:text-3xl font-extrabold text-[#3B5BDB] tracking-tight">
                {stat.value}
              </dt>
              {/* Primary label */}
              <dd className="mt-1 text-sm font-semibold text-gray-800 uppercase tracking-wide">
                {stat.label}
              </dd>
              {/* Secondary sublabel */}
              {stat.sublabel && (
                <dd className="text-xs text-gray-400 mt-0.5">{stat.sublabel}</dd>
              )}
            </div>
          ))}
        </dl>
      </div>
    </section>
  )
}
