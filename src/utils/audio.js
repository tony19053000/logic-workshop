/**
 * audio.js — generates a short wooden thud using Web Audio API.
 */

let ctx = null;

function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

export function playDiskThud(diskNum = 1, totalDisks = 1) {
  try {
    const ac = getCtx();

    // Smaller disks = higher pitch
    const minFreq = 80;
    const maxFreq = 300;
    const freq = maxFreq - ((diskNum - 1) / Math.max(totalDisks - 1, 1)) * (maxFreq - minFreq);

    const now = ac.currentTime;

    const osc = ac.createOscillator();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freq, now);
    osc.frequency.exponentialRampToValueAtTime(freq * 0.3, now + 0.12);

    // Sharp attack, fast decay
    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.0, now);
    gain.gain.linearRampToValueAtTime(0.55, now + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);

    // Short noise burst for the wooden click
    const bufferSize = ac.sampleRate * 0.05;
    const noiseBuffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;

    const noiseSource = ac.createBufferSource();
    noiseSource.buffer = noiseBuffer;

    const noiseGain = ac.createGain();
    noiseGain.gain.setValueAtTime(0.18, now);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

    // Low-pass filter to keep the sound warm
    const filter = ac.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = 800;

    osc.connect(gain);
    noiseSource.connect(filter);
    filter.connect(noiseGain);
    gain.connect(ac.destination);
    noiseGain.connect(ac.destination);

    osc.start(now);
    osc.stop(now + 0.2);
    noiseSource.start(now);
    noiseSource.stop(now + 0.06);
  } catch (_) {
    // Silently ignore if Web Audio is unavailable
  }
}
