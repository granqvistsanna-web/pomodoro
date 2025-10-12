import { framer, CanvasNode } from "framer-plugin"
import { useState, useEffect } from "react"

framer.showUI({
    position: "top right",
    width: 320,
    height: 320,
})

function useSelection() {
    const [selection, setSelection] = useState<CanvasNode[]>([])

    useEffect(() => {
        return framer.subscribeToSelection(setSelection)
    }, [])

    return selection
}

export function App() {
    const selection = useSelection()
    const layer = selection.length === 1 ? "layer" : "layers"

    const handleAddSvg = async () => {
        await framer.addSVG({
            svg: `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"><path fill="#999" d="M20 0v8h-8L4 0ZM4 8h8l8 8h-8v8l-8-8Z"/></svg>`,
            name: "Logo.svg",
        })
    }

    return (
        <main className="flex flex-col items-start px-4 pb-4h-full gap-4">
            <p className="text-lg">
                Welcome to your Framer plugin Starter Kit!
            </p>
            <p className="text-base">
                This is a preview of your plugin. Any changes you make in Cursor will automatically update here when you save.
            </p>
        </main>
    )
}
