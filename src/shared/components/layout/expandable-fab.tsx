import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { useState } from "react";
import { cn } from "../../lib/utils";

type ExpandableFabAction = {
  icon: React.ReactNode
  label: string
  onClick: () => void
  disabled?: boolean
  color: string
}

export function ExpandableFab({ actions }: { actions: ExpandableFabAction[] }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* Backdrop */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 mb-0 backdrop-blur-sm bg-background/50"
            onClick={() => setIsOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* FAB and actions container */}
      <div className="flex fixed right-4 bottom-24 z-50 flex-col-reverse gap-3 items-end">
        {/* Main FAB */}
        <motion.button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          aria-label={isOpen ? "Cerrar acciones" : "Nuevo movimiento"}
          aria-expanded={isOpen}
          className="flex justify-center items-center w-12 h-12 text-white rounded-full shadow-xl bg-primary"
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ ease: "easeInOut" }}
        >
          <Plus className="w-5 h-5" aria-hidden />
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
                transition={{ type: "spring", stiffness: 200, damping: 20, ease: "easeInOut", delay: index * 0.05 }}
                onClick={() => {
                  if (action.disabled) return
                  action.onClick()
                  setIsOpen(false)
                }}
              >
                <div className={cn("flex gap-3 items-center transition-all cursor-pointer active:scale-95 hover:scale-105", action.disabled && "opacity-50 cursor-not-allowed")}>
                  <span className="px-3 py-2 text-sm font-medium rounded-xl border shadow-lg bg-card border-border">
                    {action.label}
                  </span>
                  <div
                    className={`h-12 w-12 rounded-full ${action.color} text-white flex items-center justify-center shadow-lg`}
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
