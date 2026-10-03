# StudySpace — Current Architecture (Source of Truth)

> Paste this entire file at the start of every Antigravity session, before giving
> any feature-specific task. This exists to prevent the agent from reverting to
> old/Astro-based assumptions or inventing its own architecture.

## What this project is

StudySpace is a full-stack SaaS-style student productivity web app. One
personal workspace where a student collects study resources, plans work with
tasks, studies using a Pomodoro workflow, takes contextual (timestamped)
notes on YouTube videos, and sees their study progress.

## Locked technology decisions — do not change these

| Layer | Decision |
|---|---|
| Framework | Next.js (App Router) |
| Language | TypeScript |
| UI | React |
| Styling | Tailwind CSS |
| Database | PostgreSQL via Supabase |
| Auth | Supabase Auth |
| File storage | Supabase Storage (bucket: `study-documents`, private) |
| External API | YouTube Data API v3 |
| Hosting | Vercel |
| Mutations | Server Actions (NOT REST API routes, except YouTube metadata fetch) |

**Do not introduce Astro, any other framework, any other database, or any
other auth system. Do not migrate or restructure the project unless
explicitly instructed.**

## Architecture rule — Server vs Client Components

Default: **Server Component**, unless the component genuinely needs browser
interactivity (state, event handlers, timers, browser APIs).

- Server Components: data fetching, auth checks, dashboard aggregation, list
  rendering (tasks, videos, notes, documents).
- Client Components: Pomodoro timer (`setInterval`), forms, video player
  controls, timestamp note editor, any drag/drop.

## Route structure

```
app/
├── (auth)/
│   ├── login/page.tsx
│   ├── signup/page.tsx
│   └── layout.tsx
├── (app)/                       ← protected route group
│   ├── layout.tsx               ← checks session, redirects if unauthenticated
│   ├── dashboard/page.tsx
│   ├── tasks/page.tsx
│   ├── pomodoro/page.tsx
│   ├── videos/page.tsx
│   ├── videos/[videoId]/page.tsx
│   ├── playlists/page.tsx
│   ├── playlists/[playlistId]/page.tsx
│   ├── resources/page.tsx
│   ├── notes/page.tsx
│   ├── documents/page.tsx
│   └── analytics/page.tsx
├── api/
│   └── youtube/
│       ├── video/route.ts
│       └── playlist/route.ts
├── layout.tsx
└── page.tsx
```

## Data access layer

All Supabase queries live in `lib/data/*.ts`, one file per feature
(`tasks.ts`, `pomodoro.ts`, `videos.ts`, `playlists.ts`, `notes.ts`,
`documents.ts`, `analytics.ts`). **Components and Server Actions must call
these functions — never call `supabase.from(...)` directly inside a
component or page.**

```
lib/
├── supabase/
│   ├── server.ts     ← server client (cookies-based)
│   ├── client.ts     ← browser client
│   └── middleware.ts ← session refresh
├── youtube/
│   └── client.ts     ← server-only YouTube API wrapper, API key never in browser
└── data/
    ├── tasks.ts
    ├── pomodoro.ts
    ├── videos.ts
    ├── playlists.ts
    ├── notes.ts
    ├── documents.ts
    └── analytics.ts
```

## Mutation pattern

```
Client Component (form/button)
      ↓ calls
Server Action ("use server")
      ↓ calls
lib/data/*.ts function
      ↓ calls
Supabase (RLS enforces ownership)
      ↓
revalidatePath()
```

## Database — already created in Supabase

13 tables exist and RLS is enabled on all of them:
`profiles`, `user_settings`, `tasks`, `pomodoro_sessions`, `youtube_videos`,
`saved_videos`, `youtube_playlists`, `saved_playlists`, `playlist_items`,
`video_timestamp_notes`, `website_resources`, `notes`, `documents`.

- A trigger auto-creates a `profiles` + `user_settings` row on signup.
- `youtube_videos` / `youtube_playlists` / `playlist_items` are **global
  catalog tables** (no `user_id`) — any authenticated user can read/insert
  them. Ownership of "my saved video" lives in `saved_videos` /
  `saved_playlists`.
- Every user-owned table enforces `user_id = auth.uid()` via RLS. **Never
  bypass RLS with the service_role key in application code.**
- Documents: file bytes go in Supabase Storage bucket `study-documents`
  (private), path convention `<user_id>/<document_uuid>/<file_name>`.
  Metadata (title, file_path, mime_type, size) goes in the `documents` table.

**Do not create new tables, alter existing tables, or change RLS policies
without being explicitly told to.**

## Definition of "done" for any feature

A feature is not done because the UI renders. It is done when:

- [ ] UI works
- [ ] Data persists in Supabase (verify by refreshing the page)
- [ ] Auth/ownership is enforced (a different user cannot see or edit it)
- [ ] Errors are handled (not silent failures)
- [ ] Refreshing the page does not destroy state
- [ ] Relevant edge cases work (empty states, invalid input)
- [ ] Mobile/responsive behavior is acceptable

## How to work with me (the developer)

- I will give you **one scoped feature spec at a time**, not the whole app.
- **First inspect the existing implementation** before changing anything —
  identify what currently prevents the described behavior.
- **Do not modify unrelated features** while implementing the current one.
- If something in a spec conflicts with this document, this document wins —
  flag the conflict instead of guessing.
