import { useState, useEffect } from "react"
import { framer } from "framer-plugin"
import type { Theme } from "../types"

/**
 * Hook for syncing theme with Framer's theme setting
 */
export function useTheme() {
    const [theme, setTheme] = useState<Theme>("light")

    // Subscribe to Framer's theme
    useEffect(() => {
        let unsubscribe: (() => void) | undefined

        try {
            unsubscribe = framer.subscribe("theme", (framerTheme) => {
                const newTheme = framerTheme === "dark" ? "dark" : "light"
                setTheme(newTheme)
                document.documentElement.setAttribute("data-theme", newTheme)
            })
        } catch {
            // Fallback to system preference if Framer subscription fails
            const isDark = window.matchMedia?.("(prefers-color-scheme: dark)").matches
            const fallbackTheme = isDark ? "dark" : "light"
            setTheme(fallbackTheme)
            document.documentElement.setAttribute("data-theme", fallbackTheme)
        }

        return () => {
            if (unsubscribe) unsubscribe()
        }
    }, [])

    return { theme }
}
