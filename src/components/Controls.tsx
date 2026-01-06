import type { TimerStatus } from "../types"

interface ControlsProps {
    status: TimerStatus
    onStart: () => void
    onPause: () => void
    onComplete: () => void
}

export function Controls({ status, onStart, onPause, onComplete }: ControlsProps) {
    return (
        <div className="w-full flex gap-1.5">
            {status === "running" ? (
                <button
                    onClick={onPause}
                    className="btn-secondary hover-accent flex-1 h-8 flex items-center justify-center gap-1 rounded-full border border-theme-border-strong text-theme-text-secondary transition-all active:scale-[0.98]"
                >
                    <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                        <rect x="3" y="2" width="3" height="10" rx="1" fill="currentColor"/>
                        <rect x="8" y="2" width="3" height="10" rx="1" fill="currentColor"/>
                    </svg>
                    <span className="text-[9px] font-medium">Pause</span>
                </button>
            ) : status === "paused" ? (
                <button
                    onClick={onStart}
                    className="btn-secondary hover-accent flex-1 h-8 flex items-center justify-center gap-1 rounded-full border border-theme-border-strong text-theme-text-secondary transition-all active:scale-[0.98]"
                >
                    <svg width="10" height="10" viewBox="0 0 14 14" fill="none">
                        <path d="M3.5 2v10l8-5-8-5z" fill="currentColor"/>
                    </svg>
                    <span className="text-[9px] font-medium">Resume</span>
                </button>
            ) : (
                <button
                    onClick={onStart}
                    className="btn-primary flex-1 h-8 text-[11px] font-semibold rounded-full shadow-theme-sm transition-all active:scale-[0.98]"
                >
                    Start
                </button>
            )}
            {(status === "running" || status === "paused") && (
                <button
                    onClick={onComplete}
                    className="btn-primary flex-1 h-8 text-[9px] font-medium rounded-full shadow-theme-sm transition-all active:scale-[0.98]"
                >
                    Done
                </button>
            )}
        </div>
    )
}
