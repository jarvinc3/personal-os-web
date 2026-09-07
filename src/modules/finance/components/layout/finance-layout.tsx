"use client"

import { FINANCE_NAV_ITEMS } from "@/src/modules/finance/constants/nav";
import { ModuleSectionLayout } from "@/src/shared/components/layout/module-section-layout";
import type { ReactNode } from "react";

export function FinanceLayout({ children }: { children: ReactNode }) {
  return (
    <ModuleSectionLayout
      items={FINANCE_NAV_ITEMS.filter((item) => item.showInTabBar !== false)}
      ariaLabel="Secciones de Finanzas"
    >
      {children}
    </ModuleSectionLayout>
  )
}
