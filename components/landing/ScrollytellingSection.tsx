'use client'

import { useEffect, useRef } from 'react'
import { useScroll, useTransform, useAnimationFrame, motion, MotionValue } from 'framer-motion'

const TOTAL_FRAMES = 720
const SCROLL_HEIGHT = '1900vh'
const FRAME_PATH = (i: number) =>
  `/frames_webp/out_${String(i).padStart(4, '0')}.webp`

function frameOpacity(frame: number, fadeIn: [number, number], fadeOut: [number, number]): number {
  if (frame < fadeIn[0]) return 0
  if (frame < fadeIn[1]) return (frame - fadeIn[0]) / (fadeIn[1] - fadeIn[0])
  if (frame < fadeOut[0]) return 1
  if (frame < fadeOut[1]) return 1 - (frame - fadeOut[0]) / (fadeOut[1] - fadeOut[0])
  return 0
}

function drawCover(ctx: CanvasRenderingContext2D, img: HTMLImageElement, cw: number, ch: number) {
  const ir = img.naturalWidth / img.naturalHeight
  const cr = cw / ch
  let dw: number, dh: number
  if (ir > cr) {
    dh = ch
    dw = dh * ir
  } else {
    dw = cw
    dh = dw / ir
  }
  ctx.drawImage(img, (cw - dw) / 2, (ch - dh) / 2, dw, dh)
}

