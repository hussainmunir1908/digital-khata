export type LedgerEntry = {
  id: string
  user_id: string
  amount: number
  type: 'credit' | 'debt'
  person_name: string
  description: string | null
  created_at: string
  associated_user_id?: string | null
  profiles?: { full_name: string | null } | null
  status?: string | null
  paid_at?: string | null
}

export type Profile = {
  id: string
  full_name: string | null
  phone_number: string | null
  updated_at: string
}
