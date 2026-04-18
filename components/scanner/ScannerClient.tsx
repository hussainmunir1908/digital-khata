'use client'

/**
 * ScannerClient — Client wrapper for the Scanner page.
 * Manages tab state (Scan / Manual) and image preview.
 */
import { useState } from 'react'
import { ScanLine, PencilLine } from 'lucide-react'
import UploadZone from './UploadZone'
import ManualEntryForm from './ManualEntryForm'

type Props = { userId: string }

export default function ScannerClient({ userId }: Props) {
  const [tab, setTab] = useState<'scan' | 'manual'>('scan')

  return (
    <div className="space-y-5">
      {/* Tab switcher */}
      <div className="flex items-center gap-1 p-1 rounded-2xl w-fit bg-white border border-gray-200 shadow-sm">
        {([
          { key: 'scan',   label: 'Scan Receipt', icon: ScanLine },
          { key: 'manual', label: 'Manual Entry',  icon: PencilLine },
        ] as const).map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setTab(key)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
              tab === key
                ? 'bg-blue-600 text-white shadow-sm'
                : 'text-gray-500 hover:text-gray-800'
            }`}
          >
            <Icon size={15} />
            {label}
          </button>
        ))}
      </div>

      {/* Panel */}
      {tab === 'scan'   && <UploadZone />}
      {tab === 'manual' && <ManualEntryForm userId={userId} />}
    </div>
  )
}
