"use client"

import {
  FLOATING_SHEET_CONTENT_CLASS,
  getBottomSheetDirection,
  WIDE_SHEET_CONTENT_CLASS,
  type BottomSheetSize,
  type BottomSheetVariant,
} from "@/src/shared/components/sheets/bottom-sheet-variant"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/src/shared/components/ui/drawer"
import {
  AgentChatTriggerButton,
  useAgentChatLauncher,
} from "@/src/shared/components/agent-chat/agent-chat-launcher"
import { Button } from "@/src/shared/components/ui/button"
import { Spinner } from "@/src/shared/components/ui/spinner"
import { useIsMobile } from "@/src/shared/hooks/use-mobile"
import { cn } from "@/src/shared/lib/utils"
import { resolveSheetTitleFocus } from "@/src/shared/components/sheets/sheet-focus"
import { XIcon } from "lucide-react"
import { Fragment, useRef, type ReactNode } from "react"

const DEFAULT_CLOSE_LABEL = "Cancelar"

interface BottomSheetProps {
  open: boolean
  variant?: BottomSheetVariant
  /** `wide` ensancha el drawer derecho desde `md` para mostrar dos columnas. */
  size?: BottomSheetSize
  onOpenChange: (open: boolean) => void
  title: string
  description?: string
  pending?: boolean
  children: ReactNode
  headerAction?: ReactNode
  headerActionAlign?: "start" | "end"
  actions?: {
    delete?: ReactNode
    close?: ReactNode
    submit?: ReactNode
  }
  /** Hides the default close action when the sheet has nothing to cancel. */
  showClose?: boolean
  /** Wording of the default close action, e.g. "Cerrar" on a read-only sheet. */
  closeLabel?: string
  /** Lleva el foco inicial al título de la hoja en vez del contenedor del popup. */
  focusTitleOnOpen?: boolean
  /** El botón del agente se oculta en hojas internas del propio overlay. */
  showAgentTrigger?: boolean
  /** Sube la capa cuando la hoja se abre sobre otro overlay. */
  layerClassName?: string
}

export function BottomSheet({
  open,
  variant = "default",
  size = "default",
  onOpenChange,
  title,
  description,
  pending = false,
  children,
  headerAction,
  headerActionAlign = "end",
  actions,
  showClose = true,
  closeLabel = DEFAULT_CLOSE_LABEL,
  focusTitleOnOpen = false,
  showAgentTrigger = true,
  layerClassName,
}: BottomSheetProps) {
  const isMobile = useIsMobile()
  const agentChat = useAgentChatLauncher()
  const swipeDirection = getBottomSheetDirection(variant, isMobile)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const sheetFocus = resolveSheetTitleFocus(focusTitleOnOpen)
  const closeAction =
    actions?.close ??
    (showClose ? (
      <Button
        type="button"
        variant="outline"
        className="flex-1"
        onClick={() => onOpenChange(false)}
      >
        <XIcon className="size-4 shrink-0" aria-hidden="true" />
        {closeLabel}
      </Button>
    ) : null)
  const agentAction =
    showAgentTrigger && !pending && agentChat.available ? (
      <AgentChatTriggerButton />
    ) : null
  const headerActionVisible = Boolean(headerAction || agentAction)
  const actionEntries = (
    [
      ["delete", actions?.delete],
      ["close", closeAction],
      ["submit", actions?.submit],
    ] as const
  ).filter(([, node]) => node != null && node !== false)
  return (
    <Drawer
      swipeDirection={swipeDirection}
      open={open}
      onOpenChange={onOpenChange}
    >
      <DrawerContent
        initialFocus={sheetFocus.focusesTitle ? titleRef : undefined}
        layerClassName={layerClassName}
        className={cn(
          variant === "floating" && FLOATING_SHEET_CONTENT_CLASS,
          variant === "default" && size === "wide" && WIDE_SHEET_CONTENT_CLASS
        )}
      >
        <DrawerHeader className="relative -space-y-2 pb-4">
          <DrawerTitle
            ref={titleRef}
            tabIndex={sheetFocus.titleTabIndex}
            className={headerActionVisible ? "px-20" : undefined}
          >
            {pending ? "Cargando" : title}
          </DrawerTitle>
          <DrawerDescription
            className={cn(
              "text-muted-foreground",
              !pending && description ? "" : "hidden"
            )}
          >
            {description}
          </DrawerDescription>
          {headerActionAlign === "start" && headerAction && !pending ? (
            <div className="absolute top-1/2 left-3 -translate-y-1/2">
              {headerAction}
            </div>
          ) : null}
          {headerActionVisible && !pending ? (
            <div className="absolute top-1/2 right-3 flex -translate-y-1/2 items-center gap-1">
              {headerActionAlign === "end" ? headerAction : null}
              {agentAction}
            </div>
          ) : null}
        </DrawerHeader>

        <div
          data-base-ui-swipe-ignore=""
          className="scrollbar-hide flex flex-col gap-4 overflow-y-auto p-4"
        >
          {pending ? (
            <div className="flex justify-center py-12">
              <Spinner />
            </div>
          ) : (
            children
          )}
        </div>

        {actionEntries.length > 0 && !pending && (
          <DrawerFooter className="mt-4 flex w-full flex-row items-center justify-end gap-2 pt-4">
            {actionEntries.map(([actionName, node]) => (
              <Fragment key={actionName}>{node}</Fragment>
            ))}
          </DrawerFooter>
        )}
      </DrawerContent>
    </Drawer>
  )
}