export default function ScrollytellingSection() {
  const containerRef = useRef<HTMLDivElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const imagesRef = useRef<HTMLImageElement[]>([])
  const currentFrameRef = useRef(-1)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    function resize() {
      if (!canvas) return
      canvas.width = window.innerWidth
      canvas.height = window.innerHeight
      const img = imagesRef.current[currentFrameRef.current]
      if (img?.complete) {
        const ctx = canvas.getContext('2d')
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height)
          drawCover(ctx, img, canvas.width, canvas.height)
        }
      }
    }

    resize()
    window.addEventListener('resize', resize)
    return () => window.removeEventListener('resize', resize)
  }, [])

  useEffect(() => {
    const images: HTMLImageElement[] = []

    for (let i = 1; i <= TOTAL_FRAMES; i++) {
      const img = new Image()
      img.src = FRAME_PATH(i)
      img.onload = () => {
        if (i === 1) {
          currentFrameRef.current = 0
          const canvas = canvasRef.current
          if (!canvas) return
          const ctx = canvas.getContext('2d')
          if (ctx) drawCover(ctx, img, canvas.width, canvas.height)
        }
      }
      images.push(img)
    }

    imagesRef.current = images
  }, [])

  const { scrollYProgress } = useScroll({ target: containerRef })
  const frameIndex: MotionValue<number> = useTransform(scrollYProgress, [0, 1], [0, TOTAL_FRAMES - 1])

  // Intro text: fully visible at frame 0, fades out by frame 15
  // Intro: hold until frame 20, fade out by frame 60
  const introOpacity = useTransform(frameIndex, [0, 20, 60], [1, 1, 0])
  const introY = useTransform(frameIndex, [0, 60], [0, -24])

  useAnimationFrame(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const frame = Math.round(frameIndex.get())
    if (frame === currentFrameRef.current) return
    currentFrameRef.current = frame

    const img = imagesRef.current[frame]
    if (!img?.complete) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    drawCover(ctx, img, canvas.width, canvas.height)
  })

  return (
    <div ref={containerRef} className="hidden lg:block relative" style={{ height: SCROLL_HEIGHT }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden bg-white">
        <canvas ref={canvasRef} className="absolute inset-0 block" />
        {/* Fade to white at the very end of the scroll sequence */}
        <motion.div
          style={{ opacity: useTransform(frameIndex, [680, 720], [0, 1]) }}
          className="absolute inset-0 bg-white pointer-events-none"
        />

        <div className="absolute inset-0 pointer-events-none">

          {/* Intro text — centered, fades on first scroll */}
          <motion.div
            style={{ opacity: introOpacity, y: introY }}
            className="absolute inset-0 flex flex-col items-center justify-center"
          >
            <p className="text-lg font-semibold tracking-[0.25em] uppercase text-gray-500 mb-4">
              Introducing
            </p>
            <h1 className="text-8xl xl:text-9xl font-black text-gray-900 tracking-tight leading-none">
              Khata
            </h1>
          </motion.div>

          {/* Phase 1 — LEFT */}
          {/* Section 1: frames 1–240 — fade out starts at 93% mark (~223), done by 238 */}
          <PhaseText frameIndex={frameIndex} fadeIn={[30, 70]} fadeOut={[223, 238]} position="left">
            <h2 className="text-6xl xl:text-7xl font-black text-gray-900 leading-[1.05] tracking-tight">
              Zero Data Entry.<br />
              <span className="text-blue-600">Pure Intelligence.</span>
            </h2>
            <p className="mt-6 text-xl xl:text-2xl text-gray-700 max-w-md leading-relaxed font-medium">
              Our AI engine analyzes voice notes and photos of receipts to categorize
              your campus finances instantly.
            </p>
          </PhaseText>

          {/* Phase 2 — RIGHT */}
          {/* Section 2: frames 241–480 — fade out starts at 93% mark (~464), done by 479 */}
          <PhaseText frameIndex={frameIndex} fadeIn={[250, 290]} fadeOut={[464, 479]} position="right">
            <div className="mb-10">
              <p className="text-blue-600 text-lg font-semibold uppercase tracking-widest mb-3">Voice-First Entry</p>
              <h3 className="text-5xl xl:text-6xl font-black text-gray-900 leading-tight">
                Stop typing.<br />Start talking.
              </h3>
              <p className="mt-4 text-xl text-gray-700 max-w-sm leading-relaxed font-medium">
                Record a quick voice note, and our AI instantly extracts the amount,
                entity, and category into your ledger.
              </p>
            </div>
            <div>
              <p className="text-yellow-600 text-lg font-semibold uppercase tracking-widest mb-3">Smart Receipt OCR</p>
              <h3 className="text-5xl xl:text-6xl font-black text-gray-900 leading-tight">
                Snap it.<br />We structure it.
              </h3>
              <p className="mt-4 text-xl text-gray-700 max-w-sm leading-relaxed font-medium">
                Snap any paper receipt or hand-written bill. Never lose track
                of a single&nbsp;<em>Parchi</em> again.
              </p>
            </div>
          </PhaseText>

          {/* Phase 3 — LEFT */}
          {/* Section 3: frames 481–720 — fade out starts at 93% mark (~704), done by 720 */}
          <PhaseText frameIndex={frameIndex} fadeIn={[490, 530]} fadeOut={[704, 720]} position="left">
            <h2 className="text-6xl xl:text-7xl font-black text-gray-900 leading-[1.05] tracking-tight">
              Bank-Level<br />
              <span className="text-yellow-600">Security.</span>
            </h2>
            <p className="mt-6 text-xl xl:text-2xl text-gray-700 max-w-md leading-relaxed font-medium">
              Built with end-to-end encrypted routing. Your financial data is securely
              processed and isolated, ensuring complete privacy for your ledger.
            </p>
          </PhaseText>

        </div>
      </div>
    </div>
  )
}

// ─── PhaseText ────────────────────────────────────────────────────────────────

interface PhaseTextProps {
  frameIndex: MotionValue<number>
  fadeIn: [number, number]
  fadeOut: [number, number]
  position: 'left' | 'right'
  children: React.ReactNode
}

function PhaseText({ frameIndex, fadeIn, fadeOut, position, children }: PhaseTextProps) {
  const opacity = useTransform(frameIndex, (raw) =>
    frameOpacity(Math.round(raw), fadeIn, fadeOut)
  )

  const y = useTransform(frameIndex, (raw) => {
    const op = frameOpacity(Math.round(raw), fadeIn, fadeOut)
    return (1 - op) * 32
  })

  const posClass =
    position === 'left'
      ? 'left-12 xl:left-20 items-start text-left'
      : 'right-12 xl:right-20 items-end text-right'

  return (
    <motion.div
      style={{ opacity, y }}
      className={`absolute top-1/2 -translate-y-1/2 flex flex-col max-w-xl ${posClass}`}
    >
      {children}
    </motion.div>
  )
}
