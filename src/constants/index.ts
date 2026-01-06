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
    size: "pomodoro-size",
    settings: "pomodoro-settings",
    state: "pomodoro-state",
    today: "pomodoro-today",
} as const

/**
 * Settings validation bounds
 */
export const SETTINGS_BOUNDS = {
    focusDuration: { min: 1, max: 60 },
    shortBreakDuration: { min: 1, max: 30 },
    longBreakDuration: { min: 1, max: 60 },
    longBreakInterval: { min: 2, max: 10 },
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
 * Validate and sanitize settings loaded from storage
 * Ensures all values are within acceptable bounds
 */
export function validateSettings(settings: Partial<PomodoroSettings>): PomodoroSettings {
    const clamp = (value: number | undefined, min: number, max: number, fallback: number): number => {
        if (typeof value !== "number" || isNaN(value)) return fallback
        return Math.max(min, Math.min(max, Math.round(value)))
    }

    return {
        focusDuration: clamp(
            settings.focusDuration,
            SETTINGS_BOUNDS.focusDuration.min,
            SETTINGS_BOUNDS.focusDuration.max,
            DEFAULT_SETTINGS.focusDuration
        ),
        shortBreakDuration: clamp(
            settings.shortBreakDuration,
            SETTINGS_BOUNDS.shortBreakDuration.min,
            SETTINGS_BOUNDS.shortBreakDuration.max,
            DEFAULT_SETTINGS.shortBreakDuration
        ),
        longBreakDuration: clamp(
            settings.longBreakDuration,
            SETTINGS_BOUNDS.longBreakDuration.min,
            SETTINGS_BOUNDS.longBreakDuration.max,
            DEFAULT_SETTINGS.longBreakDuration
        ),
        longBreakInterval: clamp(
            settings.longBreakInterval,
            SETTINGS_BOUNDS.longBreakInterval.min,
            SETTINGS_BOUNDS.longBreakInterval.max,
            DEFAULT_SETTINGS.longBreakInterval
        ),
        autoStartNext: typeof settings.autoStartNext === "boolean" ? settings.autoStartNext : DEFAULT_SETTINGS.autoStartNext,
        soundEnabled: typeof settings.soundEnabled === "boolean" ? settings.soundEnabled : DEFAULT_SETTINGS.soundEnabled,
    }
}

/**
 * Valid timer modes
 */
const VALID_MODES: TimerMode[] = ["focus", "shortBreak", "longBreak"]

/**
 * Validate timer mode from storage
 */
export function validateMode(mode: unknown): TimerMode {
    if (typeof mode === "string" && VALID_MODES.includes(mode as TimerMode)) {
        return mode as TimerMode
    }
    return "focus"
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
export const TOAST_DURATION_MINI = 2500 // Shorter for mini mode overlay

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
