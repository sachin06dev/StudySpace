# Security Policy

## Overview

StudySpace is an educational, open-source productivity platform built with **Next.js (App Router)**, **Supabase (PostgreSQL & Auth)**, **Tailwind CSS**, and **Flutter (Android)**.

We take the security and privacy of student data seriously. This document outlines our security principles, guidelines for handling credentials, and how to responsibly disclose vulnerabilities.

---

## Supported Versions

Only the latest version on the `main` branch of this repository receives active security and stability updates.

| Version | Supported |
| :--- | :--- |
| `main` (Latest) | ✅ Yes |
| Historical Releases | ❌ No |

---

## Security Principles & Design Guidelines

### 1. Row Level Security (RLS) Enforcement
- Every user-owned table in PostgreSQL (`tasks`, `attendance_records`, `timetable_slots`, `timetable_exceptions`, `pomodoro_sessions`, `documents`, etc.) enforces strict Row Level Security policies (`user_id = auth.uid()`).
- Direct client-side database access without authenticated session tokens is denied by default.
- The PostgreSQL database engine strictly enforces identity ownership; API clients cannot query or modify rows belonging to other users.

### 2. Zero-Secret Commitment
- **Never commit secrets to version control**: This repository strictly ignores `.env*` files (except `.env.example`).
- Secret keys such as `YOUTUBE_API_KEY`, `GEMINI_API_KEY`, `OPENAI_API_KEY`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, and `SUPABASE_SERVICE_ROLE_KEY` must **never** be prefixed with `NEXT_PUBLIC_` and must never be exposed to the client browser.
- All upstream API communication occurs strictly on the server boundary within Next.js Server Components, Server Actions, or private API route handlers.

### 3. Presigned URLs & Storage Privacy
- Document uploads to Supabase Storage and Cloudflare R2 leverage short-lived, presigned URLs (10-minute maximum validity).
- Storage buckets are private; no files or student materials are accessible via public directory browsing.

### 4. Ephemeral Multimodal Processing
- Timetable images processed by the AI Timetable OCR scanner (`/api/timetable/scan`) are held strictly in transient server memory during image transcription and are discarded immediately upon completion. No student timetable photos or camera captures are persisted to disk or cloud storage.

---

## Reporting a Vulnerability

If you discover a potential security vulnerability or sensitive information exposure in StudySpace:

1. **Do not create a public GitHub issue.**
2. Send an email to **`sachin06.dev@gmail.com`** with:
   - A detailed description of the vulnerability.
   - Exact steps or proof-of-concept to reproduce the behavior.
   - Affected URLs, routes, or code files.
3. We will acknowledge receipt of your report within 48 hours and work on a patch as promptly as possible.
4. Once the issue is remediated and deployed, we will acknowledge your contribution responsibly.

Thank you for helping keep StudySpace safe for all students and developers!
