/**
 * Server-Side AI Timetable Scanner Service
 *
 * Extracts structured classes from an uploaded timetable image using
 * multimodal vision models (Gemini 2.0/1.5 Flash or Groq Qwen multimodal)
 * with strict JSON schema and runtime validation.
 *
 * PRIVACY & SECURITY RULES:
 * 1. Image bytes are processed in-memory and never stored.
 * 2. Secrets (GEMINI_API_KEY, GROQ_API_KEY) are NEVER exposed to client/browser.
 */

import type { ClassType } from '@/lib/data/subjects'

export interface DetectedClassItem {
  id: string // Temporary UUID for UI keying
  dayOfWeek: number // 0 = Monday, ..., 6 = Sunday
  startTime: string // HH:mm
  endTime: string // HH:mm
  subjectName: string
  subjectCode: string | null
  faculty: string | null
  room: string | null
  classType: ClassType
  confidence: 'high' | 'medium' | 'low'
  notes?: string | null
}

export interface NormalizedTimetableEntry {
  id: string
  subject: string
  teacher: string | null
  room: string | null
  day: number // 0 = Monday, ..., 6 = Sunday
  startTime: string // HH:mm
  endTime: string // HH:mm
  type: ClassType
  confidence: 'high' | 'medium' | 'low'
  notes?: string | null
}

export interface ScanTimetableResult {
  classes: DetectedClassItem[]
  entries: NormalizedTimetableEntry[]
  warnings: string[]
  source: 'gemini' | 'groq' | 'openai'
  suggestedSemesterName: string
  rawCount: number
}

const SYSTEM_PROMPT = `
You are an expert academic timetable OCR parser for students.
Your job is to read an image of a student's class timetable / schedule and extract every individual recurring class session.

Follow these strict rules:
1. dayOfWeek MUST be an integer from 0 to 6, where:
   0 = Monday, 1 = Tuesday, 2 = Wednesday, 3 = Thursday, 4 = Friday, 5 = Saturday, 6 = Sunday.
2. startTime and endTime MUST be in 24-hour "HH:mm" format (e.g. "09:30", "14:15").
   endTime MUST be strictly after startTime. If only a single period time is shown (e.g. 9:30), assume standard 50-60 min duration.
3. classType MUST be one of: "theory", "lab", "tutorial", "other".
   If it mentions Lab, Practical, Workshop -> "lab".
   If it mentions Tutorial -> "tutorial".
   Otherwise default to "theory".
4. subjectName MUST be the actual course / subject name (e.g., "Data Structures", "Operating Systems"). Do not leave empty.
5. subjectCode: Course code if visible (e.g., "CS201", "MATH102"), otherwise null.
6. faculty: Teacher / Professor name if visible, otherwise null.
7. room: Classroom, Hall, or Lab number if visible, otherwise null.
8. NEVER hallucinate missing values. If a field cannot be seen, return null.
9. Do not miss any day or period.

Output format MUST be valid JSON matching this schema:
{
  "suggestedSemesterName": "e.g. Fall 2026 or Current Semester",
  "classes": [
    {
      "dayOfWeek": 0,
      "startTime": "09:30",
      "endTime": "10:30",
      "subjectName": "Data Structures",
      "subjectCode": "CS201",
      "faculty": "Prof. Smith",
      "room": "Room 302",
      "classType": "theory"
    }
  ]
}
`

/**
 * Normalizes day representation to ISO 8601 integer: 0 = Mon ... 6 = Sun
 */
function normalizeDay(val: unknown): number {
  if (typeof val === 'number' && val >= 0 && val <= 6) {
    return val
  }
  if (typeof val === 'string') {
    const s = val.toLowerCase().trim()
    if (s.startsWith('mon')) return 0
    if (s.startsWith('tue')) return 1
    if (s.startsWith('wed')) return 2
    if (s.startsWith('thu')) return 3
    if (s.startsWith('fri')) return 4
    if (s.startsWith('sat')) return 5
    if (s.startsWith('sun')) return 6
  }
  return 0
}

/**
 * Normalizes time string to "HH:mm" format.
 */
function normalizeTime(val: unknown, fallback: string): string {
  if (typeof val !== 'string') return fallback
  const cleaned = val.trim()
  const match = cleaned.match(/^(\d{1,2}):(\d{2})/)
  if (match) {
    const hh = match[1].padStart(2, '0')
    const mm = match[2]
    return `${hh}:${mm}`
  }
  return fallback
}

