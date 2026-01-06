import type { TimerMode } from "../types"

/**
 * Mode-specific styling utilities
 * Single source of truth for timer mode visual mappings
 */

/**
 * Get the CSS background class for a timer mode
 */
export function getModeBackground(mode: TimerMode): string {
    switch (mode) {
        case "focus": return "bg-mode-focus"
        case "shortBreak": return "bg-mode-break"
        case "longBreak": return "bg-mode-break-long"
    }
}

/**
 * Get the CSS color variable for a timer mode
 * Orange for focus, blue for breaks
 */
export function getModeColor(mode: TimerMode): string {
    return mode === "focus" ? "var(--color-accent)" : "var(--color-break)"
}

/**
 * Get the CSS glow color variable for a timer mode
 */
export function getModeGlow(mode: TimerMode): string {
    return mode === "focus" ? "var(--color-accent-glow)" : "var(--color-break-glow)"
}

/**
 * Get the display label for a timer mode
 */
export function getModeLabel(mode: TimerMode): string {
    switch (mode) {
        case "focus": return "Focus"
        case "shortBreak": return "Break"
        case "longBreak": return "Long Break"
    }
}
