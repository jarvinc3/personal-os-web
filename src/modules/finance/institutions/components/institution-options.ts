"use client"

import type { RecordOption } from "@/src/modules/finance/shared/components/record-options-sheet"
import {
  ArchiveIcon,
  CreditCardIcon,
  HandCoinsIcon,
  LandmarkIcon,
  MailIcon,
  PencilIcon,
  RefreshCwIcon,
  Trash2Icon,
} from "lucide-react"

type InstitutionOptionsInput = {
  linkedMailboxEmail: string | null
  hasLinkedSource: boolean
  emailSyncEnabled: boolean
  syncPending: boolean
  busy: boolean
  onEdit: () => void
  onNewAccount: () => void
  onNewCard: () => void
  onNewLoan: () => void
  onLinkMailbox: () => void
  onSyncMailbox: () => void
  onArchive: () => void
  onDelete: () => void
}

export function buildInstitutionOptions({
  linkedMailboxEmail,
  hasLinkedSource,
  emailSyncEnabled,
  syncPending,
  busy,
  onEdit,
  onNewAccount,
  onNewCard,
  onNewLoan,
  onLinkMailbox,
  onSyncMailbox,
  onArchive,
  onDelete,
}: InstitutionOptionsInput): RecordOption[] {
  const linkMailboxOption: RecordOption = {
    id: "link-mailbox",
    title: "Vincular correo",
    description: linkedMailboxEmail
      ? `Conectada a ${linkedMailboxEmail}`
      : "Liga un Gmail ya conectado",
    icon: MailIcon,
    disabled: Boolean(linkedMailboxEmail),
    showChevron: !linkedMailboxEmail,
    onPress: onLinkMailbox,
  }

  const syncMailboxOption: RecordOption = {
    id: "sync-mailbox",
    title: "Sincronizar correo",
    description: emailSyncEnabled
      ? "Leer transacciones nuevas del banco"
      : "Actívala en Ajustes → Finanzas",
    icon: RefreshCwIcon,
    disabled: !emailSyncEnabled || syncPending,
    showChevron: false,
    onPress: onSyncMailbox,
  }

  return [
    {
      id: "edit",
      title: "Editar institución",
      icon: PencilIcon,
      onPress: onEdit,
    },
    {
      id: "new-account",
      title: "Nueva cuenta",
      icon: LandmarkIcon,
      onPress: onNewAccount,
    },
    {
      id: "new-card",
      title: "Nueva tarjeta",
      icon: CreditCardIcon,
      onPress: onNewCard,
    },
    {
      id: "new-loan",
      title: "Nuevo préstamo",
      icon: HandCoinsIcon,
      onPress: onNewLoan,
    },
    linkMailboxOption,
    ...(hasLinkedSource ? [syncMailboxOption] : []),
    {
      id: "archive",
      title: "Archivar",
      icon: ArchiveIcon,
      disabled: busy,
      onPress: onArchive,
    },
    {
      id: "delete",
      title: "Eliminar",
      icon: Trash2Icon,
      destructive: true,
      disabled: busy,
      onPress: onDelete,
    },
  ]
}
