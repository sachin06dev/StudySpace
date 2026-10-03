const fs = require('fs');
const path = require('path');

const sampleRate = 44100;
const durationSeconds = 1.8;
const numSamples = Math.floor(sampleRate * durationSeconds);
const dataSize = numSamples * 2;
const buffer = Buffer.alloc(44 + dataSize);

// RIFF header
buffer.write('RIFF', 0);
buffer.writeUInt32LE(36 + dataSize, 4);
buffer.write('WAVE', 8);

// fmt subchunk
buffer.write('fmt ', 12);
buffer.writeUInt32LE(16, 16); // subchunk1 size (16 for PCM)
buffer.writeUInt16LE(1, 20); // audio format (1 = PCM)
buffer.writeUInt16LE(1, 22); // mono
buffer.writeUInt32LE(sampleRate, 24); // sample rate
buffer.writeUInt32LE(sampleRate * 2, 28); // byte rate (SampleRate * NumChannels * BitsPerSample/8)
buffer.writeUInt16LE(2, 32); // block align
buffer.writeUInt16LE(16, 34); // bits per sample

// data subchunk
buffer.write('data', 36);
buffer.writeUInt32LE(dataSize, 40);

// Generate smooth double-chime (D5 587.3Hz then A5 880Hz with overtones)
for (let i = 0; i < numSamples; i++) {
  const t = i / sampleRate;
  
  // First tone: 0 to 0.9s (peaks at 0.05s, decays)
  // Second tone: starts at 0.15s
  let sample = 0;
  
  // Tone 1: 587.33 Hz (D5)
  if (t < 1.2) {
    const env1 = Math.exp(-4.5 * t);
    sample += 0.45 * Math.sin(2 * Math.PI * 587.33 * t) * env1;
    sample += 0.20 * Math.sin(2 * Math.PI * 1174.66 * t) * env1 * 0.7; // harmonic
    sample += 0.10 * Math.sin(2 * Math.PI * 1762.00 * t) * env1 * 0.4; // overtone
  }
  
  // Tone 2: 880.00 Hz (A5)
  if (t >= 0.18) {
    const t2 = t - 0.18;
    const env2 = Math.exp(-3.5 * t2);
    sample += 0.55 * Math.sin(2 * Math.PI * 880.00 * t2) * env2;
    sample += 0.25 * Math.sin(2 * Math.PI * 1760.00 * t2) * env2 * 0.7; // harmonic
    sample += 0.12 * Math.sin(2 * Math.PI * 2640.00 * t2) * env2 * 0.4; // overtone
  }
  
  // Soft attack limiter to prevent clicking
  if (t < 0.01) {
    sample *= (t / 0.01);
  }
  
  // Clamp to [-1.0, 1.0]
  sample = Math.max(-1.0, Math.min(1.0, sample));
  
  const intVal = Math.floor(sample * 32767);
  buffer.writeInt16LE(intVal, 44 + i * 2);
}

const targetDir = path.join(__dirname, '..', 'mobile', 'assets', 'sounds');
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const targetPath = path.join(targetDir, 'pomodoro_chime.mp3');
// Writing PCM WAV data into file; AudioPlayer on Android decodes WAV container directly even with .mp3 extension or .wav
fs.writeFileSync(targetPath, buffer);
console.log('Successfully generated chime at:', targetPath, 'Size:', buffer.length);
