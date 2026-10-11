import {
  useModuleTabBarVisible,
  useRegisterModuleFab,
  type ModuleFabAction,
} from "@/src/shared/components/layout/module-fab-context"
import { AnimatePresence, motion } from "framer-motion"
import { Plus } from "lucide-react"
import { useState } from "react"
import { cn } from "@/src/shared/lib/utils"

type ExpandableFabAction = ModuleFabAction

export function ExpandableFab({
  actions,
  label = "Nuevo movimiento",
}: {
  actions: ExpandableFabAction[]
  label?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const tabBarVisible = useModuleTabBarVisible()
  useRegisterModuleFab({ label, actions })
  const hiddenOnMobile = tabBarVisible && "max-md:hidden"

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className={cn(
              "fixed inset-0 z-50 mb-0 bg-background/50 backdrop-blur-sm",
              hiddenOnMobile
            )}
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* FAB and actions container */}
      <div
        className={cn(
          "fixed right-4 bottom-24 z-50 flex flex-col-reverse items-end gap-3",
          hiddenOnMobile
        )}
      >
        {/* Main FAB */}
        <motion.button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Cerrar acciones" : label}
          aria-expanded={isOpen}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-white shadow-xl"
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ ease: "easeInOut" }}
        >
          <Plus className="h-5 w-5" aria-hidden />
        </motion.button>

        {/* Action buttons */}
        <AnimatePresence>
          {isOpen &&
            actions.map((action, index) => (
              <motion.button
                key={index}
                initial={{ opacity: 0, scale: 0.5, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.5, y: 20 }}
                transition={{
                  type: "spring",
                  stiffness: 200,
                  damping: 20,
                  ease: "easeInOut",
                  delay: index * 0.05,
                }}
                onClick={() => {
                  if (action.disabled) {
                    return
                  }
                  action.onClick()
                  setIsOpen(false)
                }}
              >
                <div
                  className={cn(
                    "flex cursor-pointer items-center gap-3 transition-all hover:scale-105 active:scale-95",
                    action.disabled && "cursor-not-allowed opacity-50"
                  )}
                >
                  <span className="rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium shadow-lg">
                    {action.label}
                  </span>
                  <div
                    className={`h-12 w-12 rounded-full ${action.color} flex items-center justify-center text-white shadow-lg`}
                  >
                    {action.icon}
                  </div>
                </div>
              </motion.button>
            ))}
        </AnimatePresence>
      </div>
    </>
  )
}
