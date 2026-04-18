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
  return (
    <div className="space-y-5">
      {/* Panel */}
      <UploadZone />
    </div>
  )
}
