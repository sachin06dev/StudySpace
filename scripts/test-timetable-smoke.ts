import * as fs from 'fs'
import * as path from 'path'

// Load .env.local
const envPath = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  const content = fs.readFileSync(envPath, 'utf8')
  content.split('\n').forEach((line) => {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) return
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx > 0) {
      const key = trimmed.slice(0, eqIdx).trim()
      let val = trimmed.slice(eqIdx + 1).trim()
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1)
      }
      if (!process.env[key]) {
        process.env[key] = val
      }
    }
  })
}

import { scanTimetableImage } from '../lib/ai/timetableScanner'

async function smokeTest() {
  console.log('=== AI Timetable Scanner Smoke Test with Real Image ===\n')
  const imagePath = path.join(process.cwd(), 'test-fixtures', 'real_timetable.png')
  const buffer = fs.readFileSync(imagePath)

  // 1. Test Gemini
  console.log('1. Testing Gemini Provider (gemini-3.8-flash)...')
  process.env.AI_TIMETABLE_PROVIDER = 'gemini'
  try {
    const res = await scanTimetableImage(buffer, 'image/png')
    console.log(`✅ Gemini Success! Extracted ${res.classes.length} classes, source: ${res.source}`)
    console.log('Suggested Semester:', res.suggestedSemesterName)
    console.table(res.classes.map(c => ({
      dayOfWeek: c.dayOfWeek,
      subject: c.subjectName,
      code: c.subjectCode,
      time: `${c.startTime} - ${c.endTime}`,
      room: c.room,
      faculty: c.faculty,
      type: c.classType,
    })))
  } catch (e) {
    console.error('❌ Gemini scan failed:', e)
  }

  // 2. Test Groq
  console.log('\n2. Testing Groq Provider (qwen/qwen3.8-27b)...')
  process.env.AI_TIMETABLE_PROVIDER = 'groq'
  try {
    const res = await scanTimetableImage(buffer, 'image/png')
    console.log(`✅ Groq Success! Extracted ${res.classes.length} classes, source: ${res.source}`)
    console.log('Suggested Semester:', res.suggestedSemesterName)
    console.table(res.classes.map(c => ({
      dayOfWeek: c.dayOfWeek,
      subject: c.subjectName,
      code: c.subjectCode,
      time: `${c.startTime} - ${c.endTime}`,
      room: c.room,
      faculty: c.faculty,
      type: c.classType,
    })))
  } catch (e) {
    console.error('❌ Groq scan failed:', e)
  }

  // 3. Test AUTO mode with fallback
  console.log('\n3. Testing AUTO mode with fallback...')
  process.env.AI_TIMETABLE_PROVIDER = 'auto'
  try {
    const res = await scanTimetableImage(buffer, 'image/png')
    console.log(`✅ AUTO Mode Success! Extracted ${res.classes.length} classes, source: ${res.source}`)
  } catch (e) {
    console.error('❌ AUTO mode scan failed:', e)
  }
}

smokeTest().catch(console.error)
