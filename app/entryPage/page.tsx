/**
 * app/entryPage/page.tsx — AI Data Entry Confirmation Page
 * Server Component: verifies auth, passes user_id to EntryForm.
 * Route: /entryPage
 *
 * EntryForm uses useSearchParams() so it must be wrapped in Suspense.
 */
import { Suspense } from 'react'
import { redirect } from 'next/navigation'
import { Toaster } from 'sonner'
import { Loader2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import DashboardNav from '@/components/dashboard/DashboardNav'
import EntryForm from '@/components/data-entry/EntryForm'

export const metadata = {
  title: 'Confirm Entry — Khata',
  description: 'Review and confirm your AI-parsed transaction before saving it to your ledger.',
}

export default async function EntryPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name')
    .eq('id', user.id)
    .single()

  const displayName = profile?.full_name || user.email || 'User'

  return (
    <>
      <Toaster position="top-right" richColors />
      <DashboardNav displayName={displayName} />

      {/* Suspense required because EntryForm reads useSearchParams() */}
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center">
            <Loader2 size={32} className="animate-spin text-blue-500" />
          </div>
        }
      >
        <EntryForm userId={user.id} />
      </Suspense>
    </>
  )
}
