#!/usr/bin/env node
/**
 * StudySpace Automated Release Preparation Helper
 *
 * Reads pubspec.yaml version, locates the built release APK, copies/renames it
 * to `studyspace-X.Y.Z+BUILD.apk`, calculates its SHA-256 checksum, generates
 * `latest.json`, and outputs GitHub Actions workflow variables.
 */

const fs = require('fs')
const path = require('path')
const crypto = require('crypto')
const child_process = require('child_process')

const EXPECTED_SIGNATURE_SHA256 = '641b2ce37a1ee9fe1d8e758818f161b4d5ee5ea96ecb3ad877af9567953c6f40'

function parseArgs() {
  const args = process.argv.slice(2)
  const options = {
    pubspecPath: path.resolve(__dirname, '../mobile/pubspec.yaml'),
    apkDir: path.resolve(__dirname, '../mobile/build/app/outputs/flutter-apk'),
    outDir: path.resolve(__dirname, '../release-artifacts'),
    baseUrl: process.env.R2_PUBLIC_BASE_URL || process.env.NEXT_PUBLIC_MOBILE_RELEASE_BASE_URL || '',
    minBuild: 1,
    notes: [],
    dryRun: false,
  }

  for (let i = 0; i < args.length; i++) {
    const arg = args[i]
    if (arg === '--dry-run') {
      options.dryRun = true
    } else if (arg === '--base-url' && args[i + 1]) {
      options.baseUrl = args[++i]
    } else if (arg === '--apk-dir' && args[i + 1]) {
      options.apkDir = path.resolve(args[++i])
    } else if (arg === '--out-dir' && args[i + 1]) {
      options.outDir = path.resolve(args[++i])
    } else if (arg === '--min-build' && args[i + 1]) {
      options.minBuild = parseInt(args[++i], 10) || 1
    } else if (arg === '--notes' && args[i + 1]) {
      try {
        const val = args[++i]
        if (val.startsWith('[') && val.endsWith(']')) {
          options.notes = JSON.parse(val)
        } else {
          options.notes = val.split('\n').map((s) => s.trim()).filter(Boolean)
        }
      } catch (_) {
        options.notes = [args[i]]
      }
    }
  }

  return options
}

function extractVersionFromPubspec(pubspecPath) {
  if (!fs.existsSync(pubspecPath)) {
    throw new Error(`pubspec.yaml not found at: ${pubspecPath}`)
  }
  const content = fs.readFileSync(pubspecPath, 'utf8')
  const match = content.match(/^version:\s*([0-9]+\.[0-9]+\.[0-9]+)\+([0-9]+)/m)
  if (!match) {
    throw new Error(`Failed to parse 'version: X.Y.Z+BUILD' in ${pubspecPath}`)
  }
  return {
    versionName: match[1],
    buildNumber: parseInt(match[2], 10),
    fullVersion: `${match[1]}+${match[2]}`,
  }
}

function findBuiltApk(apkDir, outDir, targetFilename) {
  // Check standard Flutter APK output names
  const candidates = [
    path.join(apkDir, 'app-release.apk'),
    path.join(apkDir, 'app.apk'),
  ]

  for (const c of candidates) {
    if (fs.existsSync(c)) {
      return c
    }
  }

  // If the exact target versioned APK already exists in outDir, reuse it directly
  if (targetFilename) {
    const existingTarget = path.join(outDir, targetFilename)
    if (fs.existsSync(existingTarget)) {
      return existingTarget
    }
  }

  throw new Error(`No release APK found in ${apkDir}. Run 'flutter build apk --release' first.`)
}

function calculateSha256(filePath) {
  const hash = crypto.createHash('sha256')
  const buffer = fs.readFileSync(filePath)
  hash.update(buffer)
  return hash.digest('hex').toLowerCase()
}

function findApkSigner() {
  const sdkRoots = [
    process.env.ANDROID_HOME,
    process.env.ANDROID_SDK_ROOT,
    process.env.LOCALAPPDATA ? path.join(process.env.LOCALAPPDATA, 'Android', 'Sdk') : null,
  ].filter(Boolean)

  for (const root of sdkRoots) {
    const buildTools = path.join(root, 'build-tools')
    if (fs.existsSync(buildTools)) {
      const versions = fs.readdirSync(buildTools).sort().reverse()
      for (const ver of versions) {
        const bin = process.platform === 'win32' ? 'apksigner.bat' : 'apksigner'
        const p = path.join(buildTools, ver, bin)
        if (fs.existsSync(p)) return p
      }
    }
  }

  // Try checking global PATH
  try {
    const whichCmd = process.platform === 'win32' ? 'where apksigner' : 'which apksigner'
    const resolved = child_process.execSync(whichCmd, { stdio: ['ignore', 'pipe', 'ignore'], encoding: 'utf8' }).trim().split('\n')[0].trim()
    if (resolved && fs.existsSync(resolved)) return resolved
  } catch (_) {}

  return null
}

