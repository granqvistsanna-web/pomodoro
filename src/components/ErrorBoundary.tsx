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
        // Clear all stored data and reload
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
                <div className="flex flex-col items-center justify-center h-full p-4 bg-theme-bg text-center">
                    <div className="w-10 h-10 mb-3 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                            <path
                                d="M10 6V10M10 14H10.01M18 10C18 14.4183 14.4183 18 10 18C5.58172 18 2 14.4183 2 10C2 5.58172 5.58172 2 10 2C14.4183 2 18 5.58172 18 10Z"
                                stroke="currentColor"
                                strokeWidth="1.5"
                                strokeLinecap="round"
                                className="text-red-500"
                            />
                        </svg>
                    </div>
                    <h2 className="text-[12px] font-semibold text-theme-text mb-1">
                        Something went wrong
                    </h2>
                    <p className="text-[10px] text-theme-text-muted mb-4">
                        The timer encountered an error
                    </p>
                    <div className="flex gap-2">
                        <button
                            onClick={this.handleRetry}
                            className="btn-primary px-3 py-1.5 text-[10px] font-medium rounded-lg"
                        >
                            Try again
                        </button>
                        <button
                            onClick={this.handleReset}
                            className="btn-secondary px-3 py-1.5 text-[10px] font-medium rounded-lg text-theme-text-secondary"
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
