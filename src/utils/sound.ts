let audioContext: AudioContext | null = null

function getAudioContext(): AudioContext {
    if (!audioContext) {
        audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
    }
    return audioContext
}

export function playCompletionSound(): void {
    try {
        const ctx = getAudioContext()
        const now = ctx.currentTime

        // Create a pleasant two-tone chime
        const frequencies = [523.25, 659.25] // C5 and E5

        frequencies.forEach((freq, index) => {
            const oscillator = ctx.createOscillator()
            const gainNode = ctx.createGain()

            oscillator.connect(gainNode)
            gainNode.connect(ctx.destination)

            oscillator.type = "sine"
            oscillator.frequency.value = freq

            // Gentle envelope
            const startTime = now + index * 0.15
            gainNode.gain.setValueAtTime(0, startTime)
            gainNode.gain.linearRampToValueAtTime(0.3, startTime + 0.05)
            gainNode.gain.exponentialRampToValueAtTime(0.01, startTime + 0.8)

            oscillator.start(startTime)
            oscillator.stop(startTime + 0.8)
        })
    } catch {
        // Audio not available, fail silently
    }
}
