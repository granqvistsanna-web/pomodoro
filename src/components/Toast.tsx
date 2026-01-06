import { useEffect, useState, useRef } from "react"
import type { TimerMode } from "../types"
import { TOAST_DURATION } from "../constants"

interface ToastProps {
    mode: TimerMode
    visible: boolean
    onDismiss: () => void
    compact?: boolean
}

function getToastContent(mode: TimerMode): string {
    switch (mode) {
        case "focus": return "Session complete"
        case "shortBreak": return "Break over"
        case "longBreak": return "Break over"
    }
}

function getCompactContent(mode: TimerMode): string {
    switch (mode) {
        case "focus": return "Done"
        case "shortBreak": return "Break over"
        case "longBreak": return "Break over"
    }
}

export function Toast({ mode, visible, onDismiss, compact = false }: ToastProps) {
    const [show, setShow] = useState(false)
    const onDismissRef = useRef(onDismiss)
    const timerRef = useRef<number>()
    const content = compact ? getCompactContent(mode) : getToastContent(mode)

    // Keep callback ref updated
    useEffect(() => {
        onDismissRef.current = onDismiss
    }, [onDismiss])

    useEffect(() => {
        if (visible) {
            setShow(true)
            timerRef.current = window.setTimeout(() => {
                setShow(false)
                setTimeout(() => onDismissRef.current(), 200)
            }, TOAST_DURATION)
            return () => {
                if (timerRef.current) clearTimeout(timerRef.current)
            }
        }
    }, [visible])

    const handleDismiss = () => {
        if (timerRef.current) clearTimeout(timerRef.current)
        setShow(false)
        setTimeout(() => onDismiss(), 200)
    }

    if (!visible && !show) return null

    // Compact toast for mini mode - overlays the center
    if (compact) {
        return (
            <div
                className={`absolute inset-0 flex items-center justify-center transition-all duration-300 cursor-pointer ${
                    show ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
                onClick={handleDismiss}
            >
                <div className="py-1.5 px-3 rounded-lg bg-surface-elevated backdrop-blur-md shadow-theme-lg border border-theme-border">
                    <div className="flex items-center gap-1.5">
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <span className="text-[11px] font-medium text-theme-text">
                            {content}
                        </span>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div
            className={`absolute bottom-3 left-3 right-3 py-2 px-4 rounded-xl bg-surface-overlay backdrop-blur-md transition-all duration-300 cursor-pointer shadow-theme-lg border border-theme-border ${
                show ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
            }`}
            onClick={handleDismiss}
        >
            <div className="flex flex-col items-center gap-0.5">
                <div className="flex items-center gap-2">
                    <div className="w-5 h-5 rounded-full bg-accent-muted flex items-center justify-center">
                        <svg width="10" height="10" viewBox="0 0 12 12" fill="none">
                            <path d="M2.5 6L5 8.5L9.5 3.5" stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                    </div>
                    <span className="text-[11px] font-medium text-theme-text">
                        {content}
                    </span>
                </div>
                <span className="text-[9px] text-theme-text-muted">tap to dismiss</span>
            </div>
        </div>
    )
}
