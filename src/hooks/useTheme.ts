import { useState, useEffect, useCallback } from "react"
import type { Theme } from "../types"
import { STORAGE_KEYS } from "../constants"

/**
 * Detect system color scheme preference
 */
function getSystemTheme(): Theme {
    if (typeof window !== "undefined" && window.matchMedia) {
        return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"
    }
    return "light"
}

/**
 * Hook for managing theme state with persistence and system preference sync
 */
export function useTheme() {
    const [theme, setTheme] = useState<Theme>(() => {
        const stored = localStorage.getItem(STORAGE_KEYS.theme)
        if (stored === "light" || stored === "dark") return stored
        return getSystemTheme()
    })

    // Persist theme and update DOM attribute
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.theme, theme)
        document.documentElement.setAttribute("data-theme", theme)
    }, [theme])

    // Listen for system theme changes
    useEffect(() => {
        const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)")
        const handleChange = (e: MediaQueryListEvent) => {
            const stored = localStorage.getItem(STORAGE_KEYS.theme)
            // Only auto-switch if user hasn't explicitly set a preference
            if (!stored) {
                setTheme(e.matches ? "dark" : "light")
            }
        }
        mediaQuery.addEventListener("change", handleChange)
        return () => mediaQuery.removeEventListener("change", handleChange)
    }, [])

    const toggle = useCallback(() => {
        setTheme(t => t === "light" ? "dark" : "light")
    }, [])

    return { theme, toggle }
}
