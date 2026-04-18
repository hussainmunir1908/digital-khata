# 💸 Khata - Built for Micathon'26

> **Frictionless peer-to-peer debt tracking, powered by AI.**

## 🎯 Our Purpose

On campus, money is constantly moving—splitting rickshaw rides, printing lab manuals, or grabbing lunch at the tuck shop. But tracking these micro-debts is socially awkward and manually tedious. People lose track, and trust erodes. 

**Campus-Khata** isn't a banking app; it's an intelligent social ledger designed specifically for university students. We built this to eliminate the friction of data entry. No more typing numbers or scrolling through contacts. Just speak, and let the AI do the rest.

## ✨ Key Features

* **🎙️ Zero-Touch Voice Logging:** Hold a button and say, *"I paid 500 for Fatima's lunch."* Our Gemini-powered engine instantly parses the amount, the person, and the context.
* **🔒 Privacy-First Contact Sync:** Smart "History-First" fuzzy matching finds your friends without exposing or scraping a global user directory.
* **⭕ Financial Circle Dashboard:** A beautiful, real-time aggregate view of exactly who owes you, and who you owe, keeping your social capital clear.
* **🔔 Frictionless Reminders:** Settle debts and send gentle nudges with automated in-app notifications.

## 🛠️ Tech Stack & Architecture

### **Frontend Ecosystem**
* **Core Framework:** Next.js (App Router) for server-side rendering and streamlined API routes.
* **UI & Styling:** React, Tailwind CSS.
* **Component Library:** `shadcn/ui` (leveraging primitive components like Tabs, Cards, and Forms for a consistent, accessible FinTech aesthetic).
* **User Feedback:** `Sonner` for real-time, non-blocking toast notifications during transactions and mock payment flows.
* **Native Integration:** **Web Contact Picker API** (`navigator.contacts.select`) for seamless, secure access to the user's mobile address book without requiring manual phone number entry.

### **Backend & Database Infrastructure**
* **BaaS:** Supabase.
* **Database:** PostgreSQL with a highly relational schema (`ledger`, `profiles`, and `notifications` tables).
* **Security:** Strict **Row Level Security (RLS)** policies implemented at the database level. Queries are explicitly scoped with `auth.uid()` to ensure users can only `SELECT`, `INSERT`, or `UPDATE` their own financial data, preventing unauthorized global directory scraping.
* **Data Aggregation:** Custom PostgreSQL Views (e.g., the `financial_circle` view) to calculate net debt/credit balances on the fly without heavy client-side JavaScript math.

### **AI Engine & Algorithmic Logic**
* **Core AI:** Gemini 3 Flash API.
* **Voice & OCR Pipeline:** Custom prompt engineering to parse unstructured audio transcripts and receipt images into structured JSON payloads (amount, person, description, transaction type).
* **Privacy-First Association Engine:** A custom "History-First" fuzzy matching algorithm (using Postgres `ILIKE`) that checks a user's local ledger history to auto-fill contact details before falling back to a global, exact-phone-number match. This ensures rapid data entry while strictly protecting user privacy.

## 💼 Business Model

Designed for sustainability, Campus-Khata operates on a high-margin **Freemium SaaS** model. Core tracking is free (with capped AI compute), while a Rs. 250/month Pro tier unlocks unlimited AI voice logs and advanced receipt splitting.

---

### 🏆 Built for Micathon'26

Built by Hussain Munir, Fatima Liaquat, Marium Imran for Micathon'26 <3
