import { ref } from 'vue'

/**
 * Synthesised chat sound effects via the Web Audio API — no audio files, fully
 * self-contained. These evoke the feel of each channel; they are not the real
 * (copyrighted) branded sounds.
 *
 * The AudioContext is created lazily on the first sound, which always happens
 * inside a user gesture (a keystroke), so browser autoplay policies are met.
 */
export function useChatSounds() {
  const muted = ref(false)

  let ctx: AudioContext | null = null
  function audio(): AudioContext | null {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext
    if (!Ctor) return null
    if (!ctx) ctx = new Ctor()
    if (ctx.state === 'suspended') void ctx.resume()
    return ctx
  }

  type ToneOptions = { type?: OscillatorType; gain?: number; when?: number }
  function tone(freq: number, durationMs: number, opts: ToneOptions = {}) {
    const c = audio()
    if (!c) return
    const { type = 'sine', gain = 0.05, when = 0 } = opts
    const t = c.currentTime + when
    const dur = durationMs / 1000
    const osc = c.createOscillator()
    const g = c.createGain()
    osc.type = type
    osc.frequency.value = freq
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(gain, t + 0.008)
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
    osc.connect(g).connect(c.destination)
    osc.start(t)
    osc.stop(t + dur)
  }

  /** Rising two-note "pop" played once when a message is sent (all channels). */
  function messageSent() {
    if (muted.value) return
    tone(660, 90, { type: 'sine', gain: 0.05 })
    tone(880, 130, { type: 'sine', gain: 0.05, when: 0.09 })
  }

  return { muted, messageSent }
}
