"use client"

import {
  createContext,
  useContext,
  useLayoutEffect,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react"

export type ModuleFabAction = {
  icon: ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  color: string
}

export type ModuleFabRegistration = {
  label: string
  actions: ModuleFabAction[]
}

type Listener = () => void

type FabStore = {
  get: () => ModuleFabRegistration | null
  set: (value: ModuleFabRegistration | null) => void
  subscribe: (listener: Listener) => () => void
}

function createFabStore(): FabStore {
  let snapshot: ModuleFabRegistration | null = null
  const listeners = new Set<Listener>()

  return {
    get: () => snapshot,
    set: (value) => {
      snapshot = value
      listeners.forEach((listener) => listener())
    },
    subscribe: (listener) => {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}

type ModuleFabContextValue = {
  tabBarVisible: boolean
  store: FabStore
}

const ModuleFabContext = createContext<ModuleFabContextValue | null>(null)

export function ModuleFabProvider({
  tabBarVisible,
  children,
}: {
  tabBarVisible: boolean
  children: ReactNode
}) {
  const [store] = useState(createFabStore)

  const value = useMemo(
    () => ({ tabBarVisible, store }),
    [tabBarVisible, store]
  )

  return (
    <ModuleFabContext.Provider value={value}>
      {children}
    </ModuleFabContext.Provider>
  )
}

function subscribeNothing() {
  return () => {}
}

function getNothing() {
  return null
}

export function useModuleFabRegistration() {
  const context = useContext(ModuleFabContext)
  return useSyncExternalStore(
    context?.store.subscribe ?? subscribeNothing,
    context?.store.get ?? getNothing,
    getNothing
  )
}

export function useModuleTabBarVisible() {
  return useContext(ModuleFabContext)?.tabBarVisible ?? false
}

export function useRegisterModuleFab(registration: ModuleFabRegistration) {
  const store = useContext(ModuleFabContext)?.store

  useLayoutEffect(() => {
    store?.set(registration)
  }, [registration, store])

  useLayoutEffect(() => {
    return () => store?.set(null)
  }, [store])
}
