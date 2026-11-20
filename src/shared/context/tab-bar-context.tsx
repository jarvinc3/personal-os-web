"use client"

import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"

type TabBarVisibilityValue = {
  visible: boolean
  setVisible: (visible: boolean) => void
}

const TabBarVisibilityContext = createContext<TabBarVisibilityValue | null>(
  null
)

const MISSING_PROVIDER = "TabBarVisibilityProvider is missing"

function useTabBarContext(): TabBarVisibilityValue {
  const context = useContext(TabBarVisibilityContext)
  if (!context) {
    throw new Error(MISSING_PROVIDER)
  }
  return context
}

/** El overlay necesita saber si la vista actual tiene tab bar para su animación. */
export function TabBarVisibilityProvider({
  children,
}: {
  children: ReactNode
}) {
  const [visible, setVisible] = useState(false)
  const value = useMemo(() => ({ visible, setVisible }), [visible])

  return (
    <TabBarVisibilityContext.Provider value={value}>
      {children}
    </TabBarVisibilityContext.Provider>
  )
}

export function useTabBarVisible(): boolean {
  return useTabBarContext().visible
}

export function useRegisterTabBarVisible(visible: boolean): void {
  const { setVisible } = useTabBarContext()

  useLayoutEffect(() => {
    setVisible(visible)
    return () => setVisible(false)
  }, [setVisible, visible])
}
