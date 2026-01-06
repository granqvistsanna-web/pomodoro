import type { TimerMode, TimerStatus, PomodoroSettings } from "../types"
import { formatTime } from "../utils/format"
import { getModeColor, getModeGlow, getModeLabel } from "../utils/mode"
import { getDurationForMode } from "../constants"

interface TimerDisplayProps {
    mode: TimerMode
    status: TimerStatus
    timeRemaining: number
    settings: PomodoroSettings
}

/**
 * Generate radial tick marks for the timer display
 */
function generateTicks(count: number, progress: number, isRunning: boolean, size: number, modeColor: string) {
    const ticks = []
    const activeCount = Math.floor(count * progress)
    const center = size / 2

    for (let i = 0; i < count; i++) {
        const angle = (i * 360) / count - 90
        const isActive = i < activeCount

        // Cardinal (4) + ordinal (4) + minor ticks
        const isCardinal = i % 8 === 0
        const isOrdinal = i % 8 === 4
        const length = isCardinal ? 14 : isOrdinal ? 9 : 5
        const innerRadius = size * 0.28
        const outerRadius = innerRadius + length

        const x1 = center + innerRadius * Math.cos((angle * Math.PI) / 180)
        const y1 = center + innerRadius * Math.sin((angle * Math.PI) / 180)
        const x2 = center + outerRadius * Math.cos((angle * Math.PI) / 180)
        const y2 = center + outerRadius * Math.sin((angle * Math.PI) / 180)

        ticks.push(
            <line
                key={i}
                x1={x1}
                y1={y1}
                x2={x2}
                y2={y2}
                stroke={isActive ? modeColor : "var(--color-border-strong)"}
                className="transition-all duration-300"
                strokeWidth={isCardinal ? 2.5 : isOrdinal ? 2 : 1.5}
                strokeLinecap="round"
                style={{
                    filter: isActive && isRunning ? `drop-shadow(0 0 3px ${modeColor})` : undefined
                }}
            />
        )
    }
    return ticks
}

export function TimerDisplay({ mode, status, timeRemaining, settings }: TimerDisplayProps) {
    const isRunning = status === "running"
    const isPaused = status === "paused"
    const totalDuration = getDurationForMode(mode, settings)
    const progress = totalDuration > 0 ? Math.max(0, Math.min(1, 1 - timeRemaining / totalDuration)) : 0

    const size = 100
    const modeColor = getModeColor(mode)
    const modeGlow = getModeGlow(mode)

    return (
        <div className="relative flex flex-col items-center">
            {/* Timer graphic */}
            <div className="relative">
                {/* Ambient glow when running */}
                <div
                    className={`absolute -inset-4 rounded-full transition-all duration-1000 ${
                        isRunning ? "opacity-100 animate-glow-pulse" : "opacity-0"
                    }`}
                    style={{
                        background: `radial-gradient(circle, ${modeGlow} 0%, transparent 60%)`
                    }}
                />

                <svg width={size} height={size} className="relative">
                    {/* Center dot */}
                    <circle
                        cx={size/2}
                        cy={size/2}
                        r={isRunning ? 3 : 2}
                        fill={
                            isRunning || isPaused
                                ? modeColor
                                : "var(--color-border-strong)"
                        }
                        opacity={isPaused && !isRunning ? 0.5 : 1}
                        className="transition-all duration-500"
                        style={{
                            filter: isRunning ? `drop-shadow(0 0 6px ${modeColor})` : undefined
                        }}
                    />

                    {/* Tick marks */}
                    <g>
                        {generateTicks(32, progress, isRunning, size, modeColor)}
                    </g>
                </svg>
            </div>

            {/* Time display */}
            <div className="mt-1.5 flex flex-col items-center">
                {/* Mode label */}
                <span className={`text-[9px] tracking-[0.1em] transition-colors duration-300 ${
                    isRunning ? "text-theme-text-secondary" : "text-theme-text-muted"
                }`}>
                    {getModeLabel(mode)}
                </span>

                {/* Main time */}
                <span
                    className={`text-[20px] font-light tracking-[-0.02em] leading-none transition-all duration-300 ${
                        isRunning
                            ? "text-theme-text"
                            : "text-theme-text-secondary"
                    }`}
                    style={{ fontFeatureSettings: '"tnum"' }}
                >
                    {formatTime(timeRemaining)}
                </span>

            </div>
        </div>
    )
}
