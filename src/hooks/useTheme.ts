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
        const unsubscribe = framer.subscribe("theme", (framerTheme) => {
            const newTheme = framerTheme === "dark" ? "dark" : "light"
            setTheme(newTheme)
            document.documentElement.setAttribute("data-theme", newTheme)
        })

        return unsubscribe
    }, [])

    return { theme }
}
