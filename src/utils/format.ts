/**
 * Formatting utilities for time display
 */

/**
 * Format seconds as MM:SS with leading zeros
 * Example: 125 -> "02:05"
 */
export function formatTime(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
}

/**
 * Format seconds as M:SS (no leading zero on minutes)
 * Example: 125 -> "2:05"
 */
export function formatTimeMini(seconds: number): string {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
}
