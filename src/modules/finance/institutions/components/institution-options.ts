import type { RecordOption } from "@/src/modules/finance/shared/components/record-options-sheet"
import {
  ArchiveIcon,
  CreditCardIcon,
  HandCoinsIcon,
  LandmarkIcon,
  PencilIcon,
  Trash2Icon,
} from "lucide-react"

type InstitutionOptionActions = {
  onEdit: () => void
  onNewAccount: () => void
  onNewCard: () => void
  onNewLoan: () => void
  onArchive: () => void
  onDelete: () => void
}

type InstitutionOptionsInput = {
  isCash: boolean
  busy: boolean
  actions: InstitutionOptionActions
}

export function buildInstitutionOptions({
  isCash,
  busy,
  actions,
}: InstitutionOptionsInput): RecordOption[] {
  if (isCash) {
    return [
      {
        id: "new-account",
        title: "Nueva cuenta",
        icon: LandmarkIcon,
        onPress: actions.onNewAccount,
      },
    ]
  }

  return [
    {
      id: "edit",
      title: "Editar institución",
      icon: PencilIcon,
      onPress: actions.onEdit,
    },
    {
      id: "new-account",
      title: "Nueva cuenta",
      icon: LandmarkIcon,
      onPress: actions.onNewAccount,
    },
    {
      id: "new-card",
      title: "Nueva tarjeta",
      icon: CreditCardIcon,
      onPress: actions.onNewCard,
    },
    {
      id: "new-loan",
      title: "Nuevo préstamo",
      icon: HandCoinsIcon,
      onPress: actions.onNewLoan,
    },
    {
      id: "archive",
      title: "Archivar",
      icon: ArchiveIcon,
      disabled: busy,
      onPress: actions.onArchive,
    },
    {
      id: "delete",
      title: "Eliminar",
      icon: Trash2Icon,
      destructive: true,
      disabled: busy,
      onPress: actions.onDelete,
    },
  ]
}
