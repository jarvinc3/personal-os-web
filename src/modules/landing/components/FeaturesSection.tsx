"use client";

import { motion } from "motion/react";
import { appFeatures } from "../data/modules-data";
import { landingContent } from "../data/site-info";

export function FeaturesSection() {
  return (
    <section id="features" className="relative px-6 py-24">
      {/* Simple decorative line */}
      <div className="absolute top-0 left-0 w-full">
        <div className="mx-auto w-96 max-w-full h-px bg-border" />
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
            {landingContent.features.badge}
          </motion.span>
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
            className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl"
          >
            {landingContent.features.title}
          </motion.h2>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.2 }}
            className="mx-auto mt-4 max-w-xl text-base text-muted-foreground sm:text-lg"
          >
            {landingContent.features.description}
          </motion.p>
        </div>

        {/* Features grid */}
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {appFeatures.map((feature, i) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.07 }}
              className="group relative overflow-hidden rounded-2xl border-2 border-text bg-white p-6 text-left shadow-[4px_4px_0px_0px_#111827] transition-all duration-300 hover:-translate-y-1 hover:translate-x-1 hover:shadow-[6px_6px_0px_0px_var(--color-primary)]"
            >
              <div className="relative">
                {/* Icon */}
                <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl border-2 border-text bg-accent text-2xl shadow-[2px_2px_0px_0px_#111827]">
                  {feature.icon}
                </div>

                <h3 className="mb-2 text-lg font-bold text-text">
                  {feature.title}
                </h3>
                <p className="text-sm font-medium text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
