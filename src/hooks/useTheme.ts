import { useState, useEffect } from "react"
import type { Theme } from "../types"

function applyTheme(mode: Theme) {
    document.documentElement.setAttribute("data-theme", mode)
}

/**
 * Get current theme from Framer's data-framer-theme attribute
 * Checks both html and body elements, with system preference as fallback
 */
function getFramerTheme(): Theme {
    // Check html element first
    const htmlTheme = document.documentElement.getAttribute("data-framer-theme")
    if (htmlTheme === "dark" || htmlTheme === "light") {
        return htmlTheme
    }

    // Check body element
    const bodyTheme = document.body?.getAttribute("data-framer-theme")
    if (bodyTheme === "dark" || bodyTheme === "light") {
        return bodyTheme
    }

    // Fallback to system preference
    if (window.matchMedia?.("(prefers-color-scheme: dark)").matches) {
        return "dark"
    }

    return "light"
}

/**
 * Hook for syncing theme with Framer's theme setting
 * Uses data-framer-theme attribute which Framer sets based on the app's theme
 * Falls back to system preference if Framer theme not available
 */
export function useTheme() {
    const [theme, setTheme] = useState<Theme>(() => {
        const initial = getFramerTheme()
        applyTheme(initial)
        return initial
    })

    useEffect(() => {
        // Function to update theme from Framer's attribute
        const updateTheme = () => {
            const newTheme = getFramerTheme()
            setTheme(newTheme)
            applyTheme(newTheme)
        }

        // Apply initial theme
        updateTheme()

        // Watch for changes to data-framer-theme attribute on both html and body
        const observer = new MutationObserver((mutations) => {
            for (const mutation of mutations) {
                if (
                    mutation.type === "attributes" &&
                    mutation.attributeName === "data-framer-theme"
                ) {
                    updateTheme()
                    break
                }
            }
        })

        // Observe both html and body elements for attribute changes
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ["data-framer-theme"],
        })

        if (document.body) {
            observer.observe(document.body, {
                attributes: true,
                attributeFilter: ["data-framer-theme"],
            })
        }

        // Also listen for system preference changes as fallback
        const mediaQuery = window.matchMedia?.("(prefers-color-scheme: dark)")
        const handleMediaChange = () => {
            // Only use system preference if Framer hasn't set a theme
            const htmlTheme = document.documentElement.getAttribute("data-framer-theme")
            const bodyTheme = document.body?.getAttribute("data-framer-theme")
            if (!htmlTheme && !bodyTheme) {
                updateTheme()
            }
        }

        mediaQuery?.addEventListener?.("change", handleMediaChange)

        return () => {
            observer.disconnect()
            mediaQuery?.removeEventListener?.("change", handleMediaChange)
        }
    }, [])

    return { theme }
}
