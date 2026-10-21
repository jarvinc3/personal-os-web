"use client"

import { InstitutionWalletCard } from "@/src/modules/finance/products/components/institution-wallet-card"
import { buildInstitutionCard } from "@/src/modules/finance/products/lib/institution-card"
import type { FinanceMoneyDisplay } from "@/src/modules/finance/shared/lib/money"
import type { InstitutionStackItem } from "@/src/modules/finance/shared/lib/institution-stack"
import { stackItemKey } from "@/src/modules/finance/shared/lib/wallet-front-persistence"
import { useEffect, useRef } from "react"
import { motion } from "framer-motion"

type InstitutionCarouselProps = {
  items: InstitutionStackItem[]
  display: FinanceMoneyDisplay
  /** Card the pile had in front; the row opens centred on it. */
  activeIndex: number
  onSelect: (item: InstitutionStackItem) => void
}

export function InstitutionCarousel({
  items,
  display,
  activeIndex,
  onSelect,
}: InstitutionCarouselProps) {
  const rowRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const row = rowRef.current
    if (!row) {
      return
    }
    const activeCard = row.children[activeIndex]
    if (!(activeCard instanceof HTMLElement)) {
      return
    }
    row.scrollLeft =
      activeCard.offsetLeft - (row.clientWidth - activeCard.clientWidth) / 2
  }, [activeIndex])

  return (
    <div
      ref={rowRef}
      role="group"
      aria-label="Instituciones desplegadas"
      className="flex snap-x snap-mandatory gap-3 overflow-x-auto overscroll-x-contain pb-2"
    >
      {items.map((item, index) => (
        <motion.div
          key={stackItemKey(item)}
          className="w-[78%] shrink-0 snap-center sm:w-[46%]"
          initial={{
            x: index * 12,
            y: index * 22,
            rotate: index * 3.5,
            scale: 1 - index * 0.05,
            opacity: 0.6,
          }}
          animate={{ x: 0, y: 0, rotate: 0, scale: 1, opacity: 1 }}
          transition={{
            type: "spring",
            stiffness: 320,
            damping: 30,
            delay: index * 0.02,
          }}
        >
          <InstitutionWalletCard
            card={buildInstitutionCard(item, display)}
            isFront={false}
            onPress={() => onSelect(item)}
          />
        </motion.div>
      ))}
    </div>
  )
}
