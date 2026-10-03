import QRCode from 'qrcode'
import jsQR from 'jsqr'

async function runQRTest() {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://studyspace4u.vercel.app'
  const expectedDownloadUrl = `${siteUrl.replace(/\/$/, '')}/api/download/android`

  console.log(`[QR Test] Target Download URL: ${expectedDownloadUrl}`)

  // 1. Generate QR code with High Error Correction (H)
  const qr = QRCode.create(expectedDownloadUrl, {
    errorCorrectionLevel: 'H',
  })

  const size = qr.modules.size
  // Quiet zone margin
  const margin = 4
  const fullSize = size + margin * 2
  const pixelData = new Uint8ClampedArray(fullSize * fullSize * 4)

  // Initialize with white background
  pixelData.fill(255)

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const bit = qr.modules.get(x, y)
      const px = x + margin
      const py = y + margin
      const idx = (py * fullSize + px) * 4
      const color = bit ? 0 : 255
      pixelData[idx] = color
      pixelData[idx + 1] = color
      pixelData[idx + 2] = color
      pixelData[idx + 3] = 255
    }
  }

  // 2. Decode using jsQR
  const decoded = jsQR(pixelData, fullSize, fullSize)

  if (!decoded) {
    console.error('❌ [QR Test Failed]: jsQR failed to detect any QR code in the generated matrix.')
    process.exit(1)
  }

  console.log(`[QR Test] Decoded Content:   ${decoded.data}`)

  // 3. Assert equality
  if (decoded.data !== expectedDownloadUrl) {
    console.error(
      `❌ [QR Test Failed]: Decoded value (${decoded.data}) does not match expected (${expectedDownloadUrl})`
    )
    process.exit(1)
  }

  console.log('✅ [QR Test Passed]: Successfully encoded and decoded QR code. Payload verified.')
}

runQRTest().catch((err) => {
  console.error('Unexpected error in QR test:', err)
  process.exit(1)
})
