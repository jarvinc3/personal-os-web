import {
  useModuleTabBarVisible,
  useRegisterModuleFab,
  type ModuleFabAction,
} from "@/src/shared/components/fab/module-fab-context"
import { useAgentChatLauncher } from "@/src/shared/components/agent-chat/agent-chat-launcher"
import { ProgressRing } from "@/src/shared/components/data-display/progress-ring"
import { useHoldProgress } from "@/src/shared/hooks/use-hold-progress"
import { AnimatePresence, motion } from "framer-motion"
import { Plus } from "lucide-react"
import { useState } from "react"
import { cn } from "@/src/shared/lib/utils"

type ExpandableFabAction = ModuleFabAction

export function ExpandableFab({
  actions,
  label = "Acciones",
}: {
  actions: ExpandableFabAction[]
  label?: string
}) {
  const [isOpen, setIsOpen] = useState(false)
  const tabBarVisible = useModuleTabBarVisible()
  const agentChat = useAgentChatLauncher()
  const longPress = useHoldProgress({
    disabled: !agentChat.available,
    onLongPress: () => {
      if (!agentChat.available) {
        return
      }
      setIsOpen(false)
      agentChat.launch()
    },
  })
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
        {/* Button to open the actions */}
        <motion.button
          type="button"
          onClick={() => {
            if (longPress.consumeSuppressedClick()) {
              return
            }
            setIsOpen(!isOpen)
          }}
          {...longPress.handlers}
          aria-label={isOpen ? "Cerrar acciones" : label}
          aria-expanded={isOpen}
          className="relative flex h-12 w-12 touch-none items-center justify-center rounded-full bg-primary text-white shadow-xl select-none"
          animate={{ rotate: isOpen ? 45 : 0 }}
          transition={{ ease: "easeInOut" }}
        >
          {longPress.progress > 0 ? (
            <ProgressRing
              value={longPress.progress}
              size={48}
              thickness={2}
              arcClassName="stroke-white"
              trackClassName="stroke-transparent"
              className="pointer-events-none absolute inset-0"
            />
          ) : null}
          <Plus className="h-5 w-5" aria-hidden />
        </motion.button>

        {/* Buttons for the actions */}
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
