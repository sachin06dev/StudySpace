# Contributing to StudySpace

Thank you for your interest in contributing to StudySpace! StudySpace is an all-in-one productivity and academic learning workspace built with **Next.js (App Router)**, **TypeScript**, **Tailwind CSS v4**, **Supabase**, and **Flutter (Android)**.

Whether you are fixing a bug, improving documentation, or proposing an architectural enhancement, we welcome your contributions.

---

## Code of Conduct

Please be respectful, collaborative, and constructive when opening issues or participating in pull request discussions.

---

## Development Setup

### 1. Prerequisites
- **Node.js**: v20.x or higher
- **npm**: v10.x or higher
- **Git**
- *(Optional for Mobile)*: **Flutter SDK** 3.19+ and Android Studio with SDK API 21–34

### 2. Fork and Clone
```bash
# Clone your fork
git clone https://github.com/<your-username>/StudySpace.git
cd StudySpace
```

### 3. Install Dependencies
```bash
npm install
```

### 4. Configure Local Environment
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Provide your development Supabase project URL and anonymous key. Set up the schema by executing [`supabase/schema.sql`](supabase/schema.sql) in your Supabase SQL Editor.

### 5. Start Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) to view the application.

---

## Architectural Conventions & Rules

When submitting code changes, please adhere strictly to the project's architectural guidelines:

1. **Next.js App Router Only**:
   - All routes live in `app/`. Do not use Pages Router (`pages/`) or alternative frameworks.
2. **Server-First Boundary**:
   - Default all components to React Server Components (RSC).
   - Use `'use client'` only when browser state (`useState`), effects (`useEffect`), timer intervals, or DOM events are genuinely required.
3. **Data Access Layer Boundary**:
   - All Supabase queries must live in `lib/data/*.ts`.
   - Never call `supabase.from(...)` directly inside UI components or page files.
4. **Mutations via Server Actions**:
   - Web data mutations must be executed using Next.js Server Actions (`'use server'` in `lib/actions/*.ts`) returning `{ success: boolean, error?: string, data?: T }` and calling `revalidatePath()`.
5. **Security & RLS**:
   - Never commit `.env` files or API secrets.
   - Never use or import `service_role` keys in client or regular server actions. Row Level Security (`user_id = auth.uid()`) is strictly enforced on all user-owned tables.
6. **Mobile Parity**:
   - If adjusting attendance formulas or risk states, maintain 100% mathematical parity with `lib/attendance/calculations.ts` and the mobile Flutter implementation in `mobile/lib/attendance/`.

---

## Submitting Pull Requests

1. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/issue-description
   ```

2. **Verify Code Quality**:
   Run linter and build checks before committing:
   ```bash
   npm run lint
   npm run build
   ```

3. **Commit Your Changes**:
   Write clear, descriptive commit messages adhering to standard conventional prefixes:
   - `feat:` for new features
   - `fix:` for bug fixes
   - `docs:` for documentation updates
   - `refactor:` for code improvements without functional changes

4. **Open a Pull Request**:
   - Push your branch to GitHub: `git push origin feature/your-feature-name`.
   - Open a PR against `main`.
   - Provide a clear description of the problem solved, changes made, and screenshots/recordings for visual UI updates.

---

## Reporting Issues

If you find a bug or have a suggestion:
- Check existing [GitHub Issues](https://github.com/sachin06dev/StudySpace/issues) to avoid duplicate reports.
- Open a new issue with detailed reproduction steps, browser/OS environment, and expected vs actual behavior.
- For security vulnerabilities, refer to [`SECURITY.md`](SECURITY.md).
