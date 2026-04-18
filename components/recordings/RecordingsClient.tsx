'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Mic, Square, Loader2, CheckCircle, RefreshCw, X } from 'lucide-react'
import RecordingsList from './RecordingsList'
import InsightsPanel from './InsightsPanel'

type ParsedVoiceEntry = {
  transcription: string
  data: {
    amount: number
    entity: string
    category: string
    type: 'credit' | 'debt'
    description: string
  }
}

export default function RecordingsClient() {
  const router = useRouter()
  const [showModal, setShowModal]       = useState(false)
  const [isRecording, setIsRecording]   = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [parsedEntry, setParsedEntry]   = useState<ParsedVoiceEntry | null>(null)
  const [elapsed, setElapsed]           = useState(0)
  const [error, setError]               = useState<string | null>(null)

  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const chunksRef        = useRef<Blob[]>([])
  const timerRef         = useRef<ReturnType<typeof setInterval> | null>(null)

  function formatTime(s: number) {
    return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`
  }

  function openModal() {
    setParsedEntry(null)
    setError(null)
    setElapsed(0)
    setIsRecording(false)
    setIsProcessing(false)
    setShowModal(true)
  }

  function closeModal() {
    setShowModal(false)
    setIsRecording(false)
    setIsProcessing(false)
    setParsedEntry(null)
    setError(null)
    
    if (timerRef.current) clearInterval(timerRef.current)
    try {
      if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
        mediaRecorderRef.current.stream?.getTracks().forEach((t) => t.stop())
        mediaRecorderRef.current.stop()
      }
    } catch (e) {
      console.warn("Could not cleanly stop trailing media tracks", e)
    }
  }

  async function startRecording() {
    setError(null)
    setParsedEntry(null)
    setElapsed(0)
    chunksRef.current = []

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mr = new MediaRecorder(stream)
      mediaRecorderRef.current = mr

      mr.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      mr.onstop = async () => {
        stream.getTracks().forEach((t) => t.stop())
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' })
        await sendToBackend(blob)
      }

      mr.start(250)
      setIsRecording(true)
      timerRef.current = setInterval(() => setElapsed((s) => s + 1), 1000)
    } catch {
      setError('Microphone access denied. Please allow microphone permissions and try again.')
    }
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current)
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop()
    }
    setIsRecording(false)
  }

  async function sendToBackend(blob: Blob) {
    if (blob.size === 0) {
      setError('No audio captured. Please try recording again.')
      return
    }
    setIsProcessing(true)
    try {
      const form = new FormData()
      form.append('audio', blob, 'recording.webm')

      const res = await fetch('http://localhost:8000/voice-to-ledger', {
        method: 'POST',
        body: form,
      })

      if (!res.ok) throw new Error(`Server error ${res.status}: ${await res.text()}`)
      const result: ParsedVoiceEntry = await res.json()
      setParsedEntry(result)
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Unknown error'
      setError(
        msg.includes('Failed to fetch')
          ? 'Cannot reach backend. Run: cd backend && uvicorn main:app --reload --port 8000'
          : msg
      )
    } finally {
      setIsProcessing(false)
    }
  }

  function handleConfirm() {
    if (!parsedEntry) return
    const { amount, entity, description, type } = parsedEntry.data
    const params = new URLSearchParams({
      amount:      String(amount ?? ''),
      name:        entity ?? '',
      desc:        description ?? '',
      type:        type ?? 'debt',
    })
    router.push(`/entryPage?${params.toString()}`)
  }

  function handleRecordAgain() {
    setParsedEntry(null)
    setError(null)
    setElapsed(0)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [])

  return (
    <>
      {/* ── Existing header — unchanged ── */}
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
          <button
            onClick={openModal}
            className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
          >
            <Mic size={20} className="fill-current" />
            <span>Start New Recording</span>
          </button>
        </div>
      </header>

      {/* ── Existing layout grid — unchanged ── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        <div className="lg:col-span-8">
          <RecordingsList />
        </div>
        <div className="lg:col-span-4">
          <InsightsPanel />
        </div>
      </div>

      {/* ── Recording Modal ── */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-3xl shadow-2xl overflow-hidden">

            {/* Modal header */}
            <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-slate-100 dark:border-white/10">
              <h2
                className="font-bold text-slate-800 dark:text-slate-100 text-lg"
                style={{ fontFamily: 'var(--font-headline, sans-serif)' }}
              >
                New Voice Entry
              </h2>
              <button
                onClick={closeModal}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
              >
                <X size={18} className="text-slate-500" />
              </button>
            </div>

            <div className="px-6 py-6 space-y-5">

              {/* ── Idle: not recording, no result yet ── */}
              {!isRecording && !isProcessing && !parsedEntry && (
                <div className="flex flex-col items-center gap-5 py-4">
                  <div className="w-20 h-20 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center">
                    <Mic size={36} className="text-blue-600" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm text-center max-w-xs">
                    Tap the button and speak your transaction clearly in Urdu or English.
                  </p>
                  {error && (
                    <p className="text-sm text-red-500 text-center bg-red-50 dark:bg-red-900/20 rounded-xl px-4 py-2 w-full">
                      {error}
                    </p>
                  )}
                  <button
                    onClick={startRecording}
                    className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                  >
                    <Mic size={20} />
                    Start Recording
                  </button>
                </div>
              )}

              {/* ── Recording ── */}
              {isRecording && (
                <div className="flex flex-col items-center gap-5 py-4">
                  <div className="w-20 h-20 rounded-full bg-red-50 dark:bg-red-900/30 flex items-center justify-center relative">
                    <span className="absolute inset-0 rounded-full bg-red-400/25 animate-ping" />
                    <Mic size={36} className="text-red-500 fill-red-500 relative z-10" />
                  </div>
                  <div className="text-center">
                    <p className="text-slate-600 dark:text-slate-300 font-semibold">Recording...</p>
                    <p className="text-3xl font-mono font-bold text-slate-800 dark:text-slate-100 mt-1">
                      {formatTime(elapsed)}
                    </p>
                  </div>
                  <button
                    onClick={stopRecording}
                    className="flex items-center gap-3 bg-red-500 hover:bg-red-600 text-white px-8 py-4 rounded-xl font-semibold transition-all shadow-lg active:scale-95"
                  >
                    <Square size={18} className="fill-current" />
                    Stop Recording
                  </button>
                </div>
              )}

              {/* ── Processing ── */}
              {isProcessing && (
                <div className="flex flex-col items-center gap-4 py-10">
                  <Loader2 size={40} className="text-blue-600 animate-spin" />
                  <p className="text-slate-700 dark:text-slate-200 font-semibold">Processing with AI...</p>
                  <p className="text-slate-400 text-sm">Transcribing and parsing your entry</p>
                </div>
              )}

              {/* ── Result card ── */}
              {parsedEntry && (
                <div className="space-y-4">
                  {/* Transcription */}
                  <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl px-4 py-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1">
                      We heard
                    </p>
                    <p className="text-slate-700 dark:text-slate-200 text-sm italic">
                      &ldquo;{parsedEntry.transcription}&rdquo;
                    </p>
                  </div>

                  {/* Parsed fields */}
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-2xl px-4 py-4 space-y-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                      Parsed as
                    </p>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <p className="text-slate-400 text-xs mb-0.5">Amount</p>
                        <p className="font-bold text-slate-800 dark:text-slate-100">
                          Rs {parsedEntry.data.amount ? parsedEntry.data.amount.toLocaleString() : 'N/A'}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs mb-0.5">Person</p>
                        <p className="font-bold text-slate-800 dark:text-slate-100">
                          {parsedEntry.data.entity}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs mb-0.5">Category</p>
                        <p className="font-bold text-slate-800 dark:text-slate-100 capitalize">
                          {parsedEntry.data.category}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400 text-xs mb-0.5">Type</p>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold ${
                            parsedEntry.data.type === 'credit'
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300'
                              : 'bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300'
                          }`}
                        >
                          {parsedEntry.data.type === 'credit' ? 'You gave' : 'You owe'}
                        </span>
                      </div>
                    </div>
                    <div>
                      <p className="text-slate-400 text-xs mb-0.5">Description</p>
                      <p className="text-slate-700 dark:text-slate-300 text-sm">
                        {parsedEntry.data.description}
                      </p>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex gap-3 pt-1">
                    <button
                      onClick={handleConfirm}
                      className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl transition-all active:scale-95 shadow-md shadow-blue-200"
                    >
                      <CheckCircle size={18} />
                      Confirm &amp; Add
                    </button>
                    <button
                      onClick={handleRecordAgain}
                      className="flex-1 flex items-center justify-center gap-2 font-bold py-3.5 rounded-xl transition-all active:scale-95 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-600"
                    >
                      <RefreshCw size={18} />
                      Record Again
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}
    </>
  )
}
