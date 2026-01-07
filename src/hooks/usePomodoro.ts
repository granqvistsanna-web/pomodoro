import { useState, useEffect, useCallback, useRef } from "react"
import { usePomodoroSettings } from "./useLocalStorage"
import { playCompletionSound, initAudio } from "../utils/sound"
import type { TimerMode, PomodoroSettings, PomodoroState } from "../types"
import {
    STORAGE_KEYS,
    TIMER_TICK_INTERVAL,
    getDurationForMode,
    validateMode,
    validateSettings
} from "../constants"

/**
 * Get today's date string for session tracking
 */
function getTodayKey(): string {
    return new Date().toDateString()
}

/**
 * Load today's session count from storage, resetting if date changed
 */
function loadTodaySessions(): number {
    try {
        const stored = localStorage.getItem(STORAGE_KEYS.today)
        if (stored) {
            const { date, sessions } = JSON.parse(stored)
            if (date === getTodayKey() && typeof sessions === "number" && sessions >= 0) {
                return sessions
            }
        }
    } catch {
        // Ignore parse errors
    }
    return 0
}

/**
 * Save today's session count, checking for midnight rollover
 */
function saveTodaySessions(sessions: number): void {
    localStorage.setItem(
        STORAGE_KEYS.today,
        JSON.stringify({ date: getTodayKey(), sessions })
    )
}

