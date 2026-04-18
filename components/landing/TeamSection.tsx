'use client'

import { useRef } from 'react'
import Image from 'next/image'
import { motion, useInView } from 'framer-motion'

// Hussain is center (index 1)
const TEAM = [
  { index: '01', first: 'Marium', last: 'Imran', photo: null },
  { index: '02', first: 'Hussain', last: 'Munir', photo: '/HussainPicture.webp' },
  { index: '03', first: 'Fatima', last: 'Liaquat', photo: '/FatimaPicture.jpeg' },
]

const ease = [0.16, 1, 0.3, 1] as const

export default function TeamSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const inView = useInView(sectionRef, { once: true, margin: '-15% 0px' })

  return (
    <section
      ref={sectionRef}
      className="bg-white min-h-screen flex flex-col items-center justify-center px-6 py-28 overflow-hidden"
    >
      {/* Heading */}
      <div className="overflow-hidden mb-20 lg:mb-28 text-center">
        <motion.h2
          initial={{ y: '100%' }}
          animate={inView ? { y: 0 } : {}}
          transition={{ duration: 1, ease }}
          className="text-4xl sm:text-5xl lg:text-7xl font-black text-gray-900 leading-tight tracking-tight"
        >
          Meet the people<br className="hidden sm:block" /> behind{' '}
          <span className="text-[#3B5BDB]">Khata.</span>
        </motion.h2>
      </div>

      {/* Team row — Hussain in center and slightly elevated */}
      <div className="flex flex-col sm:flex-row items-center sm:items-end justify-center gap-16 sm:gap-12 lg:gap-20 xl:gap-32 w-full max-w-5xl">
        {TEAM.map((person, i) => (
          <TeamMember key={person.index} person={person} index={i} inView={inView} />
        ))}
      </div>
    </section>
  )
}

// ─── TeamMember ───────────────────────────────────────────────────────────────

interface Person { index: string; first: string; last: string; photo: string | null }

function TeamMember({ person, index, inView }: { person: Person; index: number; inView: boolean }) {
  const isCenter = index === 1
  const delay = 0.15 + index * 0.18

  return (
    <motion.div
      initial={{ opacity: 0, y: 56 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 1, ease, delay }}
      // Center person sits higher via negative bottom margin on the row
      className={`flex flex-col items-center relative ${isCenter ? 'sm:-mb-12' : ''}`}
    >
      {/* Faded oversized index */}
      <span
        aria-hidden
        className="absolute -top-6 text-[9rem] lg:text-[11rem] font-black text-gray-100 select-none leading-none -z-10 tracking-tighter"
      >
        {person.index}
      </span>

      {/* Photo — lifts on hover */}
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={inView ? { scale: 1, opacity: 1 } : {}}
        transition={{ duration: 0.9, ease, delay: delay + 0.1 }}
        whileHover={{ y: -14, transition: { duration: 0.45, ease: [0.34, 1.56, 0.64, 1] } }}
        className={`relative rounded-full overflow-hidden cursor-pointer
          ${isCenter
            ? 'w-44 h-44 lg:w-56 lg:h-56 ring-2 ring-[#3B5BDB]/30 shadow-xl'
            : 'w-36 h-36 lg:w-44 lg:h-44 ring-1 ring-gray-200 shadow-md'
          }`}
      >
        {person.photo ? (
          <Image
            src={person.photo}
            alt={`${person.first} ${person.last}`}
            fill
            className={`object-cover ${person.first === 'Fatima' ? 'scale-[1.35] object-[center_80%]' : ''}`}
            sizes="(max-width: 1024px) 144px, 224px"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
            <svg viewBox="0 0 48 48" fill="none" className="w-14 h-14 lg:w-16 lg:h-16 text-gray-300">
              <circle cx="24" cy="18" r="9" fill="currentColor" />
              <path
                d="M6 42c0-9.941 8.059-18 18-18s18 8.059 18 18"
                stroke="currentColor"
                strokeWidth="2.5"
                strokeLinecap="round"
                fill="none"
              />
            </svg>
          </div>
        )}
      </motion.div>

      {/* Connector line */}
      <motion.div
        initial={{ scaleY: 0 }}
        animate={inView ? { scaleY: 1 } : {}}
        transition={{ duration: 0.5, ease, delay: delay + 0.3 }}
        style={{ originY: 0 }}
        className="w-px h-8 bg-gray-300 my-4"
      />

      {/* Name */}
      <div className="overflow-hidden">
        <motion.p
          initial={{ y: '100%' }}
          animate={inView ? { y: 0 } : {}}
          transition={{ duration: 0.7, ease, delay: delay + 0.35 }}
          className={`font-black text-gray-900 text-center leading-tight tracking-tight
            ${isCenter ? 'text-4xl lg:text-5xl xl:text-6xl' : 'text-3xl lg:text-4xl xl:text-5xl'}`}
        >
          {person.first}
        </motion.p>
      </div>
      <div className="overflow-hidden">
        <motion.p
          initial={{ y: '100%' }}
          animate={inView ? { y: 0 } : {}}
          transition={{ duration: 0.7, ease, delay: delay + 0.45 }}
          className={`font-black text-[#3B5BDB] text-center leading-tight tracking-tight
            ${isCenter ? 'text-4xl lg:text-5xl xl:text-6xl' : 'text-3xl lg:text-4xl xl:text-5xl'}`}
        >
          {person.last}
        </motion.p>
      </div>
    </motion.div>
  )
}
