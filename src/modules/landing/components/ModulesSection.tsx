"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";
import { appModules } from "../data/modules-data";
import { landingContent } from "../data/site-info";

const statusLabels: Record<string, { label: string; color: string }> = {
  available: { label: landingContent.modules.labels.available, color: "text-emerald-400 bg-emerald-400/10 border-emerald-400/30" },
  in_design: { label: landingContent.modules.labels.in_design, color: "text-amber-400 bg-amber-400/10 border-amber-400/30" },
  coming_soon: { label: landingContent.modules.labels.coming_soon, color: "text-blue-400 bg-blue-400/10 border-blue-400/30" },
};

export function ModulesSection() {
  const [activeModule, setActiveModule] = useState(appModules[0]);

  return (
    <section id="modules" className="relative px-6 py-24">
      {/* Simple decorative line */}
      <div className="absolute top-0 left-0 w-full">
        <div className="mx-auto h-px w-96 max-w-full bg-border" />
      </div>

      <div className="mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 text-center">
          <motion.span
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-4 inline-block rounded-full border-2 border-text bg-accent px-3 py-1 text-xs font-bold text-primary shadow-[2px_2px_0px_0px_#111827]"
          >
            {landingContent.modules.badge}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
          >
            {landingContent.modules.titleStart}
            <br />
            <span className="text-primary">
              {landingContent.modules.titleHighlight}
            </span>
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg"
          >
            {landingContent.modules.description}
          </motion.p>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Module selector */}
          <div className="space-y-3">
            {appModules.map((module, i) => {
              const isActive = activeModule.id === module.id;
              const status = statusLabels[module.status];
              return (
                <motion.button
                  key={module.id}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.07 }}
                  onClick={() => setActiveModule(module)}
                  className={`w-full rounded-2xl border-2 p-4 text-left transition-all duration-200 ${isActive
                      ? "border-text bg-accent shadow-[4px_4px_0px_0px_#111827]"
                      : "border-text bg-white shadow-[2px_2px_0px_0px_#111827] hover:translate-x-1 hover:translate-y-1 hover:shadow-none"
                    }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{module.icon}</span>
                      <div>
                        <p className="text-sm font-semibold">{module.name}</p>
                        <p className="mt-0.5 line-clamp-1 text-xs text-muted-foreground">
                          {module.description}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`shrink-0 rounded-full border-2 border-text px-2 py-0.5 text-xs font-bold shadow-[1px_1px_0px_0px_#111827] ${status.color}`}
                    >
                      {status.label}
                    </span>
                  </div>
                </motion.button>
              );
            })}
          </div>

          {/* Module detail */}
          <div className="sticky top-24 self-start">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeModule.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className={`overflow-hidden rounded-3xl border-2 border-text ${activeModule.bgColor} p-8 shadow-[8px_8px_0px_0px_#111827]`}
              >
                {/* Module header */}
                <div className="mb-6 flex items-start justify-between">
                  <div>
                    <span className="text-4xl">{activeModule.icon}</span>
                    <h3 className={`mt-3 text-2xl font-bold ${activeModule.color}`}>{activeModule.name}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-text">
                      {activeModule.description}
                    </p>
                  </div>
                </div>

                {/* Features list */}
                <div className="space-y-2.5">
                  <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                    Características
                  </p>
                  {activeModule.features.map((feature) => (
                    <div
                      key={feature}
                      className="flex items-start gap-2.5"
                    >
                      <div className="mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border border-text bg-white shadow-[1px_1px_0px_0px_#111827]">
                        <svg
                          className="h-2.5 w-2.5 text-text"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={3}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </div>
                      <span className="text-sm font-medium text-text">{feature}</span>
                    </div>
                  ))}
                </div>

                {/* Coming soon note */}
                {activeModule.status !== "available" && (
                  <div className="mt-6 rounded-xl border-2 border-text bg-white p-3 text-xs font-semibold text-text shadow-[2px_2px_0px_0px_#111827]">
                    {landingContent.modules.comingSoonNote}
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
