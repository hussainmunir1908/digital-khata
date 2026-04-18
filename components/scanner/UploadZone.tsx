'use client'

import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Camera, ImagePlus, X, CheckCircle, Loader2, ScanLine, RefreshCw } from 'lucide-react'

type ReceiptData = {
  shop_name: string
  items: { item: string; price: number }[]
  total_amount: number
  category: string
  currency: string
  description: string
}

export default function UploadZone() {
  const router = useRouter()
  const [preview, setPreview]           = useState<string | null>(null)
  const [scanning, setScanning]         = useState(false)
  const [done, setDone]                 = useState(false)
  const [parsedResult, setParsedResult] = useState<ReceiptData | null>(null)
  const [error, setError]               = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  function handleFile(file: File) {
    const url = URL.createObjectURL(file)
    setPreview(url)
    setSelectedFile(file)
    setDone(false)
    setParsedResult(null)
    setError(null)
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) handleFile(file)
  }

  function clearPreview() {
    setPreview(null)
    setDone(false)
    setParsedResult(null)
    setError(null)
    setSelectedFile(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  async function handleScan() {
    if (!selectedFile) return
    setScanning(true)
    setError(null)
    setParsedResult(null)

    try {
      const form = new FormData()
      form.append('image', selectedFile)

      const res = await fetch('http://localhost:8000/ocr-to-ledger', {
        method: 'POST',
        body: form,
      })

      if (!res.ok) throw new Error(`Server error ${res.status}: ${await res.text()}`)
      const result = await res.json()
      setParsedResult(result.data)
      setDone(true)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to scan receipt. Is the backend running?')
    } finally {
      setScanning(false)
    }
  }

  function handleConfirm() {
    if (!parsedResult) return
    const params = new URLSearchParams({
      amount: String(parsedResult.total_amount ?? ''),
      name:   parsedResult.shop_name ?? '',
      desc:   parsedResult.description ?? '',
      type:   'debt',
    })
    router.push(`/entryPage?${params.toString()}`)
  }

  return (
    <div className="rounded-3xl overflow-hidden glass-border shadow-xl bg-white/65 dark:bg-slate-800/60 backdrop-blur-2xl transition-colors duration-300">

      {/* Drop zone / preview area — unchanged */}
      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="m-6 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-blue-200 rounded-2xl py-16 px-6 text-center cursor-pointer hover:border-blue-400 hover:bg-blue-50/40 transition-all"
          onClick={() => fileRef.current?.click()}
        >
          <div className="w-20 h-20 rounded-full bg-blue-100 flex items-center justify-center shadow-inner">
            <ScanLine size={36} className="text-blue-500" strokeWidth={1.5} />
          </div>
          <div>
            <p className="font-bold text-slate-700 text-base">Drop your receipt here</p>
            <p className="text-sm text-slate-400 mt-1">PNG, JPG, HEIC — up to 10 MB</p>
          </div>
          <p className="text-xs text-slate-400">or use the buttons below</p>
        </div>
      ) : (
        <div className="m-6 relative rounded-2xl overflow-hidden shadow-md">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Receipt preview" className="w-full max-h-72 object-cover" />
          <button
            onClick={clearPreview}
            className="absolute top-3 right-3 w-8 h-8 bg-white/80 backdrop-blur-sm rounded-full flex items-center justify-center shadow-sm hover:bg-white transition-colors"
          >
            <X size={16} className="text-slate-600" />
          </button>
          {done && (
            <div className="absolute inset-0 bg-emerald-500/20 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-white rounded-2xl px-6 py-4 flex items-center gap-3 shadow-lg">
                <CheckCircle size={20} className="text-emerald-600" />
                <p className="font-bold text-slate-800 text-sm">Receipt scanned! Review below.</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Hidden file input — unchanged */}
      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleChange} />

      {/* Action buttons — unchanged */}
      <div className="px-6 pb-6 flex flex-col sm:flex-row gap-3">
        <button
          onClick={() => {
            if (fileRef.current) {
              fileRef.current.setAttribute('capture', 'environment')
              fileRef.current.click()
            }
          }}
          className="flex-1 flex items-center justify-center gap-3 bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <Camera size={20} />
          Take Photo
        </button>

        <button
          onClick={() => {
            if (fileRef.current) {
              fileRef.current.removeAttribute('capture')
              fileRef.current.click()
            }
          }}
          className="flex-1 flex items-center justify-center gap-3 font-bold py-4 rounded-2xl glass-border hover:bg-white/60 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 hover:scale-[1.02] active:scale-95 transition-all bg-white/40 dark:bg-white/5"
        >
          <ImagePlus size={20} />
          Upload from Gallery
        </button>
      </div>

      {/* Scan button — shown only when image selected and not yet scanned */}
      {preview && !done && (
        <div className="px-6 pb-6">
          <button
            onClick={handleScan}
            disabled={scanning}
            className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 text-white font-bold py-3.5 rounded-2xl shadow-md transition-all"
          >
            {scanning ? <Loader2 size={18} className="animate-spin" /> : <ScanLine size={18} />}
            {scanning ? 'Scanning with AI...' : 'Scan with AI'}
          </button>
        </div>
      )}

      {/* Error state */}
      {error && (
        <div className="px-6 pb-6">
          <p className="text-sm text-red-500 bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-3 text-center">
            {error}
          </p>
        </div>
      )}

      {/* Result card */}
      {parsedResult && (
        <div className="px-6 pb-6 space-y-4">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl px-4 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                Receipt from
              </p>
              <span className="text-xs font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full capitalize">
                {parsedResult.category}
              </span>
            </div>

            <p className="font-bold text-slate-800 dark:text-slate-100 text-lg">
              {parsedResult.shop_name}
            </p>

            {/* Items list */}
            <div className="space-y-1.5">
              {parsedResult.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-slate-600 dark:text-slate-300">• {item.item}</span>
                  <span className="font-semibold text-slate-700 dark:text-slate-200">
                    Rs {item.price.toLocaleString()}
                  </span>
                </div>
              ))}
            </div>

            <div className="border-t border-blue-200 dark:border-blue-800 pt-2 flex justify-between items-center">
              <span className="font-bold text-slate-700 dark:text-slate-200">Total</span>
              <span className="font-bold text-slate-800 dark:text-slate-100 text-lg">
                Rs {parsedResult.total_amount.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-3">
            <button
              onClick={handleConfirm}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-2xl transition-all active:scale-95 shadow-md shadow-blue-200"
            >
              <CheckCircle size={18} />
              Confirm &amp; Add
            </button>
            <button
              onClick={clearPreview}
              className="flex-1 flex items-center justify-center gap-2 font-bold py-3.5 rounded-2xl transition-all active:scale-95 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
            >
              <RefreshCw size={18} />
              Scan Again
            </button>
          </div>
        </div>
      )}

    </div>
  )
}
