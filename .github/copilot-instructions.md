# Copilot Instructions — Momento

## 🧠 Project Overview
Momento is a minimalist journaling app focused on **one-line daily entries** paired with an **authentic photo snapshot**.  
The core philosophy is **low friction, emotional clarity, and privacy-first design**.

The app intentionally avoids:
- Overloaded productivity features
- Social feeds or public sharing by default
- Complex multi-step workflows

Every feature should support a **daily ritual that takes under 30 seconds**.

---

## 🏗️ Tech Stack
- **Frontend**: Next.js (App Router), React, Tailwind CSS
- **Backend**: Supabase (Auth, PostgreSQL, Storage)
- **Auth**: Supabase Auth (OAuth / email)
- **Storage**: Supabase Storage (private by default)
- **Deployment**: Vercel (frontend)

---

## 🗃️ Database Schema (Authoritative Source)

### `entries`
Represents a single journal entry (one per day per user).

Fields:
- `id` (uuid, PK)
- `user_id` (uuid, FK → auth.users.id)
- `title` (text, max 50 chars)
- `text` (text, required — one-liner journal content)
- `image_url` (text, optional — photo snapshot)
- `is_favorite` (boolean, default false)
- `created_at` (timestamptz, default now())

Rules:
- Entries are **private** to the owning user.
- The UI should encourage **one entry per day**, but enforcement can be soft (handled at app level).
- `title` is optional in UX but required in DB (can be auto-generated if needed).

---

### `profiles`
Extends Supabase auth users.

Fields:
- `id` (uuid, PK, FK → auth.users.id)
- `first_name`
- `last_name`
- `avatar_url`
- `updated_at`

Rules:
- Profile creation should happen automatically on user signup.
- Profiles are editable but never required to use core journaling features.

---

### `tags`
User-defined emotional or contextual tags (e.g. “happy”, “stressful”, “quiet”).

Fields:
- `id` (uuid, PK)
- `name` (text, unique per user)
- `user_id` (uuid, FK → auth.users.id)

Rules:
- Tags are **user-scoped**, not global.
- Avoid system-wide predefined tags unless explicitly added later.

---

### `entry_tags`
Join table connecting entries and tags.

Fields:
- `entry_id` (uuid, FK → entries.id)
- `tag_id` (uuid, FK → tags.id)

Rules:
- Many-to-many relationship.
- Tags are optional and secondary to the core experience.

---

## 🔐 Security & Access Rules
- Always scope queries by `user_id`.
- Never expose another user’s entries, tags, or profile.
- Images should be stored in **private buckets** with signed URLs.
- Avoid public image URLs unless explicitly needed for export/share features.

---

## 🎨 UI / UX Principles
When generating UI or logic:

- **Mobile-first** design
- One primary action per screen
- No dashboards on the home screen — open directly to today’s entry
- Calm, neutral language (no productivity guilt)
- Avoid gamification that induces pressure

Preferred tone:
> gentle, reflective, human

---

## 📸 Image Handling Guidelines
- Images are optional but encouraged.
- Prefer **on-the-spot camera capture** over gallery selection.
- Do not apply filters or heavy editing.
- Compress images before upload when possible.
- Store only the image URL in the database.

---

## 🔁 Feature Boundaries
Copilot should NOT:
- Add social features (likes, comments, followers)
- Add public feeds or discovery
- Add excessive analytics or productivity metrics

Copilot MAY:
- Suggest gentle streaks
- Add yearly recap / export features
- Improve accessibility and performance
- Suggest optional premium features

---

## 💰 Monetization Awareness
The app supports freemium monetization:
- Free tier: limited history or storage
- Paid tier: unlimited entries, exports, recaps, themes

Avoid hard paywalls that block core journaling.

---

## 🧪 Development Philosophy
- Favor clarity over cleverness
- Favor emotional value over feature count
- Favor shipping over perfection

If unsure, default to **simpler behavior**.

---

## 🧭 Summary
Momento is not a productivity tool.
It is a **memory companion**.

All suggestions, code, and features should protect:
- Simplicity
- Privacy
- Emotional authenticity
