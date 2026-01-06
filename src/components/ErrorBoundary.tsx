import { Component, type ReactNode } from "react"

interface Props {
    children: ReactNode
}

interface State {
    hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props)
        this.state = { hasError: false }
    }

    static getDerivedStateFromError(): State {
        return { hasError: true }
    }

    handleRetry = () => {
        this.setState({ hasError: false })
    }

    handleReset = () => {
        try {
            localStorage.removeItem("pomodoro-settings")
            localStorage.removeItem("pomodoro-state")
            localStorage.removeItem("pomodoro-today")
            localStorage.removeItem("pomodoro-size")
        } catch {
            // Ignore storage errors
        }
        window.location.reload()
    }

    render() {
        if (this.state.hasError) {
            return (
                <div
                    className="flex flex-col items-center justify-center h-full p-4 text-center"
                    role="alert"
                    aria-live="assertive"
                >
                    <div
                        className="w-8 h-8 mb-3 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: "var(--color-accent-muted)" }}
                        aria-hidden="true"
                    >
                        <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                            <path
                                d="M7 4V7M7 10H7.005"
                                stroke="var(--color-accent)"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                    <p className="text-[11px] font-medium text-theme-text mb-1">
                        Unable to load
                    </p>
                    <p className="text-[10px] text-theme-text-muted mb-4">
                        Try again or reset to defaults
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={this.handleRetry}
                            className="btn-primary h-7 px-3 text-[10px] font-medium rounded-lg transition-all active:scale-95"
                        >
                            Retry
                        </button>
                        <button
                            onClick={this.handleReset}
                            className="btn-secondary h-7 px-3 text-[10px] font-medium rounded-lg text-theme-text-secondary border border-theme-border transition-all active:scale-95"
                        >
                            Reset
                        </button>
                    </div>
                </div>
            )
        }

        return this.props.children
    }
}
