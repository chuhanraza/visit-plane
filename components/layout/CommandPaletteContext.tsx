'use client'

/**
 * CommandPaletteContext
 * Shared state for the global Cmd+K command palette.
 * Consumed by SiteHeader (to open it) and CommandPalette (to render it).
 */

import { createContext, useContext, useState, ReactNode, useCallback } from 'react'

interface CommandPaletteContextType {
  open: boolean
  openPalette: () => void
  closePalette: () => void
  togglePalette: () => void
}

const CommandPaletteContext = createContext<CommandPaletteContextType>({
  open: false,
  openPalette: () => {},
  closePalette: () => {},
  togglePalette: () => {},
})

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false)
  const openPalette   = useCallback(() => setOpen(true),  [])
  const closePalette  = useCallback(() => setOpen(false), [])
  const togglePalette = useCallback(() => setOpen((v) => !v), [])

  return (
    <CommandPaletteContext.Provider value={{ open, openPalette, closePalette, togglePalette }}>
      {children}
    </CommandPaletteContext.Provider>
  )
}

export const useCommandPalette = () => useContext(CommandPaletteContext)
