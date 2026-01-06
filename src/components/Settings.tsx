import { useState, useEffect, useRef } from "react"
import type { TimerStatus, PomodoroSettings } from "../types"
import { formatTime } from "../utils/format"

interface SettingsProps {
    settings: PomodoroSettings
    onUpdate: (settings: Partial<PomodoroSettings>) => void
    onClose: () => void
    timerStatus?: TimerStatus
    timeRemaining?: number
}

interface NumberInputProps {
    label: string
    value: number
    onChange: (value: number) => void
    min?: number
    max?: number
    suffix?: string
}

function NumberInput({ label, value, onChange, min = 1, max = 60, suffix = "min" }: NumberInputProps) {
    const id = label.toLowerCase().replace(/\s+/g, "-")
    return (
        <div className="flex items-center justify-between h-8">
            <label id={`${id}-label`} className="text-[11px] text-theme-text-secondary">{label}</label>
            <div className="flex items-center" role="group" aria-labelledby={`${id}-label`}>
                <button
                    onClick={() => onChange(Math.max(min, value - 1))}
                    aria-label={`Decrease ${label}`}
                    disabled={value <= min}
                    className="icon-btn w-6 h-6 flex items-center justify-center rounded-full text-theme-text-secondary transition-all active:scale-90 disabled:opacity-40"
                >
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                        <path d="M2.5 5H7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                </button>
                <span
                    className="w-6 text-center text-[11px] font-semibold text-theme-text tabular-nums"
                    aria-live="polite"
                    aria-atomic="true"
                >
                    {value}
                </span>
                <button
                    onClick={() => onChange(Math.min(max, value + 1))}
                    aria-label={`Increase ${label}`}
                    disabled={value >= max}
                    className="icon-btn w-6 h-6 flex items-center justify-center rounded-full text-theme-text-secondary transition-all active:scale-90 disabled:opacity-40"
                >
                    <svg width="8" height="8" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                        <path d="M5 2.5V7.5M2.5 5H7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                </button>
                {suffix && <span className="text-[9px] text-theme-text-muted ml-0.5" aria-hidden="true">{suffix}</span>}
            </div>
        </div>
    )
}

interface ToggleProps {
    label: string
    checked: boolean
    onChange: (checked: boolean) => void
}

function Toggle({ label, checked, onChange }: ToggleProps) {
    const id = label.toLowerCase().replace(/\s+/g, "-")
    return (
        <div className="flex items-center justify-between h-8">
            <label id={`${id}-label`} className="text-[11px] text-theme-text-secondary">{label}</label>
            <button
                role="switch"
                aria-checked={checked}
                aria-labelledby={`${id}-label`}
                onClick={() => onChange(!checked)}
                className="relative w-[44px] h-[26px] rounded-full transition-colors duration-300 ease-in-out"
                style={{ backgroundColor: checked ? "var(--color-success)" : "var(--color-toggle-bg)" }}
            >
                <span
                    aria-hidden="true"
                    className={`absolute top-[3px] left-[3px] w-[20px] h-[20px] rounded-full transition-transform duration-300 ease-in-out ${
                        checked ? "translate-x-[18px]" : "translate-x-0"
                    }`}
                    style={{
                        backgroundColor: "#ffffff",
                        boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2), 0 0 0 0.5px rgba(0, 0, 0, 0.04)"
                    }}
                />
            </button>
        </div>
    )
}

const SUPPORT_EMAIL = "granqvistsanna@gmail.com"
const WIKIPEDIA_URL = "https://en.wikipedia.org/wiki/Pomodoro_Technique"

