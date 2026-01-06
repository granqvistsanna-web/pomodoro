import { useState, useEffect, useCallback, useRef } from "react"
import { useLocalStorage } from "./useLocalStorage"
import { playCompletionSound } from "../utils/sound"
import type { TimerMode, TimerStatus, PomodoroSettings, PomodoroState } from "../types"
import { DEFAULT_SETTINGS, STORAGE_KEYS, TIMER_TICK_INTERVAL, getDurationForMode } from "../constants"

// Re-export types for backwards compatibility
export type { TimerMode, TimerStatus, PomodoroSettings, PomodoroState }

export function usePomodoro(onComplete?: (mode: TimerMode) => void) {
    const [settings, setSettings] = useLocalStorage<PomodoroSettings>(
        STORAGE_KEYS.settings,
        DEFAULT_SETTINGS
    )

    const [state, setState] = useState<PomodoroState>(() => {
        // Restore persisted state
        try {
            const stored = localStorage.getItem(STORAGE_KEYS.state)
            if (stored) {
                const parsed = JSON.parse(stored)
                return {
                    mode: parsed.mode || "focus",
                    status: "idle", // Always start idle on refresh
                    timeRemaining: parsed.timeRemaining || getDurationForMode(parsed.mode || "focus", settings),
                    completedSessions: parsed.completedSessions || 0,
                    todaySessions: 0, // Loaded separately
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
            todaySessions: 0,
        }
    })

    const intervalRef = useRef<number | null>(null)
    const onCompleteRef = useRef(onComplete)

    // Keep callback ref updated
    useEffect(() => {
        onCompleteRef.current = onComplete
    }, [onComplete])

    // Load today's sessions from localStorage
    useEffect(() => {
        const today = new Date().toDateString()
        const stored = localStorage.getItem(STORAGE_KEYS.today)
        if (stored) {
            const { date, sessions } = JSON.parse(stored)
            if (date === today) {
                setState(prev => ({ ...prev, todaySessions: sessions }))
            }
        }
    }, [])

    // Save today's sessions
    useEffect(() => {
        const today = new Date().toDateString()
        localStorage.setItem(
            STORAGE_KEYS.today,
            JSON.stringify({ date: today, sessions: state.todaySessions })
        )
    }, [state.todaySessions])

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

            setState(prev => {
                if (remaining <= 0) {
                    // Timer complete
                    const completedMode = prev.mode

                    // Play sound if enabled
                    if (settings.soundEnabled) {
                        playCompletionSound()
                    }

                    onCompleteRef.current?.(completedMode)

                    // Determine next mode
                    let nextMode: TimerMode
                    let newCompletedSessions = prev.completedSessions
                    let newTodaySessions = prev.todaySessions

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
                }

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
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [state.status, settings])

    const start = useCallback(() => {
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
            let newTodaySessions = prev.todaySessions

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
            // Validate and clamp duration values
            const validated = { ...newSettings }
            if (validated.focusDuration !== undefined) {
                validated.focusDuration = Math.max(1, Math.min(60, validated.focusDuration))
            }
            if (validated.shortBreakDuration !== undefined) {
                validated.shortBreakDuration = Math.max(1, Math.min(30, validated.shortBreakDuration))
            }
            if (validated.longBreakDuration !== undefined) {
                validated.longBreakDuration = Math.max(1, Math.min(60, validated.longBreakDuration))
            }
            if (validated.longBreakInterval !== undefined) {
                validated.longBreakInterval = Math.max(2, Math.min(10, validated.longBreakInterval))
            }

            const updated = { ...prev, ...validated }
            // If we update duration and timer is idle, update remaining time too
            setState(state => {
                if (state.status === "idle") {
                    return {
                        ...state,
                        timeRemaining: getDurationForMode(state.mode, updated),
                    }
                }
                return state
            })
            return updated
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