export function usePomodoro(onComplete?: (mode: TimerMode) => void) {
    const [settings, setSettings] = usePomodoroSettings()

    const [state, setState] = useState<PomodoroState>(() => {
        // Restore persisted state with validation
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.state)
            if (stored) {
                const parsed = JSON.parse(stored)
                const mode = validateMode(parsed.mode)
                const completedSessions = typeof parsed.completedSessions === "number" && parsed.completedSessions >= 0
                    ? parsed.completedSessions
                    : 0

                // Validate timeRemaining is within reasonable bounds
                const maxDuration = Math.max(
                    settings.focusDuration,
                    settings.shortBreakDuration,
                    settings.longBreakDuration
                ) * 60
                const timeRemaining = typeof parsed.timeRemaining === "number" &&
                    parsed.timeRemaining > 0 &&
                    parsed.timeRemaining <= maxDuration
                    ? parsed.timeRemaining
                    : getDurationForMode(mode, settings)

                return {
                    mode,
                    status: "idle", // Always start idle on refresh
                    timeRemaining,
                    completedSessions,
                    todaySessions: loadTodaySessions(),
                }
            }
        } catch {
            // Ignore parse errors
        }
        return {
            mode: "focus",
            status: "idle",
            timeRemaining: settings.focusDuration * 60,
            completedSessions: 0,
            todaySessions: loadTodaySessions(),
        }
    })

    const intervalRef = useRef<number | null>(null)
    const onCompleteRef = useRef(onComplete)

    // Keep callback ref updated
    useEffect(() => {
        onCompleteRef.current = onComplete
    }, [onComplete])

    // Persist timer state (mode, completedSessions, timeRemaining when idle)
    useEffect(() => {
        localStorage.setItem(
            STORAGE_KEYS.state,
            JSON.stringify({
                mode: state.mode,
                completedSessions: state.completedSessions,
                timeRemaining: state.status === "idle" ? state.timeRemaining : undefined,
            })
        )
    }, [state.mode, state.completedSessions, state.status, state.timeRemaining])

    // Save today's sessions whenever they change
    useEffect(() => {
        saveTodaySessions(state.todaySessions)
    }, [state.todaySessions])

    // Timer tick - uses timestamp-based approach for accuracy
    // Note: state.timeRemaining is intentionally excluded from deps to prevent
    // restarting the timer on every tick. The endTime is calculated once on start.
    useEffect(() => {
        if (state.status !== "running") {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
                intervalRef.current = null
            }
            return
        }

        // Calculate end time once when starting
        const endTime = Date.now() + state.timeRemaining * 1000

        const tick = () => {
            const remaining = Math.max(0, Math.round((endTime - Date.now()) / 1000))

            if (remaining <= 0) {
                // Clear interval immediately to prevent re-triggering
                if (intervalRef.current) {
                    clearInterval(intervalRef.current)
                    intervalRef.current = null
                }

                setState(prev => {
                    // Timer complete
                    const completedMode = prev.mode

                    // Play sound if enabled
                    if (settings.soundEnabled) {
                        playCompletionSound()
                    }

                    onCompleteRef.current?.(completedMode)

                    // Determine next mode and update sessions
                    let nextMode: TimerMode
                    let newCompletedSessions = prev.completedSessions
                    // Check for midnight rollover before incrementing
                    let newTodaySessions = loadTodaySessions()

                    if (completedMode === "focus") {
                        newCompletedSessions++
                        newTodaySessions++
                        // Check if it's time for a long break
                        if (newCompletedSessions % settings.longBreakInterval === 0) {
                            nextMode = "longBreak"
                        } else {
                            nextMode = "shortBreak"
                        }
                    } else {
                        // After any break, go back to focus
                        nextMode = "focus"
                    }

                    return {
                        mode: nextMode,
                        status: settings.autoStartNext ? "running" : "idle",
                        timeRemaining: getDurationForMode(nextMode, settings),
                        completedSessions: newCompletedSessions,
                        todaySessions: newTodaySessions,
                    }
                })
                return
            }

            setState(prev => {
                // Only update if time actually changed
                if (prev.timeRemaining !== remaining) {
                    return { ...prev, timeRemaining: remaining }
                }
                return prev
            })
        }

        // Initial tick
        tick()

        // Use shorter interval for smoother updates
        intervalRef.current = window.setInterval(tick, TIMER_TICK_INTERVAL)

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current)
            }
        }
        // state.mode is included so effect restarts with new duration on auto-start
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.status, state.mode, settings])

    const start = useCallback(() => {
        // Initialize audio on first user interaction (required by browser autoplay policy)
        initAudio()
        setState(prev => ({ ...prev, status: "running" }))
    }, [])

    const pause = useCallback(() => {
        setState(prev => ({ ...prev, status: "paused" }))
    }, [])

    // Complete current session (counts toward progress if focus mode)
    const complete = useCallback(() => {
        setState(prev => {
            let nextMode: TimerMode
            let newCompletedSessions = prev.completedSessions
            // Check for midnight rollover
            let newTodaySessions = loadTodaySessions()

            if (prev.mode === "focus") {
                // Count this focus session as completed
                newCompletedSessions++
                newTodaySessions++

                if (settings.soundEnabled) {
                    playCompletionSound()
                }
                onCompleteRef.current?.("focus")

                if (newCompletedSessions % settings.longBreakInterval === 0) {
                    nextMode = "longBreak"
                } else {
                    nextMode = "shortBreak"
                }
            } else {
                // Completing a break just moves to focus
                nextMode = "focus"
            }

            return {
                mode: nextMode,
                status: "idle",
                timeRemaining: getDurationForMode(nextMode, settings),
                completedSessions: newCompletedSessions,
                todaySessions: newTodaySessions,
            }
        })
    }, [settings])

    const updateSettings = useCallback((newSettings: Partial<PomodoroSettings>) => {
        setSettings(prev => {
            // Use centralized validation with bounds
            const validated = validateSettings({ ...prev, ...newSettings })

            // If we update duration and timer is idle, update remaining time too
            setState(state => {
                if (state.status === "idle") {
                    return {
                        ...state,
                        timeRemaining: getDurationForMode(state.mode, validated),
                    }
                }
                return state
            })
            return validated
        })
    }, [setSettings])

    return {
        state,
        settings,
        start,
        pause,
        complete,
        updateSettings,
    }
}
