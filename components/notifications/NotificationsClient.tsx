'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatDistanceToNow, parseISO } from 'date-fns'
import { CheckCheck, Bell, Trash2, CreditCard } from 'lucide-react'
import { Toaster, toast } from 'sonner'
import PaymentModal from '@/components/payment/PaymentModal'

export type Notification = {
  id: string
  created_at: string
  user_id: string
  sender_id: string
  ledger_id: string
  type: string
  message: string
  is_read: boolean
}

type Props = {
  initialNotifications: Notification[]
  userId: string
}

export default function NotificationsClient({ initialNotifications, userId }: Props) {
  const [notifications, setNotifications] = useState(initialNotifications)
  const [payingEntryId, setPayingEntryId] = useState<string | null>(null)
  const supabase = createClient()

  async function markAllAsRead() {
    const unread = notifications.filter(n => !n.is_read)
    if (unread.length === 0) return

    setNotifications(prev => prev.map(n => ({ ...n, is_read: true })))

    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false)

    if (error) {
      toast.error('Failed to mark as read')
    } else {
      toast.success('All marked as read')
    }
  }

  async function removeNotification(id: string) {
    // Optimistic UI update
    setNotifications(prev => prev.filter(n => n.id !== id))
    
    const { error } = await supabase.from('notifications').delete().eq('id', id)
    if (error) toast.error('Failed to remove notification')
  }

  return (
    <div className="space-y-4">
      <PaymentModal entryId={payingEntryId} onClose={() => setPayingEntryId(null)} />
      <Toaster position="top-center" richColors />
      
      {notifications.length > 0 && (
        <div className="flex justify-end">
          <button 
            onClick={markAllAsRead}
            disabled={notifications.every(n => n.is_read)}
            className="text-sm font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1.5 transition-colors disabled:opacity-50 disabled:pointer-events-none"
          >
            <CheckCheck size={16} />
            Mark all as read
          </button>
        </div>
      )}

      {notifications.length === 0 ? (
        <div className="p-10 bg-white rounded-2xl border border-gray-100 flex flex-col items-center text-center shadow-sm">
          <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-4">
            <Bell size={20} className="text-gray-400" />
          </div>
          <h3 className="font-bold text-gray-800">No Notifications</h3>
          <p className="text-sm text-gray-500 mt-1">You're all caught up!</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {notifications.map((n) => (
            <div 
              key={n.id} 
              className={`p-5 rounded-2xl border transition-colors flex gap-4 items-start ${
                n.is_read ? 'bg-white border-gray-100 opacity-70' : 'bg-blue-50/50 border-blue-100 shadow-sm'
              }`}
            >
              <div className="mt-1 flex-shrink-0">
                {n.is_read ? (
                  <Bell size={18} className="text-gray-400" />
                ) : (
                  <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.6)]" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm pr-2 ${
                  n.is_read ? 'text-gray-600' : 'font-semibold text-gray-900'
                }`}>
                  {n.message}
                </p>
                <div className="flex items-center gap-4 mt-2 mb-1">
                  <p className="text-xs text-gray-400">
                    {formatDistanceToNow(parseISO(n.created_at), { addSuffix: true })}
                  </p>
                  
                  {n.type === 'reminder' && n.ledger_id && (
                    <button 
                      onClick={() => setPayingEntryId(n.ledger_id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-xs font-semibold shadow-sm transition-colors"
                    >
                      <CreditCard size={12} /> Pay Now
                    </button>
                  )}
                </div>
              </div>
              
              <button 
                onClick={() => removeNotification(n.id)}
                className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors shrink-0"
                title="Remove notification"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
