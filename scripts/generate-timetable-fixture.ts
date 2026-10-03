import sharp from 'sharp'
import * as fs from 'fs'
import * as path from 'path'

const svgContent = `
<svg width="1200" height="700" xmlns="http://www.w3.org/2000/svg" style="background:#ffffff; font-family:Arial, sans-serif;">
  <rect width="100%" height="100%" fill="#f8fafc"/>
  
  <text x="600" y="50" font-size="28" font-weight="bold" text-anchor="middle" fill="#0f172a">DEPARTMENT OF COMPUTER SCIENCE &amp; ENGINEERING</text>
  <text x="600" y="85" font-size="20" font-weight="600" text-anchor="middle" fill="#475569">Class Timetable - Fall 2026 (Semester 5)</text>

  <!-- Table Header -->
  <rect x="50" y="120" width="1100" height="50" fill="#2563eb" rx="4"/>
  <text x="120" y="152" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">Day</text>
  <text x="280" y="152" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">Time</text>
  <text x="500" y="152" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">Subject</text>
  <text x="740" y="152" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">Code &amp; Type</text>
  <text x="910" y="152" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">Room</text>
  <text x="1050" y="152" font-size="16" font-weight="bold" fill="#ffffff" text-anchor="middle">Faculty</text>

  <!-- Row 1: Monday DS -->
  <rect x="50" y="180" width="1100" height="60" fill="#ffffff" stroke="#e2e8f0"/>
  <text x="120" y="217" font-size="16" font-weight="bold" fill="#1e293b" text-anchor="middle">Monday</text>
  <text x="280" y="217" font-size="15" fill="#334155" text-anchor="middle">09:00 - 10:00</text>
  <text x="500" y="217" font-size="15" font-weight="bold" fill="#0f172a" text-anchor="middle">Data Structures</text>
  <text x="740" y="217" font-size="15" fill="#475569" text-anchor="middle">CS201 (Theory)</text>
  <text x="910" y="217" font-size="15" fill="#0369a1" text-anchor="middle">Room 301</text>
  <text x="1050" y="217" font-size="15" fill="#334155" text-anchor="middle">Prof. Sharma</text>

  <!-- Row 2: Monday OS -->
  <rect x="50" y="245" width="1100" height="60" fill="#f1f5f9" stroke="#e2e8f0"/>
  <text x="120" y="282" font-size="16" font-weight="bold" fill="#1e293b" text-anchor="middle">Monday</text>
  <text x="280" y="282" font-size="15" fill="#334155" text-anchor="middle">10:00 - 11:00</text>
  <text x="500" y="282" font-size="15" font-weight="bold" fill="#0f172a" text-anchor="middle">Operating Systems</text>
  <text x="740" y="282" font-size="15" fill="#475569" text-anchor="middle">CS202 (Theory)</text>
  <text x="910" y="282" font-size="15" fill="#0369a1" text-anchor="middle">Room 302</text>
  <text x="1050" y="282" font-size="15" fill="#334155" text-anchor="middle">Dr. Rao</text>

  <!-- Row 3: Tuesday DBMS -->
  <rect x="50" y="310" width="1100" height="60" fill="#ffffff" stroke="#e2e8f0"/>
  <text x="120" y="347" font-size="16" font-weight="bold" fill="#1e293b" text-anchor="middle">Tuesday</text>
  <text x="280" y="347" font-size="15" fill="#334155" text-anchor="middle">11:15 - 12:15</text>
  <text x="500" y="347" font-size="15" font-weight="bold" fill="#0f172a" text-anchor="middle">Database Systems</text>
  <text x="740" y="347" font-size="15" fill="#475569" text-anchor="middle">CS203 (Theory)</text>
  <text x="910" y="347" font-size="15" fill="#0369a1" text-anchor="middle">LH-1</text>
  <text x="1050" y="347" font-size="15" fill="#334155" text-anchor="middle">Prof. Anita</text>

  <!-- Row 4: Wednesday Networks -->
  <rect x="50" y="375" width="1100" height="60" fill="#f1f5f9" stroke="#e2e8f0"/>
  <text x="120" y="412" font-size="16" font-weight="bold" fill="#1e293b" text-anchor="middle">Wednesday</text>
  <text x="280" y="412" font-size="15" fill="#334155" text-anchor="middle">09:00 - 10:00</text>
  <text x="500" y="412" font-size="15" font-weight="bold" fill="#0f172a" text-anchor="middle">Computer Networks</text>
  <text x="740" y="412" font-size="15" fill="#475569" text-anchor="middle">CS204 (Theory)</text>
  <text x="910" y="412" font-size="15" fill="#0369a1" text-anchor="middle">Room 105</text>
  <text x="1050" y="412" font-size="15" fill="#334155" text-anchor="middle">Dr. Verma</text>

  <!-- Row 5: Thursday Lab -->
  <rect x="50" y="440" width="1100" height="60" fill="#ffffff" stroke="#e2e8f0"/>
  <text x="120" y="477" font-size="16" font-weight="bold" fill="#1e293b" text-anchor="middle">Thursday</text>
  <text x="280" y="477" font-size="15" fill="#334155" text-anchor="middle">14:00 - 16:00</text>
  <text x="500" y="477" font-size="15" font-weight="bold" fill="#0f172a" text-anchor="middle">Algorithms Lab</text>
  <text x="740" y="477" font-size="15" fill="#475569" text-anchor="middle">CS205 (Lab)</text>
  <text x="910" y="477" font-size="15" fill="#0369a1" text-anchor="middle">Lab 4</text>
  <text x="1050" y="477" font-size="15" fill="#334155" text-anchor="middle">Prof. Sharma</text>

  <!-- Row 6: Friday SE -->
  <rect x="50" y="505" width="1100" height="60" fill="#f1f5f9" stroke="#e2e8f0"/>
  <text x="120" y="542" font-size="16" font-weight="bold" fill="#1e293b" text-anchor="middle">Friday</text>
  <text x="280" y="542" font-size="15" fill="#334155" text-anchor="middle">10:00 - 11:00</text>
  <text x="500" y="542" font-size="15" font-weight="bold" fill="#0f172a" text-anchor="middle">Software Engineering</text>
  <text x="740" y="542" font-size="15" fill="#475569" text-anchor="middle">CS206 (Theory)</text>
  <text x="910" y="542" font-size="15" fill="#0369a1" text-anchor="middle">Room 204</text>
  <text x="1050" y="542" font-size="15" fill="#334155" text-anchor="middle">Dr. Patel</text>
</svg>
`

async function generate() {
  const outDir = path.join(process.cwd(), 'test-fixtures')
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true })
  }
  const outPath = path.join(outDir, 'real_timetable.png')
  await sharp(Buffer.from(svgContent)).png().toFile(outPath)
  console.log(`Generated realistic timetable smoke image at: ${outPath}`)
}

generate().catch(console.error)
