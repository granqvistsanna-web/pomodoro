import { useState, useEffect, useCallback } from "react"
import { framer } from "framer-plugin"
import type { PluginSize } from "../types"
import { PLUGIN_SIZES, STORAGE_KEYS } from "../constants"

/**
 * Hook for managing plugin size state with Framer integration
 */
export function usePluginSize() {
    const [size, setSize] = useState<PluginSize>(() => {
        const stored = localStorage.getItem(STORAGE_KEYS.size)
        if (stored === "mini" || stored === "full") return stored
        return "full"
    })

    // Persist size and update Framer UI
    useEffect(() => {
        localStorage.setItem(STORAGE_KEYS.size, size)
        framer.showUI({
            position: "top right",
            ...PLUGIN_SIZES[size],
        })
    }, [size])

    const toggle = useCallback(() => {
        setSize(s => s === "mini" ? "full" : "mini")
    }, [])

    return { toggle, isMini: size === "mini" }
}
