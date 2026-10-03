# StudySpace — Android APK Distribution & Automated In-App Update Guide

This document explains the architecture, one-time Cloudflare R2 credential configuration, GitHub Actions release pipeline, and in-app update mechanism for StudySpace.

---

## 1. System Architecture

```
                            STUDYSPACE ECOSYSTEM
                                      │
              ┌───────────────────────┴───────────────────────┐
              │                                               │
     Vercel Deployment                              Cloudflare R2
   (studyspace4u.vercel.app)                     (Dedicated Release Bucket)
              │                                               │
   ├── Web Workspace App                          ├── latest.json (mutable manifest)
   ├── /api/release/latest                        └── releases/
   ├── /api/download/android (direct 307)                 ├── studyspace-1.0.0+1.apk
   └── Landing Page Download CTA                          └── studyspace-1.0.1+2.apk
              │                                               │
              └───────────────────────┬───────────────────────┘
                                      │
                                      ▼
                             Flutter Android App
                                      │
              1. On Launch / Profile -> Fetches latest.json
              2. Compares numerical build number (installed < latest)
              3. Prompts user with StudySpace update modal
              4. Streams APK download with progress bar
              5. Validates SHA-256 integrity checksum
              6. Launches Android package installer via FileProvider
              7. Installs update (Preserves SQLite & user session)
```

### Storage Separation
* **User Documents Bucket (`studyspace-documents`)**: Kept strictly **private**. Encrypted storage accessed exclusively through server-side presigned URLs.
* **Release Bucket**: Dedicated exclusively to public app distribution (`latest.json` and versioned APK files).

---

## 2. One-Time Setup: Cloudflare R2 API Credentials

To allow GitHub Actions to securely build and publish new APK releases to your dedicated release bucket without manual file uploads:

