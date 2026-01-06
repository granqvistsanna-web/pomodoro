/**
 * Centralized type definitions for the Pomodoro plugin
 */

// Timer state types
export type TimerMode = "focus" | "shortBreak" | "longBreak"
export type TimerStatus = "idle" | "running" | "paused"

// UI types
export type Theme = "light" | "dark"
export type PluginSize = "mini" | "full"

// Settings
export interface PomodoroSettings {
    focusDuration: number // in minutes
    shortBreakDuration: number
    longBreakDuration: number
    longBreakInterval: number // after N focus sessions
    autoStartNext: boolean
    soundEnabled: boolean
}

// Timer state
export interface PomodoroState {
    mode: TimerMode
    status: TimerStatus
    timeRemaining: number // in seconds
    completedSessions: number
    todaySessions: number
}

// Toast state
export interface ToastState {
    visible: boolean
    mode: TimerMode
}
