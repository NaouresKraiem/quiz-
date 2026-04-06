# Next.js Quiz Platform

An interactive quiz app built with **Next.js**, **Supabase**, **Ant Design**, and **Tailwind CSS**. Users can sign in, browse quizzes with search and pagination, and navigate to per-quiz routes. Quiz creation, editing, and taking flows are still being built out.

![Quiz Platform Banner](https://res.cloudinary.com/df4jaqtep/image/upload/v1749915377/hf1mpwuhlhejvarpszsc.png)

## Overview

This project uses the **App Router** (`app/`), **Supabase Auth** for sign-in and sign-up, and **TanStack React Query** for loading quiz data from Supabase. The UI uses **Ant Design** inside a shared client layout (`ClientLayout`) with **Tailwind CSS v4** for styling.

The home route redirects to `/quizzes`.

## Tech stack

| Layer        | Choice |
| ------------ | ------ |
| Framework    | Next.js 15 (App Router) |
| Language     | TypeScript |
| Backend / DB | Supabase (Auth + Postgres) |
| Data fetching | TanStack React Query |
| UI           | Ant Design |
| Styling      | Tailwind CSS v4 (`@import "tailwindcss"` in `app/globals.css`) |
| Forms        | React Hook Form + Yup |

## Implemented today

- **Authentication**: Login / sign-up with Supabase (`app/login`, `lib/auth.tsx`), session guard (`AuthGuard`), header with user menu or “Sign In”.
- **Quiz listing**: `/quizzes` — search, pagination, cards (`app/componenets/QuizCard.tsx`), data from `app/api/quizzes.ts`.
- **Shared layout**: Fixed header, content area, footer (`app/ClientLayout.tsx`), Ant Design `ConfigProvider` + `App` (for contextual `message` / theme via `lib/useAntdApp.ts`).

## Placeholders / roadmap

- `/quizzes/new` — stub (“new quiz” placeholder).
- `/quizzes/[id]` — stub (shows quiz id only).
- Full quiz editor, question types, drag-and-drop reordering, and quiz-taking UI are **not** in this repo yet; `lib/database.types.ts` sketches tables such as `quizzes` and `questions` for future work.

## Project structure

```
nextjs_1st/
├── app/
│   ├── ClientLayout.tsx    # Shell: QueryClient, Ant Design, header, AuthGuard
│   ├── globals.css         # Tailwind v4 entry
│   ├── layout.tsx          # Root layout + AuthProvider
│   ├── page.tsx            # Redirects to /quizzes
│   ├── login/              # Login & sign-up
│   ├── api/
│   │   └── quizzes.ts      # getQuizzes, getQuizById (Supabase)
│   └── quizzes/
│       ├── page.tsx        # List + search + pagination
│       ├── [id]/page.tsx   # Quiz detail (placeholder)
│       └── new/page.tsx    # Create quiz (placeholder)
├── lib/
│   ├── auth.tsx            # Supabase auth context & AuthGuard
│   ├── supabase.ts         # Browser Supabase client
│   ├── database.types.ts   # Generated / hand-maintained DB types
│   ├── theme.ts            # Ant Design theme tokens
│   ├── types.ts            # Shared app types
│   └── useAntdApp.ts       # App.useApp() wrapper for message/modal/notification
├── app/componenets/        # (typo: “components”) e.g. QuizCard.tsx
├── next.config.ts          # Next.js config (e.g. `images.remotePatterns`)
├── package.json
└── tsconfig.json
```

## Prerequisites

- Node.js 18+
- npm, yarn, or pnpm
- A Supabase project

## Setup

1. Install dependencies:

   ```bash
   npm install
   ```

2. Create `.env.local` in the project root:

   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. Run the dev server:

   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) (you’ll be redirected to `/quizzes` when logged in flow allows).

## Database

Table shapes used in code are reflected in `lib/database.types.ts` (e.g. `quizzes` rows). Create matching tables and Row Level Security policies in the Supabase dashboard or SQL editor to match your app’s needs. This repo does not ship a `schema.sql` file.

## Scripts

| Command        | Description        |
| -------------- | ------------------ |
| `npm run dev`  | Development server |
| `npm run build`| Production build     |
| `npm run start`| Start production server |
| `npm run lint` | ESLint               |

## Deployment

Deploy on [Vercel](https://vercel.com) (or any Node host): set the same `NEXT_PUBLIC_*` Supabase variables in the project settings.

## Learn more

- [Next.js Documentation](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [TanStack Query](https://tanstack.com/query/latest)
