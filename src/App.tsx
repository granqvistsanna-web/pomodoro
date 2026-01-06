import { framer } from "framer-plugin"
import { useState, useCallback, useEffect } from "react"
import type { TimerMode, ToastState } from "./types"
import { PLUGIN_SIZES } from "./constants"
import { formatTimeMini } from "./utils/format"
import { getModeBackground, getModeColor } from "./utils/mode"
import { usePomodoro } from "./hooks/usePomodoro"
import { useTheme } from "./hooks/useTheme"
import { usePluginSize } from "./hooks/usePluginSize"
import { TimerDisplay } from "./components/TimerDisplay"
import { Controls } from "./components/Controls"
import { Settings } from "./components/Settings"
import { Toast } from "./components/Toast"

// Initialize plugin UI
framer.showUI({
    position: "top right",
    width: 180,
    height: 220,
})

export function App() {
    const { theme } = useTheme()
    const { toggle: toggleSize, isMini } = usePluginSize()
    const [showSettings, setShowSettings] = useState(false)
    const [toast, setToast] = useState<ToastState>({
        visible: false,
        mode: "focus",
    })

    const pomodoro = usePomodoro((mode: TimerMode) => {
        setToast({ visible: true, mode })
    })

    const handleDismissToast = useCallback(() => {
        setToast(prev => ({ ...prev, visible: false }))
    }, [])

    // Resize plugin when settings opens/closes
    useEffect(() => {
        if (isMini) return
        framer.showUI({
            position: "top right",
            ...(showSettings ? PLUGIN_SIZES.settings : PLUGIN_SIZES.full),
        })
    }, [showSettings, isMini])

    const bgClass = getModeBackground(pomodoro.state.mode)

    // Settings view
    if (showSettings) {
        return (
            <main className={`flex flex-col p-2.5 h-full transition-colors duration-700 ${bgClass}`}>
                <Settings
                    settings={pomodoro.settings}
                    onUpdate={pomodoro.updateSettings}
                    onClose={() => setShowSettings(false)}
                    timerStatus={pomodoro.state.status}
                    timeRemaining={pomodoro.state.timeRemaining}
                />
            </main>
        )
    }

    // Mini mode - ultra compact horizontal bar
    if (isMini) {
        const isRunning = pomodoro.state.status === "running"
        const isPaused = pomodoro.state.status === "paused"
        const modeColor = getModeColor(pomodoro.state.mode)

        return (
            <main className={`flex items-center justify-between px-2.5 h-full relative transition-colors duration-700 ${bgClass}`}>
                {/* Expand button */}
                <button
                    onClick={toggleSize}
                    className="icon-btn w-9 h-9 flex items-center justify-center rounded-lg text-theme-text-secondary transition-all active:scale-95"
                    title="Expand"
                    aria-label="Expand to full view"
                >
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M9 2H12V5M5 12H2V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>

                {/* Time display - center */}
                <div className="absolute left-1/2 -translate-x-1/2 flex items-center gap-2">
                    <span
                        className={`w-1 h-1 rounded-full transition-opacity duration-300 ${
                            isRunning ? "animate-pulse-soft" : ""
                        } ${isRunning || isPaused ? "opacity-100" : "opacity-0"}`}
                        style={{
                            backgroundColor: modeColor,
                            color: modeColor,
                            opacity: isPaused ? 0.5 : undefined
                        }}
                    />
                    <span
                        className={`text-[15px] font-medium tracking-tight transition-colors duration-300 ${
                            isRunning
                                ? "text-theme-text"
                                : isPaused
                                    ? "text-theme-text-secondary"
                                    : "text-theme-text-muted"
                        }`}
                        style={{ fontFeatureSettings: '"tnum"' }}
                    >
                        {formatTimeMini(pomodoro.state.timeRemaining)}
                    </span>
                </div>

                {/* Play/Pause button - right side */}
                <button
                    onClick={isRunning ? pomodoro.pause : pomodoro.start}
                    className={`w-9 h-9 flex items-center justify-center rounded-lg transition-all active:scale-95 ${
                        isRunning
                            ? "btn-secondary text-theme-text-secondary"
                            : "btn-primary"
                    }`}
                    title={isRunning ? "Pause" : isPaused ? "Resume" : "Start"}
                    aria-label={isRunning ? "Pause timer" : isPaused ? "Resume timer" : "Start timer"}
                >
                    {isRunning ? (
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                            <rect x="3" y="2" width="3" height="10" rx="1" fill="currentColor"/>
                            <rect x="8" y="2" width="3" height="10" rx="1" fill="currentColor"/>
                        </svg>
                    ) : (
                        <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                            <path d="M3 2.5V11.5L11.5 7L3 2.5Z" fill="currentColor"/>
                        </svg>
                    )}
                </button>

                {/* Toast - compact version for mini mode */}
                <Toast
                    mode={toast.mode}
                    visible={toast.visible}
                    onDismiss={handleDismissToast}
                    compact
                />
            </main>
        )
    }

    // Full mode
    return (
        <main className={`flex flex-col items-center p-2.5 h-full relative transition-colors duration-700 ${bgClass}`}>
            {/* Header */}
            <div className="w-full flex items-center justify-between">
                {/* Left: Collapse button */}
                <button
                    onClick={toggleSize}
                    className="icon-btn w-6 h-6 flex items-center justify-center rounded-lg text-theme-text-secondary transition-all active:scale-95"
                    title="Minimize"
                    aria-label="Minimize to compact view"
                >
                    <svg width="12" height="12" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                        <path d="M5 2H2V5M9 12H12V9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                </button>

                {/* Right: Session count + Settings */}
                <div className="flex items-center gap-1">
                    {pomodoro.state.todaySessions > 0 && (
                        <div className="session-badge flex items-center gap-1 px-1.5 py-0.5 rounded-full">
                            <span className="w-1 h-1 rounded-full" style={{ backgroundColor: "var(--color-accent)" }} />
                            <span className="text-[9px] font-semibold tabular-nums text-theme-text">
                                {pomodoro.state.todaySessions}
                            </span>
                        </div>
                    )}
                    <button
                        onClick={() => setShowSettings(true)}
                        className="icon-btn w-6 h-6 flex items-center justify-center rounded-lg text-theme-text-secondary transition-all active:scale-95"
                        title="Settings"
                        aria-label="Open settings"
                    >
                        <svg width="10" height="10" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                            <circle cx="7" cy="7" r="1.5" fill="currentColor"/>
                            <circle cx="7" cy="3" r="1.5" fill="currentColor"/>
                            <circle cx="7" cy="11" r="1.5" fill="currentColor"/>
                        </svg>
                    </button>
                </div>
            </div>

            {/* Timer */}
            <div className="flex-1 flex items-center justify-center -mt-6">
                <TimerDisplay
                    mode={pomodoro.state.mode}
                    status={pomodoro.state.status}
                    timeRemaining={pomodoro.state.timeRemaining}
                    settings={pomodoro.settings}
                />
            </div>

            {/* Controls */}
            <Controls
                status={pomodoro.state.status}
                onStart={pomodoro.start}
                onPause={pomodoro.pause}
                onComplete={pomodoro.complete}
            />

            {/* Toast */}
            <Toast
                mode={toast.mode}
                visible={toast.visible}
                onDismiss={handleDismissToast}
            />
        </main>
    )
}
