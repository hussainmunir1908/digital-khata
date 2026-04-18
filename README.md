# Khata — Digital Ledger & Debt Tracker

> A modern, real-time financial ledger app built for the hackathon. Track who owes who, send reminders, and settle debts — all in one place.

---

## What is Khata?

**Khata** (خاتہ) is a Urdu/Hindi word for a financial ledger or account book. This app digitizes that concept — letting you log debts and credits between people, link registered users for two-way sync, send payment reminders, and simulate settlements with a digital receipt.

### Key Features

- **Financial Circle** — See your top contacts ranked by outstanding balance at a glance
- **Live Ledger** — Real-time updates via Supabase Realtime; entries appear and disappear instantly across all connected devices
- **Two-way Entry Sync** — When you log an entry against a registered user, their ledger is automatically updated with the mirror entry
- **Pay Now** — Simulate a payment flow that marks both sides of a debt as settled and generates a digital receipt
- **Send Reminder** — Push a notification to the other user to prompt them to pay
- **Voice Entry** — Record voice notes and have them transcribed into ledger entries via AI
- **Receipt Scanner** — Upload an image of a receipt to auto-populate an entry
- **Digital Receipt** — Every payment generates a shareable receipt with transaction details

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js 16.2](https://nextjs.org) (App Router, React Server Components, Turbopack) |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS v4, shadcn/ui, Framer Motion |
| Icons | Lucide React |
| Backend / DB | [Supabase](https://supabase.com) (PostgreSQL + Row Level Security) |
| Auth | Supabase Auth (email/password) |
| Realtime | Supabase Realtime (`postgres_changes` subscriptions) |
| AI | Google Generative AI (`@google/generative-ai`) |
| Notifications | Sonner (toast) |
| Date handling | date-fns |
| Deployment | Vercel |

---

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com) project with the `ledger`, `profiles`, and `notifications` tables set up

### Environment Variables

Create a `.env.local` file at the root:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Run Locally

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Project Structure

```
app/                  # Next.js App Router pages
  dashboard/          # Main dashboard
  ledger/             # Full ledger table with pagination
  entryPage/          # Manual ledger entry form
  recordings/         # Voice entry page
  scanner/            # Receipt image scanner
  successPayment/     # Digital receipt page
components/
  dashboard/          # Balance summary, Financial Circle, activity feed
  khata-ledger/       # Ledger table with mobile cards + desktop table
  data-entry/         # Entry form
  payment/            # PaymentModal + BulkSettleModal
  recordings/         # Voice recorder UI
lib/
  supabase/           # Server + client Supabase helpers
types/
  database.ts         # Shared TypeScript types
```

---

## Database Schema (Key Tables)

**`ledger`**
| Column | Type | Notes |
|---|---|---|
| id | uuid | Primary key |
| user_id | uuid | Owner of the entry |
| person_name | text | Name of the other party |
| associated_user_id | uuid | Linked registered user (nullable) |
| type | text | `debt` (owed to you) or `credit` (you owe) |
| amount | numeric | Amount in PKR |
| description | text | Optional note |
| status | text | `pending` or `paid` |

**`notifications`** — used for in-app payment reminders between users

**`profiles`** — extended user info (full name, phone number, avatar)

---

## Team

Built with ❤️ for the hackathon by **Hussain** and team.
