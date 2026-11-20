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
  return useContext(TabBarVisibilityContext)?.visible ?? false
}

export function useRegisterTabBarVisible(visible: boolean): void {
  const setVisible = useContext(TabBarVisibilityContext)?.setVisible

  useLayoutEffect(() => {
    if (!setVisible) {
      return
    }
    setVisible(visible)
    return () => setVisible(false)
  }, [setVisible, visible])
}
