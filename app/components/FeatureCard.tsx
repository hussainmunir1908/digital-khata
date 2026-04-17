/**
 * FeatureCard — Server Component
 * Reusable card used in FeaturesSection.
 * Supports a "primary" variant (dark blue bg) and "secondary" (light gray bg).
 */

import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

export interface FeatureCardProps {
  /** Card title */
  title: string
  /** Card description */
  description: string
  /** Optional icon or badge element */
  icon?: ReactNode
  /** Visual variant: primary = dark blue card, secondary = light gray card */
  variant?: 'primary' | 'secondary'
  /** Additional className overrides */
  className?: string
}

export default function FeatureCard({
  title,
  description,
  icon,
  variant = 'secondary',
  className,
}: FeatureCardProps) {
  return (
    <div
      className={cn(
        'rounded-2xl p-6 sm:p-7 transition-all duration-200 hover:scale-[1.02] hover:shadow-xl',
        variant === 'primary'
          ? 'bg-[#3B5BDB] text-white shadow-lg shadow-blue-500/20'
          : 'bg-gray-50 text-gray-900',
        className
      )}
    >
      {/* Optional icon */}
      {icon && (
        <div className={cn('mb-4', variant === 'primary' ? 'text-blue-200' : 'text-[#3B5BDB]')}>
          {icon}
        </div>
      )}

      <h3
        className={cn(
          'text-lg sm:text-xl font-bold leading-snug',
          variant === 'primary' ? 'text-white' : 'text-gray-900'
        )}
      >
        {title}
      </h3>

      <p
        className={cn(
          'mt-2 text-sm leading-relaxed',
          variant === 'primary' ? 'text-blue-100' : 'text-gray-500'
        )}
      >
        {description}
      </p>
    </div>
  )
}
