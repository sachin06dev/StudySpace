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

async function testGeminiModels() {
  console.log('\n--- Testing Gemini Models with Real 192x192 Image ---')
  const key = process.env.GEMINI_API_KEY
  const imagePath = path.join(process.cwd(), 'public', 'branding', 'icon-192.png')
  const base64Data = fs.readFileSync(imagePath).toString('base64')
  const models = ['gemini-3.6-flash', 'gemini-3.8-flash', 'gemini-2.5-flash-lite', 'gemini-flash-latest']

  for (const model of models) {
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${key}`
    const payload = {
      contents: [{
        role: 'user',
        parts: [
          { text: 'Respond with JSON: {"status": "ok", "description": "short image description"}' },
          { inlineData: { mimeType: 'image/png', data: base64Data } }
        ]
      }],
      generationConfig: { responseMimeType: 'application/json' }
    }
    try {
      const res = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })
      console.log(`Gemini ${model}: status = ${res.status}`)
      if (!res.ok) {
        console.log(`  Error: ${await res.text()}`)
      } else {
        const d = await res.json()
        console.log(`  Success text: ${d.candidates?.[0]?.content?.parts?.[0]?.text}`)
      }
    } catch (e) {
      console.log(`Gemini ${model} exception:`, e)
    }
  }
}

async function testGroqModels() {
  console.log('\n--- Testing Groq with Real 192x192 Image ---')
  const key = process.env.GROQ_API_KEY
  const imagePath = path.join(process.cwd(), 'public', 'branding', 'icon-192.png')
  const base64Data = fs.readFileSync(imagePath).toString('base64')
  const models = ['qwen/qwen3.8-27b', 'groq/compound-mini']

  for (const model of models) {
    try {
      const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${key}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'user',
              content: [
                { type: 'text', text: 'Respond with JSON: {"status": "ok", "description": "short image description"}' },
                { type: 'image_url', image_url: { url: `data:image/png;base64,${base64Data}` } },
              ],
            },
          ],
          response_format: { type: 'json_object' },
        }),
      })
      console.log(`Groq ${model}: status = ${res.status}`)
      if (!res.ok) {
        console.log(`  Error: ${await res.text()}`)
      } else {
        const d = await res.json()
        console.log(`  Success text: ${d.choices?.[0]?.message?.content}`)
      }
    } catch (e) {
      console.log(`Groq ${model} exception:`, e)
    }
  }
}

async function run() {
  await testGeminiModels()
  await testGroqModels()
}

run()
