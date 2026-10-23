import { BudgetCard } from "@/src/modules/card-gallery/provisional/budget-card"
import { GoalCard } from "@/src/modules/card-gallery/provisional/goal-card"
import { ReceivableCard } from "@/src/modules/card-gallery/provisional/receivable-card"
import {
  galleryBudget,
  galleryCompletedGoal,
  galleryExceededBudget,
  galleryReceivable,
  galleryRiskyBudget,
  gallerySavingsGoal,
} from "@/src/modules/card-gallery/mock/finance"
import type { GalleryVariant } from "@/src/modules/card-gallery/variants/types"

/** PROVISIONAL (#272): goal variants until #273 extracts `GoalCard`. */
export const goalVariants: readonly GalleryVariant[] = [
  {
    id: "meta-completa",
    label: "Completa",
    propLabel: 'variant="full" (por defecto)',
    height: "≈ 150 px",
    render: ({ display, notifyTap }) => (
      <GoalCard
        goal={gallerySavingsGoal}
        display={display}
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "meta-compacta",
    label: "Compacta",
    propLabel: 'variant="compact"',
    height: "≈ 64 px",
    render: ({ display, notifyTap }) => (
      <GoalCard
        goal={gallerySavingsGoal}
        display={display}
        variant="compact"
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "meta-inline",
    label: "Inline",
    propLabel: 'variant="inline"',
    height: "≈ 28 px",
    render: ({ display, notifyTap }) => (
      <GoalCard
        goal={gallerySavingsGoal}
        display={display}
        variant="inline"
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "meta-superada",
    label: "Superada",
    propLabel: "currentAmount > targetAmount",
    height: "≈ 150 px",
    render: ({ display, notifyTap }) => (
      <GoalCard
        goal={galleryCompletedGoal}
        display={display}
        onPress={notifyTap}
      />
    ),
  },
]

/** PROVISIONAL (#272): receivable variants until #273 extracts `ReceivableCard`. */
export const receivableVariants: readonly GalleryVariant[] = [
  {
    id: "cobro-completa",
    label: "Completa",
    propLabel: 'variant="full" (por defecto)',
    height: "≈ 160 px",
    render: ({ display, notifyTap }) => (
      <ReceivableCard
        receivable={galleryReceivable}
        display={display}
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "cobro-compacta",
    label: "Compacta",
    propLabel: 'variant="compact"',
    height: "≈ 64 px",
    render: ({ display, notifyTap }) => (
      <ReceivableCard
        receivable={galleryReceivable}
        display={display}
        variant="compact"
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "cobro-inline",
    label: "Inline",
    propLabel: 'variant="inline"',
    height: "≈ 28 px",
    render: ({ display, notifyTap }) => (
      <ReceivableCard
        receivable={galleryReceivable}
        display={display}
        variant="inline"
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "cobro-seleccionada",
    label: "Seleccionada para compartir",
    propLabel: "selection.selected",
    height: "≈ 160 px",
    render: ({ display, notifyTap }) => (
      <ReceivableCard
        receivable={galleryReceivable}
        display={display}
        selected
        onPress={notifyTap}
      />
    ),
  },
]

/** PROVISIONAL (#272): budget variants until #273 extracts `BudgetCard`. */
export const budgetVariants: readonly GalleryVariant[] = [
  {
    id: "presupuesto-completa",
    label: "Completa normal",
    propLabel: 'variant="full" (por defecto)',
    height: "≈ 160 px",
    render: ({ display, notifyTap }) => (
      <BudgetCard
        budget={galleryBudget}
        display={display}
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "presupuesto-compacta",
    label: "Compacta",
    propLabel: 'variant="compact"',
    height: "≈ 64 px",
    render: ({ display, notifyTap }) => (
      <BudgetCard
        budget={galleryBudget}
        display={display}
        variant="compact"
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "presupuesto-inline",
    label: "Inline",
    propLabel: 'variant="inline"',
    height: "≈ 28 px",
    render: ({ display, notifyTap }) => (
      <BudgetCard
        budget={galleryBudget}
        display={display}
        variant="inline"
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "presupuesto-riesgo",
    label: "En riesgo",
    propLabel: "pct >= alertThresholdPct",
    height: "≈ 160 px",
    render: ({ display, notifyTap }) => (
      <BudgetCard
        budget={galleryRiskyBudget}
        display={display}
        onPress={notifyTap}
      />
    ),
  },
  {
    id: "presupuesto-excedido",
    label: "Excedido",
    propLabel: "pct >= 100",
    height: "≈ 160 px",
    render: ({ display, notifyTap }) => (
      <BudgetCard
        budget={galleryExceededBudget}
        display={display}
        onPress={notifyTap}
      />
    ),
  },
]
