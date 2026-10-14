import { createContext, useContext, useState, type ReactNode } from 'react'

type Theme = 'dark' | 'light'
interface Ctx {
  theme: Theme
  setTheme: (t: Theme) => void
}

const ThemeCtx = createContext<Ctx>({ theme: 'light', setTheme: () => {} })

/** Contraste de la navigation : « dark » = scène sombre, texte clair ; « light » = fond clair, texte foncé. */
export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  return <ThemeCtx.Provider value={{ theme, setTheme }}>{children}</ThemeCtx.Provider>
}

// eslint-disable-next-line react-refresh/only-export-components
export const useTheme = () => useContext(ThemeCtx)