function verifyApkSignature(apkPath) {
  const apksigner = findApkSigner()
  if (!apksigner) {
    console.warn('[WARN] apksigner tool could not be located. Skipping signature certificate verification.')
    return
  }

  console.log(`Verifying APK signing certificate using: ${apksigner}`)
  try {
    const out = child_process.execFileSync(apksigner, ['verify', '--print-certs', apkPath], {
      shell: process.platform === 'win32',
      encoding: 'utf8',
    })
    const match = out.match(/certificate SHA-256 digest:\s*([0-9a-fA-F:]+)/)
    if (!match) {
      throw new Error('Unable to extract certificate SHA-256 digest from apksigner output.')
    }
    const actualFingerprint = match[1].replace(/[: ]/g, '').toLowerCase()
    console.log(`APK Certificate SHA-256 Digest: ${actualFingerprint}`)

    if (actualFingerprint !== EXPECTED_SIGNATURE_SHA256) {
      throw new Error(
        `CRITICAL SIGNATURE MISMATCH!\n` +
        `The built APK is signed with cert fingerprint:\n  ${actualFingerprint}\n` +
        `Expected permanent StudySpace release key:\n  ${EXPECTED_SIGNATURE_SHA256}\n` +
        `Existing users will NOT be able to update their app without uninstalling!`
      )
    }
    console.log('[VERIFIED] APK is correctly signed with permanent StudySpace release key.')
  } catch (err) {
    if (err.message && err.message.includes('CRITICAL SIGNATURE MISMATCH')) {
      throw err
    }
    throw new Error(`APK Signature Verification Failed: ${err.message}`)
  }
}


function main() {
  const options = parseArgs()
  console.log('=== StudySpace Release Preparation ===')
  console.log('Pubspec:', options.pubspecPath)

  const { versionName, buildNumber, fullVersion } = extractVersionFromPubspec(options.pubspecPath)
  console.log(`Resolved App Version: ${versionName} (Build ${buildNumber})`)

  if (!fs.existsSync(options.outDir)) {
    fs.mkdirSync(options.outDir, { recursive: true })
  }

  const targetFilename = `studyspace-${fullVersion}.apk`
  const targetApkPath = path.join(options.outDir, targetFilename)

  const sourceApk = findBuiltApk(options.apkDir, options.outDir, targetFilename)
  console.log('Found source APK:', sourceApk)

  // Copy/rename APK to standard versioned name
  if (path.resolve(sourceApk) !== path.resolve(targetApkPath)) {
    fs.copyFileSync(sourceApk, targetApkPath)
    console.log(`Copied to versioned target: ${targetApkPath}`)
  } else {
    console.log(`Target already exists at: ${targetApkPath}`)
  }

  const stat = fs.statSync(targetApkPath)
  const apkSize = stat.size
  const sha256 = calculateSha256(targetApkPath)
  console.log(`File Size: ${(apkSize / (1024 * 1024)).toFixed(2)} MB (${apkSize} bytes)`)
  console.log(`SHA-256: ${sha256}`)

  // Verify signing certificate matches the permanent StudySpace release key
  verifyApkSignature(targetApkPath)

  // Base URL resolution
  let baseUrl = (options.baseUrl || '').trim().replace(/\/+$/, '')
  if (!baseUrl) {
    baseUrl = 'https://YOUR-R2-PUBLIC-URL.r2.dev'
    console.warn(`[WARN] No base URL provided. Using placeholder: ${baseUrl}`)
  }

  const apkUrl = `${baseUrl}/releases/${targetFilename}`

  // Release notes resolution
  let releaseNotes = options.notes
  if (!releaseNotes || releaseNotes.length === 0) {
    const notesFile = path.resolve(__dirname, '../mobile/release_notes.txt')
    if (fs.existsSync(notesFile)) {
      releaseNotes = fs
        .readFileSync(notesFile, 'utf8')
        .split('\n')
        .map((s) => s.trim().replace(/^[-*•]\s*/, ''))
        .filter(Boolean)
    }
  }
  if (!releaseNotes || releaseNotes.length === 0) {
    releaseNotes = [
      `StudySpace v${versionName} update`,
      'Attendance and schedule synchronization improvements',
      'Performance and stability enhancements',
    ]
  }

  const releaseDate = new Date().toISOString().slice(0, 10)

  const manifest = {
    latestVersion: versionName,
    latestBuild: buildNumber,
    minimumSupportedBuild: options.minBuild,
    apkUrl: apkUrl,
    apkSize: apkSize,
    sha256: sha256,
    releaseDate: releaseDate,
    releaseNotes: releaseNotes,
  }

  const manifestPath = path.join(options.outDir, 'latest.json')
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf8')
  console.log(`Generated manifest: ${manifestPath}`)
  console.log(JSON.stringify(manifest, null, 2))

  // Output variables for GitHub Actions
  if (process.env.GITHUB_OUTPUT) {
    const outputs = [
      `version=${versionName}`,
      `build_number=${buildNumber}`,
      `full_version=${fullVersion}`,
      `apk_filename=${targetFilename}`,
      `apk_path=${targetApkPath}`,
      `manifest_path=${manifestPath}`,
      `sha256=${sha256}`,
      `apk_size=${apkSize}`,
      `apk_url=${apkUrl}`,
    ]
    fs.appendFileSync(process.env.GITHUB_OUTPUT, outputs.join('\n') + '\n', 'utf8')
    console.log('Written variables to GITHUB_OUTPUT')
  }

  console.log('=== Release Preparation Completed Successfully ===')
}

try {
  main()
} catch (err) {
  console.error('[ERROR] Release preparation failed:', err.message)
  process.exit(1)
}
