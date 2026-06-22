"use client";

import { PageHeader } from "@/src/modules/landing/components/PageHeader";
import { faqCategories, faqItems } from "@/src/modules/landing/data/faq-data";
import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

function FAQItem({
  question,
  answer,
  index,
}: {
  question: string;
  answer: string;
  index: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04 }}
      className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 transition-colors hover:border-white/20"
    >
      <button
        type="button"
        title={open ? "Cerrar" : "Abrir"}
        onClick={() => setOpen(!open)}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left"
      >
        <span className="text-sm font-medium leading-relaxed">{question}</span>
        <span
          className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 transition-transform duration-200 ${open ? "rotate-45" : ""}`}
        >
          <svg
            className="h-3 w-3 text-muted-foreground"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
        </span>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <p className="border-t border-white/10 px-6 py-5 text-sm leading-relaxed text-muted-foreground">
              {answer}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export default function FAQPage() {
  const [activeCategory, setActiveCategory] = useState("General");

  const filtered = faqItems.filter(
    (item) => item.category === activeCategory,
  );

  return (
    <div>
      <PageHeader
        label="Soporte"
        title="Preguntas frecuentes"
        description="Encuentra respuestas a las preguntas más comunes sobre Personal OS, su funcionamiento y su seguridad."
        breadcrumb={[{ href: "/faq", label: "FAQ" }]}
      />

      <main className="mx-auto max-w-3xl px-6 py-16">
        {/* Category tabs */}
        <div className="mb-10 flex flex-wrap gap-2">
          {faqCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`rounded-xl px-4 py-2 text-sm font-medium transition-all duration-150 ${
                activeCategory === cat
                  ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25"
                  : "border border-white/10 bg-white/5 text-muted-foreground hover:border-white/20 hover:bg-white/8 hover:text-foreground"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* FAQ items */}
        <div className="space-y-3">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeCategory}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-3"
            >
              {filtered.map((item, i) => (
                <FAQItem
                  key={item.question}
                  question={item.question}
                  answer={item.answer}
                  index={i}
                />
              ))}
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Contact CTA */}
        <div className="mt-16 rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
          <p className="text-base font-semibold">¿No encontraste tu respuesta?</p>
          <p className="mt-2 text-sm text-muted-foreground">
            Escríbenos directamente y te responderemos a la brevedad.
          </p>
          <a
            href="/contact"
            className="mt-4 inline-block rounded-xl bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-all hover:brightness-110"
          >
            Contactar soporte
          </a>
        </div>
      </main>
    </div>
  );
}
