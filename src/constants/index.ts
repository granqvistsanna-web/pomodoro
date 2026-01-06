import type { PomodoroSettings, TimerMode } from "../types"

/**
 * Plugin size configurations for Framer
 */
export const PLUGIN_SIZES = {
    mini: { width: 180, height: 44 },
    full: { width: 180, height: 220 },
    settings: { width: 180, height: 290 },
} as const

/**
 * localStorage keys - centralized to avoid typos and enable refactoring
 */
export const STORAGE_KEYS = {
    theme: "pomodoro-theme",
    size: "pomodoro-size",
    settings: "pomodoro-settings",
    state: "pomodoro-state",
    today: "pomodoro-today",
} as const

/**
 * Default timer settings
 */
export const DEFAULT_SETTINGS: PomodoroSettings = {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    longBreakInterval: 4,
    autoStartNext: false,
    soundEnabled: true,
}

/**
 * Timer tick interval in milliseconds
 * Using 250ms for smooth updates while being efficient
 */
export const TIMER_TICK_INTERVAL = 250

/**
 * Toast display duration in milliseconds
 */
export const TOAST_DURATION = 4000

/**
 * Get duration in seconds for a timer mode
 */
export function getDurationForMode(mode: TimerMode, settings: PomodoroSettings): number {
    switch (mode) {
        case "focus":
            return settings.focusDuration * 60
        case "shortBreak":
            return settings.shortBreakDuration * 60
        case "longBreak":
            return settings.longBreakDuration * 60
    }
}