export function Settings({ settings, onUpdate, onClose, timerStatus, timeRemaining }: SettingsProps) {
    const isTimerActive = timerStatus === "running" || timerStatus === "paused"
    const [showSaved, setShowSaved] = useState(false)
    const saveTimeoutRef = useRef<number>()
    const isFirstRender = useRef(true)

    // Show "Saved" indicator when settings change
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false
            return
        }
        setShowSaved(true)
        if (saveTimeoutRef.current) {
            clearTimeout(saveTimeoutRef.current)
        }
        saveTimeoutRef.current = window.setTimeout(() => {
            setShowSaved(false)
        }, 1500)
        return () => {
            if (saveTimeoutRef.current) {
                clearTimeout(saveTimeoutRef.current)
            }
        }
    }, [settings])

    return (
        <div className="flex flex-col h-full animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                    <h2 className="text-[11px] font-semibold text-theme-text">Settings</h2>
                    {showSaved && (
                        <span className="text-[9px] font-medium text-accent animate-fade-in">
                            Saved
                        </span>
                    )}
                    {isTimerActive && timeRemaining !== undefined && !showSaved && (
                        <span className="text-[9px] font-semibold tabular-nums px-1.5 py-0.5 rounded-full bg-accent-muted text-accent">
                            {formatTime(timeRemaining)}
                        </span>
                    )}
                </div>
                <button
                    onClick={onClose}
                    className="icon-btn w-6 h-6 flex items-center justify-center rounded-lg text-theme-text-secondary transition-all active:scale-95"
                    aria-label="Close settings"
                >
                    <svg width="10" height="10" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                        <path d="M9 3L3 9M3 3L9 9" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                </button>
            </div>

            {/* Settings sections */}
            <div className="flex flex-col gap-2 pt-2">
                <NumberInput
                    label="Focus"
                    value={settings.focusDuration}
                    onChange={(v) => onUpdate({ focusDuration: v })}
                />
                <NumberInput
                    label="Short break"
                    value={settings.shortBreakDuration}
                    onChange={(v) => onUpdate({ shortBreakDuration: v })}
                />
                <NumberInput
                    label="Long break"
                    value={settings.longBreakDuration}
                    onChange={(v) => onUpdate({ longBreakDuration: v })}
                />
                <NumberInput
                    label="Long break after"
                    value={settings.longBreakInterval}
                    onChange={(v) => onUpdate({ longBreakInterval: v })}
                    min={2}
                    max={10}
                    suffix=""
                />
                <Toggle
                    label="Auto-start"
                    checked={settings.autoStartNext}
                    onChange={(v) => onUpdate({ autoStartNext: v })}
                />
                <Toggle
                    label="Sound"
                    checked={settings.soundEnabled}
                    onChange={(v) => onUpdate({ soundEnabled: v })}
                />
            </div>

            {/* Utility links */}
            <nav className="mt-auto pt-3 flex gap-2 border-t border-theme-border" aria-label="Help and support">
                <a
                    href={WIKIPEDIA_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Learn more about the Pomodoro technique (opens in new tab)"
                    className="flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-lg bg-theme-hover-bg hover:bg-theme-border transition-colors group active:scale-[0.98]"
                >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className="text-theme-text-muted group-hover:text-theme-text-secondary transition-colors">
                        <path fillRule="evenodd" clipRule="evenodd" d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM7.25 5a.75.75 0 011.5 0v3a.75.75 0 01-1.5 0V5zm.75 5.5a.75.75 0 100 1.5.75.75 0 000-1.5z"/>
                    </svg>
                    <span className="text-[9px] font-medium text-theme-text-muted group-hover:text-theme-text-secondary transition-colors">
                        Learn more
                    </span>
                </a>
                <a
                    href={`mailto:${SUPPORT_EMAIL}`}
                    aria-label="Send feedback via email"
                    className="flex-1 flex flex-col items-center gap-1.5 py-2.5 rounded-lg bg-theme-hover-bg hover:bg-theme-border transition-colors group active:scale-[0.98]"
                >
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className="text-theme-text-muted group-hover:text-theme-text-secondary transition-colors">
                        <path d="M2 4.5A1.5 1.5 0 013.5 3h9A1.5 1.5 0 0114 4.5v7a1.5 1.5 0 01-1.5 1.5h-9A1.5 1.5 0 012 11.5v-7zm1.5-.25a.25.25 0 00-.164.44L8 8.3l4.664-3.61a.25.25 0 00-.164-.44h-9z"/>
                    </svg>
                    <span className="text-[9px] font-medium text-theme-text-muted group-hover:text-theme-text-secondary transition-colors">
                        Feedback
                    </span>
                </a>
            </nav>
        </div>
    )
}