### Step 1: Open Cloudflare Dashboard
1. Log in to [dash.cloudflare.com](https://dash.cloudflare.com).
2. On the left sidebar, click **R2 Storage** -> **Overview**.

### Step 2: Create a Scoped API Token
1. In the top-right of the R2 Overview page, click **Manage API Tokens** (or **Create API Token**).
2. Give the token a descriptive name, e.g., `studyspace-apk-releaser`.
3. Under **Permissions**, select:
   * **Object Read & Write**
4. Under **Bucket Scoping**, choose:
   * **Apply to specific buckets only**
   * Select your dedicated StudySpace **release bucket** (NOT your documents bucket).
5. Click **Create API Token**.

> [!CAUTION]
> Cloudflare displays the **Secret Access Key** only **ONCE** upon creation. Copy it immediately to a secure password manager or directly into GitHub Secrets. You cannot view it again later.

### Step 3: Note Down Your Account Credentials
You will have three values from Cloudflare:
1. **Account ID**: Visible on the R2 Overview page (on the right sidebar under Account Details).
2. **Access Key ID**: The 32-character key generated with your token.
3. **Secret Access Key**: The 64-character secret generated with your token.
4. **Bucket Name**: The exact name of your dedicated release bucket.
5. **Public Development URL**: The public `r2.dev` URL enabled on your release bucket (e.g. `https://pub-xxxxxx.r2.dev`).

---

## 3. One-Time Setup: GitHub Actions Secrets

GitHub Actions automatically builds and publishes releases when a release tag is pushed. Configure the credentials once in your repository settings:

### Step 1: Open GitHub Repository Settings
1. Open your StudySpace repository on GitHub:
   `https://github.com/sachin06dev/StudySpace` (or your active repository).
2. Click **Settings** in the top navigation bar.
3. In the left sidebar, navigate to:
   **Secrets and variables** -> **Actions**.

### Step 2: Add Required Repository Secrets
Click **New repository secret** for each of the following:

| Secret Name | Value Description | Where to Find It |
|---|---|---|
| `R2_ACCOUNT_ID` | Cloudflare 32-character account ID | Cloudflare Dashboard -> R2 Overview (right sidebar) |
| `R2_ACCESS_KEY_ID` | R2 API Token Access Key ID | Generated when creating R2 API Token |
| `R2_SECRET_ACCESS_KEY` | R2 API Token Secret Access Key | Generated when creating R2 API Token |
| `R2_RELEASE_BUCKET_NAME` | Dedicated release bucket name | Cloudflare R2 bucket list |
| `R2_PUBLIC_BASE_URL` | Public development URL (e.g. `https://pub-xxxx.r2.dev`) | Bucket Settings -> Public Development URL |

*(Optional Android Keystore Signing Secrets)*:
| Secret Name | Value Description |
|---|---|
| `ANDROID_KEYSTORE_BASE64` | Base64-encoded `.jks` or `.keystore` file (`base64 -w 0 key.jks`) |
| `ANDROID_KEYSTORE_PASSWORD` | Store password for release keystore |
| `ANDROID_KEY_ALIAS` | Key alias |
| `ANDROID_KEY_PASSWORD` | Key password |

*Note: If signing secrets are omitted, the workflow cleanly builds using fallback signing without failing.*

---

## 4. Website Configuration (Vercel & Local)

Add the public release base URL to your environment variables so the website and direct download endpoints resolve to the R2 release host:

In `.env.local` and in your **Vercel Project Settings -> Environment Variables**:
```env
NEXT_PUBLIC_MOBILE_RELEASE_BASE_URL=https://YOUR-R2-PUBLIC-URL.r2.dev
```

> [!NOTE]
> This public URL is not a secret and is safe to be exposed in client bundles.

---

## 5. How to Release a New Version

Whenever you want to release a new version of the Android app, follow this automated workflow:

### Step 1: Bump Version in `mobile/pubspec.yaml`
Open `mobile/pubspec.yaml` and increment the version and build number:
```yaml
# Example: Upgrading from 1.0.1+2 to 1.0.2+3
version: 1.0.2+3
```
* The **version name** (`1.0.2`) is displayed to users.
* The **build number** (`3`) is the sequential integer used by the updater to detect newer versions.

### Step 2: Commit and Create a Release Tag
```bash
git add mobile/pubspec.yaml
git commit -m "release: bump version to 1.0.2+3"
git tag v1.0.2
git push origin main --tags
```

### Step 3: Automated Pipeline Execution
Pushing the `v*` tag triggers `.github/workflows/release-android.yml`:
1. Runs TypeScript type-checks and web build verification.
2. Runs `flutter analyze` and `flutter test`.
3. Builds the release APK (`flutter build apk --release`).
4. Generates `studyspace-1.0.2+3.apk` and calculates its SHA-256 checksum.
5. Uploads `releases/studyspace-1.0.2+3.apk` to R2 with Android MIME type and attachment headers.
6. Verifies public APK availability.
7. Generates `latest.json` pointing to `releases/studyspace-1.0.2+3.apk` with SHA-256, size, and changelog.
8. Uploads `latest.json` to R2 with non-caching headers.
9. Verifies public `latest.json`.

Alternatively, you can trigger this manually via GitHub:
* Go to **Actions** -> **Release Android APK to Cloudflare R2** -> **Run workflow**.

---

## 6. Website Download & Fallback Behavior

* **Direct Website Download**: Users visiting `https://studyspace4u.vercel.app` see the latest version badge, file size, and "What's New" release notes.
* Clicking **Download Release APK** initiates a browser download directly from Cloudflare R2 (`attachment; filename="StudySpace-vX.Y.Z.apk"`). The user stays on the StudySpace website with zero redirects to GitHub.
* **Serverless Safety**: APK binaries are never proxied through Next.js serverless functions.
* **Fallback Resilience**: If R2 is temporarily unreachable, the website continues to render smoothly with graceful fallback information.

---

## 7. In-App Update Engine

* **Startup Check**: On launch, after the initial frame renders, the app performs a lightweight, non-blocking check against `latest.json`.
* **Manual Check**: In **Profile & Settings** under **App Updates**, users can tap **Check Now** at any time.
* **Comparison**: Compares numerical build numbers:
  * `installedBuild < latestBuild` -> Update available.
  * `installedBuild == latestBuild` -> "You're using the latest version of StudySpace."
* **Mandatory Updates**: If `installedBuild < minimumSupportedBuild`, the app presents a non-dismissible dialog ("Update Required").
* **Integrity Guarantee**: The app downloads the APK in chunks, computes its SHA-256 hash, and verifies it against `latest.json`. If a mismatch is detected, the file is deleted immediately and installation is blocked.
* **Data Preservation**: Updates are installed via Android `FileProvider` over the existing package ID (`com.studyspace.app`). SQLite database tables, session tokens, and SharedPreferences are preserved completely.

---

## 8. Rollback Procedure

If a release needs to be rolled back to a previous version:

1. Look at previous versioned APKs in the bucket (e.g. `releases/studyspace-1.0.0+1.apk`).
2. Run the helper with the previous APK:
   ```bash
   node scripts/prepare-release.js --base-url "https://YOUR-R2-PUBLIC-URL.r2.dev"
   ```
3. Upload the repointed `latest.json` to R2:
   ```bash
   node scripts/upload-r2-release.js
   ```
4. Existing users and the website will immediately see the rollback version without reinstalling.

---

## 9. Future Migration to Custom Domain

When you acquire a custom domain (e.g. `downloads.studyspace4u.com`):

1. In Cloudflare Dashboard -> **R2** -> your release bucket -> **Settings** -> **Custom Domains**.
2. Connect `downloads.studyspace4u.com`.
3. Update `R2_PUBLIC_BASE_URL` in GitHub Secrets to:
   ```
   https://downloads.studyspace4u.com
   ```
4. Update `NEXT_PUBLIC_MOBILE_RELEASE_BASE_URL` in Vercel to:
   ```
   https://downloads.studyspace4u.com
   ```
5. **No code changes are required**—the website, updater service, and release scripts will automatically route through the custom domain.