/**
 * Normalizes class type.
 */
function normalizeType(val: unknown): ClassType {
  if (typeof val !== 'string') return 'theory'
  const s = val.toLowerCase().trim()
  if (s.includes('lab') || s.includes('practical')) return 'lab'
  if (s.includes('tut')) return 'tutorial'
  if (s.includes('theory') || s.includes('lec')) return 'theory'
  return 'other'
}

/**
 * Call Gemini Multimodal Vision API
 */
async function callGeminiVision(
  apiKey: string,
  base64Data: string,
  mimeType: string
): Promise<string> {
  const configuredModel = process.env.GEMINI_TIMETABLE_MODEL?.trim()
  const modelsToTry = configuredModel
    ? [configuredModel, 'gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest']
    : ['gemini-3.8-flash', 'gemini-3.5-flash', 'gemini-3.6-flash', 'gemini-3.5-flash-lite', 'gemini-flash-latest']

  let lastError: Error | null = null

  for (const model of modelsToTry) {
    try {
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`
      const payload = {
        contents: [
          {
            role: 'user',
            parts: [
              { text: SYSTEM_PROMPT },
              {
                inlineData: {
                  mimeType: mimeType || 'image/jpeg',
                  data: base64Data,
                },
              },
            ],
          },
        ],
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.1,
        },
      }

      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })

      if (res.ok) {
        const data = await res.json()
        const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ''
        if (text) return text
      } else {
        const errBody = await res.text()
        console.warn(`Gemini model ${model} error (${res.status}):`, errBody)
        lastError = new Error(`Gemini ${model} failed (${res.status}): ${errBody}`)
      }
    } catch (err: unknown) {
      lastError = err instanceof Error ? err : new Error(String(err))
    }
  }

  throw lastError || new Error('All configured Gemini models failed.')
}

/**
 * Call Groq Multimodal Vision API (Qwen multimodal model)
 */
async function callGroqVision(
  apiKey: string,
  base64Data: string,
  mimeType: string
): Promise<string> {
  // Use configured Groq vision model or modern Qwen multimodal vision model
  const model = process.env.GROQ_TIMETABLE_MODEL?.trim() || 'qwen/qwen3.8-27b'

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        {
          role: 'user',
          content: [
            { type: 'text', text: 'Parse this timetable image into structured JSON.' },
            {
              type: 'image_url',
              image_url: { url: `data:${mimeType};base64,${base64Data}` },
            },
          ],
        },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.1,
    }),
  })

  if (!res.ok) {
    const errBody = await res.text()
    console.error('Groq vision API error:', errBody)
    throw new Error(`Groq vision request failed (${res.status}): ${res.statusText}`)
  }

  const data = await res.json()
  const text = data.choices?.[0]?.message?.content || ''
  if (!text) {
    throw new Error('Groq returned an empty response.')
  }
  return text
}

/**
 * Parses timetable image buffer using multi-provider abstraction:
 * AI_TIMETABLE_PROVIDER = 'gemini' | 'groq' | 'auto'
 */
export async function scanTimetableImage(
  imageBuffer: Buffer,
  mimeType: string
): Promise<ScanTimetableResult> {
  const providerConfig = (process.env.AI_TIMETABLE_PROVIDER || 'auto').toLowerCase().trim()
  const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_GENERATIVE_AI_API_KEY
  const groqKey = process.env.GROQ_API_KEY
  const openaiKey = process.env.OPENAI_API_KEY

  if (!geminiKey && !groqKey && !openaiKey) {
    throw new Error(
      'AI Timetable scanning requires a valid GEMINI_API_KEY or GROQ_API_KEY in the server environment. You can enter classes manually using "+ Add Class".'
    )
  }

  const base64Data = imageBuffer.toString('base64')
  let rawResponseText = ''
  let detectedSource: 'gemini' | 'groq' | 'openai' = 'gemini'

  // Dispatch according to provider configuration
  if (providerConfig === 'gemini') {
    if (!geminiKey) throw new Error('GEMINI_API_KEY is not configured on the server.')
    detectedSource = 'gemini'
    rawResponseText = await callGeminiVision(geminiKey, base64Data, mimeType)
  } else if (providerConfig === 'groq') {
    if (!groqKey) throw new Error('GROQ_API_KEY is not configured on the server.')
    detectedSource = 'groq'
    rawResponseText = await callGroqVision(groqKey, base64Data, mimeType)
  } else {
    // 'auto' mode: Prefer primary available provider with automatic fallback
    if (geminiKey) {
      try {
        detectedSource = 'gemini'
        rawResponseText = await callGeminiVision(geminiKey, base64Data, mimeType)
      } catch (geminiErr) {
        console.warn('Primary Gemini scanner failed in auto mode, trying fallback:', geminiErr)
        if (groqKey) {
          detectedSource = 'groq'
          rawResponseText = await callGroqVision(groqKey, base64Data, mimeType)
        } else if (openaiKey) {
          detectedSource = 'openai'
          // OpenAI fallback
          const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
              Authorization: `Bearer ${openaiKey}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              model: 'gpt-4o-mini',
              messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                {
                  role: 'user',
                  content: [
                    { type: 'text', text: 'Parse this timetable image into structured JSON.' },
                    {
                      type: 'image_url',
                      image_url: { url: `data:${mimeType};base64,${base64Data}` },
                    },
                  ],
                },
              ],
              response_format: { type: 'json_object' },
              temperature: 0.1,
            }),
          })
          if (res.ok) {
            const d = await res.json()
            rawResponseText = d.choices?.[0]?.message?.content || ''
          }
        }
        if (!rawResponseText) throw geminiErr
      }
    } else if (groqKey) {
      detectedSource = 'groq'
      rawResponseText = await callGroqVision(groqKey, base64Data, mimeType)
    }
  }

  if (!rawResponseText) {
    throw new Error("Couldn't extract timetable details from image. Please enter manually.")
  }

  // Strict JSON parse and structure validation
  let parsed: { suggestedSemesterName?: string; classes?: unknown[] }
  try {
    parsed = JSON.parse(rawResponseText)
  } catch (err) {
    console.error('Failed to parse AI output as JSON:', rawResponseText, err)
    throw new Error('AI returned an unparseable response format. Please try again or enter manually.')
  }

  const rawClasses = Array.isArray(parsed.classes) ? parsed.classes : []
  const validatedClasses: DetectedClassItem[] = []

  let counter = 1
  for (const rawItem of rawClasses) {
    if (!rawItem || typeof rawItem !== 'object') continue
    const item = rawItem as Record<string, unknown>

    const subjectName = typeof item.subjectName === 'string' ? item.subjectName.trim() : ''
    if (!subjectName) continue

    const day = normalizeDay(item.dayOfWeek)
    const start = normalizeTime(item.startTime, '09:00')
    let end = normalizeTime(item.endTime, '10:00')

    // If end time is not after start time, adjust to 1 hour after start
    if (end <= start) {
      const [h, m] = start.split(':').map((n) => parseInt(n, 10))
      const nextH = Math.min(h + 1, 23).toString().padStart(2, '0')
      end = `${nextH}:${m.toString().padStart(2, '0')}`
    }

    const classType = normalizeType(item.classType)

    validatedClasses.push({
      id: `detected_${Date.now()}_${counter++}`,
      dayOfWeek: day,
      startTime: start,
      endTime: end,
      subjectName,
      subjectCode: typeof item.subjectCode === 'string' ? item.subjectCode.trim() || null : null,
      faculty: typeof item.faculty === 'string' ? item.faculty.trim() || null : null,
      room: typeof item.room === 'string' ? item.room.trim() || null : null,
      classType,
      confidence: 'high',
    })
  }

  if (validatedClasses.length === 0) {
    throw new Error(
      "No classes could be confidently detected from this image. You can add classes manually using '+ Add Class'."
    )
  }

  const entries: NormalizedTimetableEntry[] = validatedClasses.map((c) => ({
    id: c.id,
    subject: c.subjectName,
    teacher: c.faculty,
    room: c.room,
    day: c.dayOfWeek,
    startTime: c.startTime,
    endTime: c.endTime,
    type: c.classType,
    confidence: c.confidence,
    notes: c.notes,
  }))

  return {
    classes: validatedClasses,
    entries,
    warnings: [],
    source: detectedSource,
    suggestedSemesterName: parsed.suggestedSemesterName?.trim() || 'Imported Semester',
    rawCount: validatedClasses.length,
  }
}
